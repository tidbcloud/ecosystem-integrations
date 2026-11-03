const assert = require('assert').strict;
const { execFileSync } = require('child_process');
const fs = require('fs');
const Module = require('module');
const net = require('net');
const os = require('os');
const path = require('path');
const tls = require('tls');
const mysql = require('mysql2/promise');
const urllib = require('urllib');
const ts = require('typescript');
// Test the current source without depending on generated dist files.
const sourcePath = path.resolve(__dirname, '../nodes/TiDBCloud/GenericFunctions.ts');
const sourceModule = new Module(sourcePath, module);
sourceModule.filename = sourcePath;
sourceModule.paths = module.paths;
sourceModule._compile(ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, sourcePath);
const { createConnection } = sourceModule.exports;
const mysqlDirectory = path.dirname(require.resolve('mysql2'));
const Handshake = require(path.join(mysqlDirectory, 'lib/packets/handshake'));
const flags = require(path.join(mysqlDirectory, 'lib/constants/client'));

async function main() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'n8n-tls-'));
	const sockets = new Set();
	const originalRequest = urllib.request;
	const originalConnect = mysql.createConnection;
	let authenticationReceived = false;
	let server;
	try {
		// Temporary test credentials only; no private keys are stored in the repository.
		execFileSync('openssl', [
			'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
			'-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost',
			'-keyout', path.join(directory, 'key.pem'), '-out', path.join(directory, 'cert.pem'),
		], { stdio: 'ignore' });
		const certificate = fs.readFileSync(path.join(directory, 'cert.pem'), 'utf8');
		const secureContext = tls.createSecureContext({
			key: fs.readFileSync(path.join(directory, 'key.pem')),
			cert: certificate,
			minVersion: 'TLSv1.2',
		});
		server = net.createServer((socket) => {
			sockets.add(socket);
			socket.setTimeout(5000, () => socket.destroy());
			socket.on('close', () => sockets.delete(socket));
			socket.on('error', () => {});
			const hello = new Handshake({
				protocolVersion: 10, serverVersion: '5.7.0', connectionId: 1,
				statusFlags: 2, characterSet: 45,
				capabilityFlags: flags.PROTOCOL_41 | flags.SECURE_CONNECTION | flags.SSL,
				authPluginData1: Buffer.alloc(8, 1), authPluginData2: Buffer.alloc(12, 2),
			});
			const packet = hello.toPacket(0);
			packet.writeHeader(0);
			socket.write(packet.buffer);
			let request = Buffer.alloc(0);
			const upgrade = (data) => {
				request = Buffer.concat([request, data]);
				if (request.length < 36) return;
				// MySQL SSLRequest can arrive together with the TLS ClientHello.
				socket.pause();
				socket.removeListener('data', upgrade);
				if (request.length > 36) socket.unshift(request.subarray(36));
				const secureSocket = new tls.TLSSocket(socket, { isServer: true, secureContext });
				secureSocket.resume();
				secureSocket.on('error', () => {});
				secureSocket.once('data', () => {
					authenticationReceived = true;
					// MySQL OK packet, sequence 3, completes the authentication exchange.
					secureSocket.write(Buffer.from([7, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0]));
				});
			};
			socket.on('data', upgrade);
		});
		await new Promise((resolve, reject) => {
			server.once('error', reject);
			server.listen(0, '127.0.0.1', resolve);
		});
		const port = server.address().port;
		urllib.request = async () => ({
			status: 200,
			data: { status: { connection_strings: { standard: { host: '127.0.0.1', port } } } },
		});
		const context = {
			getCredentials: async () => ({ publicKey: 'test', privateKey: 'test' }),
			getNodeParameter: (name) => ({
				project: { value: 'test' }, cluster: { value: 'test' }, user: { value: 'test' },
				password: 'test-password', database: 'test',
			})[name],
		};
		mysql.createConnection = (options) => {
			assert.equal(options.ssl.rejectUnauthorized, true);
			assert.equal(options.ssl.minVersion, 'TLSv1.2');
			return originalConnect(options);
		};
		// Exercise the production API-to-connection path with the default trust store.
		await assert.rejects(createConnection.call(context), /self.signed certificate/i);
		assert.equal(authenticationReceived, false);
		console.log('PASS: untrusted certificate rejected before MySQL authentication');

		// Positive control: the same endpoint works when its CA is explicitly trusted.
		const connection = await createConnection.call(context, {
			host: '127.0.0.1', port, user: 'test', password: 'test-password', database: 'test',
			enableTls: true, caCertificate: certificate,
		});
		assert.equal(authenticationReceived, true);
		connection.destroy();
		console.log('PASS: explicitly trusted certificate completes MySQL authentication');
	} finally {
		urllib.request = originalRequest;
		mysql.createConnection = originalConnect;
		for (const socket of sockets) socket.destroy();
		if (server) await new Promise((resolve) => server.close(resolve));
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
