// get a list of columns
const query = require('../tidb_client/PromiseClient')
const performList = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database
  const table = bundle.inputData.table

  const [rows, error] = await query(host, user, port, tidbPassword, database, `show columns from ${table}`)
  if (error) {
    throw new z.errors.Error(`Execute SQL error: ${error}`)
  }

  const result = []
  for (let i = 0; i < rows.length; i++) {
    result[i] = { id: i, name: rows[i].Field, type: rows[i].Type }
  }
  return result
}

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'column',
  noun: 'Column',

  list: {
    display: {
      label: 'New Column',
      description: 'Triggers when lists the columns.',
      hidden: true,
    },
    operation: {
      perform: performList,
      // `inputFields` defines the fields a user could provide
      // Zapier will pass them in as `bundle.inputData` later. They're optional on triggers, but required on searches and creates.
      inputFields: [],
    },
  },

  // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
  // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
  // returned records, and have obvious placeholder values that we can show to any user.
  // In this resource, the sample is reused across all methods
  sample: {
    id: 1,
    name: 'Test',
    type: 'int(11)',
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [],
}
