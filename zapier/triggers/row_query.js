// triggers on a new row_query with a certain tag
const queryWithTimeOut = require('../tidb_client/PromiseClientWithTimeout')
const request = require('../tidb_client/TiDBCloudClient')
const perform = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword

  const limitQuery = `select * from (${bundle.inputData.query}) as fake_table limit 1000000`
  const [rows, error] = await queryWithTimeOut(host, user, port, tidbPassword, null, 30, limitQuery)
  if (error) {
    throw new z.errors.Error(`Execute SQL error: ${error}`)
  }

  if (rows.length === 0) {
    return rows
  }

  // check id field
  let hasId = false
  const keys = Object.keys(rows[0])
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'id') {
      hasId = true
      break
    }
  }
  if (!hasId) {
    throw new z.errors.Error('You must return the results with id field')
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
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#triggerschema
  key: 'row_query',
  noun: 'Row_query',

  display: {
    label: 'New Row (Custom Query)',
    description: 'Triggers when new rows are returned from a custom query that you provide.',
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
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
        key: 'query',
        required: true,
        label: 'Query',
        helpText:
          'Query results must have a unique id field so we can deduplicate records properly! You must also include desired ordering and limiting in the query. Note: This query must run in less than 30 seconds and it is recommended that you return no more than 5,000 rows',
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      id: 1,
      name: 'Test',
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
