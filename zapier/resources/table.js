// get a list of tables
const query = require('../tidb_client/PromiseClient')
const request = require('../tidb_client/TiDBCloudClient')
const performList = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database

  const [rows, error] = await query(
    host,
    user,
    port,
    tidbPassword,
    database,
    `select tidb_table_id,table_name from information_schema.tables where table_schema='${bundle.inputData.database}'`,
  )
  if (error) {
    throw new z.errors.Error(`Execute SQL error: ${error}`)
  }

  const result = []
  for (let i = 0; i < rows.length; i++) {
    result[i] = { id: rows[i].tidb_table_id, name: rows[i].table_name }
  }
  return result
}

// creates a new table
const performCreate = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database

  const [rows, error] = await query(host, user, port, tidbPassword, database, `${bundle.inputData.tableDDL}`)
  if (error) {
    throw new z.errors.Error(`Execute SQL error: ${error}`)
  }

  return Object.create(null)
}

// find a table
const performSearch = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database

  const [rows, error] = await query(
    host,
    user,
    port,
    tidbPassword,
    database,
    `select table_name from information_schema.tables where table_schema='${bundle.inputData.database}' and table_name='${bundle.inputData.table}'`,
  )
  if (error) {
    throw new z.errors.Error(`Execute SQL error: ${error}`)
  }
  if (rows.length !== 0) {
    return [{ table: rows[0].table_name }]
  }
  return []
}

const computedFields = async (z, bundle) => {
  if (bundle.inputData.clusterId === undefined) {
    return []
  }
  const response = await request(
    z,
    `https://api.tidbcloud.com/api/v1beta/projects/${bundle.inputData.projectId}/clusters/${bundle.inputData.clusterId}`,
    bundle.authData.username,
    bundle.authData.password,
  )
  const host = response.data.status.connection_strings.standard.host
  const port = response.data.status.connection_strings.standard.port
  const user = response.data.status.connection_strings.default_user

  return [
    {
      key: 'connection',
      label: 'Connection',
      children: [
        { key: 'host', required: true, label: 'TiDB Host', default: host },
        { key: 'port', required: true, label: 'TiDB Port', default: port },
        { key: 'user', required: true, label: 'TiDB User', default: user },
        {
          key: 'tidbPassword',
          required: true,
          type: 'password',
          label: 'TiDB Password',
        },
      ],
    },
  ]
}

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'table',
  noun: 'Table',

  list: {
    display: {
      label: 'New Table',
      description: 'Triggers when a new table is created in a given database.',
    },
    operation: {
      perform: performList,
      // `inputFields` defines the fields a user could provide
      // Zapier will pass them in as `bundle.inputData` later. They're optional on triggers, but required on searches and creates.
      inputFields: [
        {
          key: 'projectId',
          required: true,
          label: 'Project Name',
          dynamic: 'projectList.id.name',
          helpText: 'Select your project name!',
          altersDynamicFields: true,
        },
        {
          key: 'clusterId',
          required: true,
          label: 'Cluster Name',
          dynamic: 'clusterList.id.name',
          helpText: 'Select your cluster name!',
          altersDynamicFields: true,
        },
        computedFields,
        {
          key: 'database',
          required: true,
          label: 'Database',
          dynamic: 'databaseList.name.name',
          altersDynamicFields: true,
          helpText: ' Select your database name!',
        },
      ],
    },
  },

  create: {
    display: {
      label: 'Create Table',
      description: 'Creates a new table.',
    },
    operation: {
      inputFields: [
        {
          key: 'projectId',
          required: true,
          label: 'Project Name',
          dynamic: 'projectList.id.name',
          helpText: 'Select your project name!',
        },
        {
          key: 'clusterId',
          required: true,
          label: 'Cluster Name',
          dynamic: 'clusterList.id.name',
          helpText: 'Select your cluster name!',
          altersDynamicFields: true,
        },
        computedFields,
        {
          key: 'database',
          required: true,
          label: 'Database Name',
          dynamic: 'databaseList.name.name',
          altersDynamicFields: true,
          helpText: 'Select your Database name!',
        },
        {
          key: 'tableDDL',
          required: true,
          label: 'Table DDL',
          helpText: 'The DDL of the table you want to create.',
        },
      ],
      perform: performCreate,
    },
  },

  search: {
    display: {
      label: 'Find Table',
      description: 'Finds an existing table.',
    },
    operation: {
      inputFields: [
        {
          key: 'projectId',
          required: true,
          label: 'Project Name',
          dynamic: 'projectList.id.name',
          helpText: 'Select your project name!',
        },
        {
          key: 'clusterId',
          required: true,
          label: 'Cluster Name',
          dynamic: 'clusterList.id.name',
          helpText: 'Select your cluster name!',
          altersDynamicFields: true,
        },
        computedFields,
        {
          key: 'database',
          required: true,
          label: 'Database name',
          dynamic: 'databaseList.name.name',
          altersDynamicFields: true,
          helpText: 'Select your Database name!',
        },
        {
          key: 'table',
          required: true,
          label: 'The table you want to search.',
        },
      ],
      perform: performSearch,
    },
  },

  // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
  // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
  // returned records, and have obvious placeholder values that we can show to any user.
  // In this resource, the sample is reused across all methods
  sample: {
    id: 1,
    name: 'Test',
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [],
}
