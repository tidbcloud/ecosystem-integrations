/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core')

// Use this to make test calls into your app:
const App = require('../../index')
const appTester = zapier.createAppTester(App)
// read the `.env` file into the environment, if available
zapier.tools.env.inject()

const tableName = 'test_create_row_' + Math.floor(Date.now() / 1000)
const ddl =
  `CREATE TABLE ${tableName}  (id int(11) NOT NULL,name varchar(255)  DEFAULT NULL,age int(11)  DEFAULT NULL, PRIMARY KEY (id) ) ;`

describe('row', () => {
  beforeAll(async () => {
    // get cluster info

    // create table
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        database: process.env.TEST_DATABASE,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        tableDDL: ddl,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    await appTester(App.resources.table.create.operation.perform, bundle)
  })

  it('should create', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        database: process.env.TEST_DATABASE,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        table: tableName,
        id: 1,
        name: 'name1',
        age: 10,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }
    // const connection =  await appTester(App.creates.row.operation.computedFields, bundle);
    // const children  = connection[0].host
    const results = await appTester(App.creates.row.operation.perform, bundle)
    expect(results).toBeDefined()
  })

  it('should create with default value', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        database: process.env.TEST_DATABASE,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        table: tableName,
        id: 2,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.creates.row.operation.perform, bundle)
    expect(results).toBeDefined()
  })

  it('should update', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        database: process.env.TEST_DATABASE,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        table: tableName,
        id_column: 'id',
        id_column_value: 2,
        name: 'name2',
        age: 20,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.creates.row_update.operation.perform, bundle)
    expect(results).toBeDefined()
  })

  it('should update a part of value', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        database: process.env.TEST_DATABASE,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        table: tableName,
        id_column: 'id',
        id_column_value: 1,
        age: 11,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.creates.row_update.operation.perform, bundle)
    expect(results).toBeDefined()
  })
})
