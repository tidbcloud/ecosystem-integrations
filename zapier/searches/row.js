// find a particular row by name
const query = require('../tidb_client/PromiseClient')
const request = require('../tidb_client/TiDBCloudClient')
const perform = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database
  const table = bundle.inputData.table

  const [rows, error] = await query(
    host,
    user,
    port,
    tidbPassword,
    database,
    `select * from ${table} where ${bundle.inputData.lookup_column} = ?`,
    [bundle.inputData.lookup_value],
  )
  if (error) {
    throw new z.errors.Error(`Execute SQL error: ${error}`)
  }

  return rows
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
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#searchschema
  key: 'row',
  noun: 'Row',

  display: {
    label: 'Find Row',
    description: 'Finds a row in a table via a lookup column.',
    important: true,
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. Searches need at least one `inputField`.
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
        label: 'Database Name',
        dynamic: 'databaseList.name.name',
        altersDynamicFields: true,
        helpText: 'Select your Database name!',
      },
      {
        key: 'table',
        required: true,
        label: 'Table Name',
        dynamic: 'tableList.name.name',
        altersDynamicFields: true,
        helpText:
          'We expect at least one unique (and usually autoincrement) primary key column so we can deduplicate records properly!',
      },
      {
        key: 'lookup_column',
        label: 'Lookup Column',
        required: true,
        dynamic: 'column.name.name',
        helpText: 'We expect a unique key or primary key ',
      },
      {
        key: 'lookup_value',
        label: 'Lookup Value',
        required: true,
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      id: 1,
    },

    // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
    // For a more complete example of using dynamic fields see
    // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
    // Alternatively, a static field definition can be provided, to specify labels for the fields
    outputFields: [
      // these are placeholders to match the example `perform` above
      // {key: 'id', label: 'Person ID'},
      // {key: 'name', label: 'Person Name'}
    ],
  },
}
