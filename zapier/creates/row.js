// create a particular row by name
const query = require("../tidb_client/PromiseClient");
const perform = async (z, bundle) => {

  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database
  const table = bundle.inputData.table

  const [rows, error] = await query(host, user, port, tidbPassword, database,
      `show columns from ${table}`)
  if (error) {
    throw new z.errors.Error("Execute SQL error", error, 400)
  }

  const data = []
  let values = ""
  let columns = ""
  let index = 0;
  for (let i = 0; i < rows.length; i++) {
    // handle the case when the field is inconsistent. for example, add new column after a zap is created.
    if (bundle.inputData[rows[i].Field] === undefined) {
      continue;
    }
    data[index] = bundle.inputData[rows[i].Field]
    if (index > 0) {
      columns += `,${rows[i].Field}`
      values += ",?"
    } else {
      columns += `(${rows[i].Field}`
      values += "(?"
    }
    index++
  }
  values += ")"
  columns += ")"

  const [_, error2] = await query(host, user, port, tidbPassword,
      database, `insert into ${table} ${columns} values ${values}`, data)
  if (error2) {
    throw new z.errors.Error("Execute SQL error", error2, 400)
  }

  return Object.create(null)
};

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

  const [rows, error] = await query(host, user, port, tidbPassword, database,
      `show columns from ${table}`)
  if (error) {
    throw new z.errors.Error("Execute SQL error", error, 400)
  }

  const result = [];
  for (let i = 0; i < rows.length; i++) {
    result[i] = {key: rows[i].Field, helpText: rows[i].Type}
  }

  return [{
    key: 'columns',
    label: 'Columns',
    children: result
  }]
};

const computedFields = async (z, bundle) => {
  if (bundle.inputData.clusterId === undefined) {
    return []
  }
  const response = await z.request({
    url: `https://api.tidbcloud.com/api/v1beta/projects/${bundle.inputData.projectId}/clusters/${bundle.inputData.clusterId}`,
    digest: {
      username: bundle.authData.username,
      password: bundle.authData.password,
    }
  });
  const host = response.data.status.connection_strings.standard.host
  const port = response.data.status.connection_strings.standard.port
  const user = response.data.status.connection_strings.default_user

  return [
    {
      key: 'connection',
      label: 'Connection',
      children: [
        {key: 'host', required: true, label: 'TiDB Host', default: host},
        {key: 'port', required: true, label: 'TiDB Port', default: port},
        {key: 'user', required: true, label: 'TiDB User', default: user},
        {
          key: 'tidbPassword',
          required: true,
          type: 'password',
          label: 'TiDB Password',
        },
      ]
    }
  ]
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#createschema
  key: 'row',
  noun: 'Row',

  display: {
    label: 'Create Row',
    description: 'Creates a new row.',
    important: true
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
      rowFields,
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
    ]
  }
};
