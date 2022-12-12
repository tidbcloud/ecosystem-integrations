// create a particular row_update by name
const query = require('../tidb_client/PromiseClient')
const request = require('../tidb_client/TiDBCloudClient')
const perform = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database
  const table = bundle.inputData.table

  const [rows, error] = await query(host, user, port, tidbPassword, database, `show columns from ${table}`)
  if (error) {
    throw new z.errors.Error('Execute SQL error', error, 400)
  }

  let sql = `update ${table} set `
  let index = 0
  for (let i = 0; i < rows.length; i++) {
    if (
      bundle.inputData[rows[i].Field] === undefined || bundle.inputData[rows[i].Field] === null ||
      bundle.inputData[rows[i].Field] === ''
    ) {
      continue
    }
    if (index > 0) {
      sql += `,${rows[i].Field} = '${bundle.inputData[rows[i].Field]}'`
    } else {
      sql += `${rows[i].Field} = '${bundle.inputData[rows[i].Field]}'`
    }
    index++
  }
  sql += ` where ${bundle.inputData.id_column} = ${bundle.inputData.id_column_value}`

  const [_, error1] = await query(host, user, port, tidbPassword, database, sql)
  if (error1) {
    throw new z.errors.Error('Execute SQL error', error1, 400)
  }

  return Object.create(null)
}

const computedFields = async (z, bundle) => {
  if (bundle.inputData.clusterId === undefined) {
    return []
  }
  const response = request(
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

const rowFields = async (z, bundle) => {
  if (bundle.inputData.table === undefined) {
    return []
  }

  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database
  const table = bundle.inputData.table

  const [rows, error] = await query(host, user, port, tidbPassword, database, `show columns from ${table}`)
  if (error) {
    throw new z.errors.Error('Execute SQL error', error, 400)
  }

  const result = []
  for (let i = 0; i < rows.length; i++) {
    result[i] = {
      key: rows[i].Field,
      label: `Update ${rows[i].Field}`,
      helpText: `A field called ${rows[i].Field} of type: ${rows[i].Type}, ignore it if you do not want to update it`,
    }
  }

  return [{
    key: 'columns',
    label: 'Columns',
    children: result,
  }]
}

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#createschema
  key: 'row_update',
  noun: 'Row_update',

  display: {
    label: 'Update Row',
    description: 'Updates an existing row.',
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    // End-users will map data into these fields. In general, they should have any fields that the API can accept. Be sure to accurately mark which fields are required!
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
        helpText: 'Select your Table name!',
      },
      {
        key: 'id_column',
        required: true,
        label: 'ID Column',
        dynamic: 'columnList.name.name',
        helpText: 'Select ID Column to locate the row that needs to be updated.',
      },
      {
        key: 'id_column_value',
        required: true,
        label: 'ID Column Value',
        helpText: 'Enter the value of ID Column.',
      },
      rowFields,
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
