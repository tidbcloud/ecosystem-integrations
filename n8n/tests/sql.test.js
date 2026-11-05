const assert = require('assert').strict;
const fs = require('fs');
const Module = require('module');
const path = require('path');
const ts = require('typescript');
const mysql = require('mysql2/promise');
const urllib = require('urllib');

// Exercise current handlers without depending on generated dist files or a live database.
function loadSource(relativePath, dependencies = {}) {
	const filename = path.resolve(__dirname, relativePath);
	const sourceModule = new Module(filename, module);
	sourceModule.filename = filename;
	sourceModule.paths = module.paths;
	const originalRequire = sourceModule.require.bind(sourceModule);
	sourceModule.require = name => dependencies[name] || originalRequire(name);
	sourceModule._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
	}).outputText, filename);
	return sourceModule.exports;
}

const functions = loadSource('../nodes/TiDBCloud/GenericFunctions.ts');
const { TiDBCloud } = loadSource('../nodes/TiDBCloud/TiDBCloud.node.ts', {
	'./GenericFunctions': functions,
});

async function main() {
	const originalConnect = mysql.createConnection;
	const originalRequest = urllib.request;
	const calls = [];
	const preparedCalls = [];
	let connectionOptions;
	const connection = {
		query: async (sql, values) => {
			calls.push({ sql, values });
			return [sql.includes('information_schema.tables') ? [{ table_name: 'users' }] : {}];
		},
		execute: async (sql, values) => {
			preparedCalls.push({ sql, values });
			return [[{ id: 7 }]];
		},
		end: async () => {},
	};
	const parameters = {
		project: { value: 'test-project' }, cluster: { value: 'test-cluster' },
		user: { value: 'test-user' }, password: 'test-password', database: 'test',
	};
	const context = overrides => ({
		getNodeParameter: (key, index, fallback) => {
			const value = ({ ...parameters, ...overrides })[key];
			return value === undefined ? fallback : typeof value === 'function' ? value(index) : value;
		},
		getCredentials: async () => ({ publicKey: 'test-public', privateKey: 'test-private' }),
		getNode: () => ({}),
		continueOnFail: () => false,
		helpers: {
			returnJsonArray: result => [{ json: result }],
			constructExecutionMetaData: items => items,
		},
		prepareOutputData: result => [result],
	});
	const execute = async (params, json = {}) => {
		calls.length = 0;
		preparedCalls.length = 0;
		await TiDBCloud.prototype.execute.call({
			...context(params), getInputData: () => Array.isArray(json) ? json.map(item => ({ json: item })) : [{ json }],
		});
		return calls[0];
	};
	try {
		mysql.createConnection = async options => {
			connectionOptions = options;
			return connection;
		};
		urllib.request = async () => ({
			status: 200,
			data: { status: { connection_strings: { standard: { host: 'localhost', port: 4000 } } } },
		});

		const sql = 'SELECT id FROM users WHERE email = ? AND active = ? AND deleted_at <=> ?';
		const payload = "x' OR 1=1 -- ";
		await execute({ operation: 'executeSQL', query: sql, queryParameters: JSON.stringify([payload, true, null]) });
		assert.deepEqual(preparedCalls, [{ sql, values: [payload, true, null] }]);
		assert.equal(calls.length, 0);

		await execute({
			operation: 'executeSQL', query: 'SELECT id FROM users WHERE id = ?',
			queryParameters: index => [index + 1],
			user: { mode: 'name', value: 'workflow_reader' },
		}, [{}, {}]);
		assert.equal(connectionOptions.user, 'workflow_reader');
		assert.deepEqual(preparedCalls, [
			{ sql: 'SELECT id FROM users WHERE id = ?', values: [1] },
			{ sql: 'SELECT id FROM users WHERE id = ?', values: [2] },
		]);
		assert.equal(calls.length, 0);

		for (const queryParameters of [undefined, '[]', []]) {
			assert.deepEqual(await execute({ operation: 'executeSQL', query: 'CREATE TABLE test (id INT)', queryParameters }), {
				sql: 'CREATE TABLE test (id INT)', values: undefined,
			});
			assert.equal(preparedCalls.length, 0);
		}
		for (const queryParameters of ['{}', 'null', '42', '"value"', {}, null]) {
			await assert.rejects(execute({ operation: 'executeSQL', query: sql, queryParameters }), /Query Parameters must be a JSON array/);
			assert.equal(calls.length + preparedCalls.length, 0);
		}
		await assert.rejects(execute({ operation: 'executeSQL', query: sql, queryParameters: '[invalid' }), SyntaxError);
		assert.equal(calls.length + preparedCalls.length, 0);

		for (const [input, expected] of [
			['order', '`order`'], ['a.b', '`a.b`'], ['some name', '`some name`'],
			['a`b', '`a``b`'], ['1=1 OR id', '`1=1 OR id`'],
		]) {
			assert.equal(functions.escapeIdentifier(input), expected);
		}
		for (const input of [undefined, null, '', ['id', 'name'], {}, 1]) {
			assert.throws(() => functions.escapeIdentifier(input), /non-empty string/);
		}

		assert.deepEqual(await execute({
			operation: 'delete', table: 'users` WHERE 1=1 -- ', deleteKey: '1=1 OR id',
		}), {
			sql: 'DELETE FROM `users`` WHERE 1=1 -- ` WHERE `1=1 OR id` =  ?;',
			values: [null],
		});

		assert.deepEqual(await execute({
			operation: 'delete', table: 'users', deleteKey: 'id',
		}, { id: '7 OR 1=1' }), {
			sql: 'DELETE FROM `users` WHERE `id` =  ?;', values: ['7 OR 1=1'],
		});

		assert.deepEqual(await execute({
			operation: 'update', table: 'a.b', updateKey: '1=1 OR id', columns: 'name` = NULL -- ',
		}, { '1=1 OR id': 7, 'name` = NULL --': 'changed' }), {
			sql: 'UPDATE `a.b` SET `1=1 OR id` = ?,`name`` = NULL --` = ? WHERE `1=1 OR id` = ?;',
			values: [7, 'changed', 7],
		});

		assert.deepEqual(await execute({
			operation: 'update', table: 'users', updateKey: 'id', columns: 'id, name',
		}, { id: 7, name: "O'Reilly" }), {
			sql: 'UPDATE `users` SET `id` = ?,`name` = ? WHERE `id` = ?;',
			values: [7, "O'Reilly", 7],
		});

		for (const priority of [undefined, '', 'LOW_PRIORITY', 'HIGH_PRIORITY']) {
			assert.deepEqual(await execute({
				operation: 'insert', table: 'a.b', columns: 'select, a`b', options: { priority, ignore: true },
			}, { select: "O'Reilly", 'a`b': 'value' }), {
				sql: `INSERT ${priority || ''} IGNORE INTO \`a.b\`(\`select\`,\`a\`\`b\`) VALUES (?,?);`,
				values: ["O'Reilly", 'value'],
			});
		}
		for (const priority of ['LOW_PRIORITY IGNORE INTO other_table SELECT * FROM secret -- ', 1, {}]) {
			await assert.rejects(execute({
				operation: 'insert', table: 'users', columns: 'id', options: { priority },
			}, { id: 7 }), /Invalid INSERT priority/);
			assert.equal(calls.length, 0);
		}

		calls.length = 0;
		const database = "test' OR 1=1 -- ";
		const search = "x' UNION SELECT 'secret' -- ";
		const result = await functions.searchTables.call({
			...context(), getCurrentNodeParameter: () => database,
		}, search);
		assert.match(calls[0].sql, /WHERE table_schema = \?\s+and table_name like \?/);
		assert.deepEqual(calls[0].values, [database, `%${search}%`]);
		assert(!calls[0].sql.includes(database));
		assert(!calls[0].sql.includes(search));
		assert.deepEqual(result, { results: [{ name: 'users', value: 'users' }] });
		await functions.searchTables.call({
			...context(), getCurrentNodeParameter: () => 'test',
		});
		assert.deepEqual(calls[1].values, ['test', '%%']);
		console.log('SQL identifier, prepared query parameters, value binding, metadata search and INSERT priority regression tests passed');
	} finally {
		mysql.createConnection = originalConnect;
		urllib.request = originalRequest;
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
