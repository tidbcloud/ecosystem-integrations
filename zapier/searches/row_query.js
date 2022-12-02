// find a particular row_query by name
const queryWithTimeOut = require('../tidb_client/PromiseClientWithTimeout')
const perform = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword

  const [rows, error] = await queryWithTimeOut(host, user, port, tidbPassword, null, 30, bundle.inputData.query)
  if (error) {
    throw new z.errors.Error('Execute SQL error', error, 400)
  }

  return rows
}

const computedFields = async (z, bundle) => {
  if (bundle.inputData.clusterId === undefined) {
    return []
  }
  const response = await z.request({
    url:
      `https://api.tidbcloud.com/api/v1beta/projects/${bundle.inputData.projectId}/clusters/${bundle.inputData.clusterId}`,
    digest: {
      username: bundle.authData.username,
      password: bundle.authData.password,
    },
  })
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
          label: 'TiDB password',
        },
      ],
    },
  ]
}

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#searchschema
  key: 'row_query',
  noun: 'Row_query',

  display: {
    label: 'Find Row (Custom Query)',
    description: 'Finds a Row in a table via a custom query in your control.',
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
        key: 'query',
        required: true,
        label: 'Query',
        helpText:
          'You should include desired ordering and limiting (usually to 1 record) in the query. This query must run in less than 30 seconds.',
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
