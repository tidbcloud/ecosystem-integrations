/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);
// read the `.env` file into the environment, if available
zapier.tools.env.inject();

const tableName = 'test_column_'+Math.floor(Date.now()/1000)
const ddl = `CREATE TABLE ${tableName}  (id int(11) NOT NULL,name varchar(255)  DEFAULT NULL,PRIMARY KEY (id) ) ;`

describe('resources.column', () => {

  beforeAll(async () => {
    //create table
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterId: process.env.TEST_CLUSTERID,
        tidbPassword: process.env.TEST_TIDB_PASSWORD,
        database: process.env.TEST_DATABASE,
        host: process.env.TEST_TIDB_HOST,
        user: process.env.TEST_TIDB_USER,
        port: process.env.TEST_TIDB_PORT,
        tableDDL: ddl
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      }
    };

     await appTester(App.resources.table.create.operation.perform, bundle);
  });

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
        table: tableName
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      }
    };

    const results = await appTester(App.resources.column.list.operation.perform, bundle);
    expect(results).toBeDefined();
  });
});
