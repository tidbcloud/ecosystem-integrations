/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);
// read the `.env` file into the environment, if available
zapier.tools.env.inject();

const tableName = 'test_search_row_'+Math.floor(Date.now()/1000)
const ddl = `CREATE TABLE ${tableName}  (id int(11) NOT NULL,name varchar(255)  DEFAULT NULL,age int(11)  DEFAULT NULL, PRIMARY KEY (id) ) ;`

describe('searches.row', () => {

  beforeAll(async () => {
    //create table
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        database: process.env.TEST_DATABASE,
        tableDDL: ddl
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      }
    };

    await appTester(App.resources.table.create.operation.perform, bundle);

    // insert data
    const bundle2 = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        database: process.env.TEST_DATABASE,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        table: tableName,
        id: 1,
        name: 'name1',
        age: 10
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      }
    };

    await appTester(App.creates.row.operation.perform, bundle2);
  });

  it('should search row', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        database: process.env.TEST_DATABASE,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        table: tableName,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        // Add the lookup_column and lookup_value here.
        lookup_column: 'id',
        lookup_value: 1,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      }
    };

    const results = await appTester(App.searches.row.operation.perform, bundle);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should search query', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        query: `select * from ${process.env.TEST_DATABASE}.${tableName} where id = 1`,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      }
    };

    const results = await appTester(App.searches.row_query.operation.perform, bundle);
    expect(results.length).toBeGreaterThan(0);
  });

});
