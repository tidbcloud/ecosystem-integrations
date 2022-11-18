/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core')

// Use this to make test calls into your app:
const App = require('../../index')
const appTester = zapier.createAppTester(App)
// read the `.env` file into the environment, if available
zapier.tools.env.inject()

const tableName = 'test_table_' + Math.floor(Date.now() / 1000)
const ddl = `CREATE TABLE ${tableName}  (id int(11) NOT NULL,name varchar(255)  DEFAULT NULL,PRIMARY KEY (id) ) ;`

describe('resources.table', () => {
  it('should run', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        database: process.env.TEST_DATABASE,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.resources.table.list.operation.perform, bundle)
    expect(results).toBeDefined()
  })

  it('should create', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        database: process.env.TEST_DATABASE,
        tableDDL: ddl,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.resources.table.create.operation.perform, bundle)
    expect(results).toBeDefined()
  })

  it('should search', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        database: process.env.TEST_DATABASE,
        table: tableName,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.resources.table.search.operation.perform, bundle)
    expect(results[0].table).toBe(tableName)
  })
})
