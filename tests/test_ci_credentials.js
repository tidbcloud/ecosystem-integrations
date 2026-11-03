const assert = require('assert')
const fs = require('fs')
const vm = require('vm')

const password = "test-'\"$()`\\@ password"
const quiet = { log() {}, error() {} }
const context = {
  process: {
    argv: ['node', 'test', 'db.example.com', 'user'],
    env: { TIDB_PASSWORD: password },
  },
  console: quiet,
}

async function main() {
  vm.runInNewContext(fs.readFileSync('example_code/node/ConnectTest.js', 'utf8'), {
    ...context,
    require: () => ({
      createConnection(config) {
        assert.strictEqual(config.password, password)
        assert.strictEqual(config.host, 'db.example.com')
        return { connect() {} }
      },
    }),
  })
  vm.runInNewContext(fs.readFileSync('example_code/sequelize/ConnectTest.js', 'utf8'), {
    ...context,
    require: () => class {
      constructor(database, user, value) {
        assert.strictEqual(value, password)
        assert.strictEqual(user, 'user')
      }
      async query() { return [[]] }
      async close() {}
    },
  })
  const source = fs.readFileSync('example_code/serverless-driver/ConnectTest.js', 'utf8')
    .replace("import { connect } from '@tidbcloud/serverless'", '')
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
  await new AsyncFunction('connect', 'process', 'console', source)(config => {
    assert.strictEqual(config.password, password)
    assert(!config.url.includes(password))
    return { execute: async () => [] }
  }, {
    env: { TIDB_PASSWORD: password, DATABASE_URL: 'mysql://user@db.example.com/test' },
  }, quiet)
  const auth = require('../zapier/authentication').config
  assert.strictEqual(auth.fields.find(field => field.key === 'password').type, 'password')
  console.log('JavaScript credential input checks passed')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
