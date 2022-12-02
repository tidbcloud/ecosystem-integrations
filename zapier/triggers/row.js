// triggers on a new row with a certain tag
const query = require('../tidb_client/PromiseClient')
const perform = async (z, bundle) => {
  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword
  const database = bundle.inputData.database
  const table = bundle.inputData.table

  // get dedupe_key
  let dedupe_key = bundle.inputData.dedupe_key
  if (dedupe_key === undefined) {
    const [columns, error] = await query(
      host,
      user,
      port,
      tidbPassword,
      database,
      `select COLUMN_NAME,COLUMN_KEY
                   from INFORMATION_SCHEMA.COLUMNS
                   where table_name = '${table}'`,
    )
    if (error) {
      throw new z.errors.Error('Execute SQL error', error, 400)
    }
    // use pk/uk or the first key as dedupe_key
    dedupe_key = columns[0].COLUMN_NAME
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].COLUMN_KEY === 'UNI') {
        dedupe_key = columns[i].COLUMN_NAME
        break
      }
    }
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].COLUMN_KEY === 'PRI') {
        dedupe_key = columns[i].COLUMN_NAME
        break
      }
    }
  }

  // judge id
  const [id, error2] = await query(
    host,
    user,
    port,
    tidbPassword,
    database,
    `select COLUMN_NAME
                 from INFORMATION_SCHEMA.COLUMNS
                 where table_name = '${table}'
                   and COLUMN_NAME = 'id';`,
  )
  if (error2) {
    throw new z.errors.Error('Execute SQL error', error2, 400)
  }
  let has_id_column = id.length > 0

  // if has id column, use id, else rename dedupe_key as id
  let sql
  if (!has_id_column) {
    sql = `select *, ${dedupe_key} as id
           from ${table}`
  } else {
    sql = `select *
           from ${table}`
  }
  if (bundle.inputData.order_by !== undefined) {
    sql += ` order by ${bundle.inputData.order_by} desc`
  }
  sql += ` limit 10000`

  const [rows, error] = await query(host, user, port, tidbPassword, database, sql)
  if (error) {
    throw new z.errors.Error('Execute SQL error', error, 400)
  }

  // do dedupe. Zapier will throw error when got a two or more results with the same id
  let results = []
  let index = 0
  const map = new Map()
  for (let i = 0; i < rows.length; i++) {
    if (!map.has(rows[i].id)) {
      results[index++] = rows[i]
      map.set(rows[i].id, true)
    }
  }
  return results
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
          label: 'TiDB Password',
        },
      ],
    },
  ]
}

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#triggerschema
  key: 'row',
  noun: 'Row',

  display: {
    label: 'New Row',
    description: 'Triggers when new rows are created. Only fetch the recently 10000 new rows.',
    important: true,
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
        key: 'database',
        required: true,
        label: 'Database Name',
        dynamic: 'databaseList.name.name',
        altersDynamicFields: true,
        helpText: 'Select your database name!',
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
        key: 'order_by',
        label: 'Order By',
        dynamic: 'column.name.name',
        helpText:
          'Highly recommended! Usually you want the results to be most recent first so we can skim off only new results, so choose something like date_created or your autoincrement id.',
      },
      {
        key: 'dedupe_key',
        label: 'Dedupe Key',
        dynamic: 'column.name.name',
        helpText:
          'We default to what the primary key is on the table as the unique key to deduplicate on. If you prefer another field, select it here (invalid when the table has id column!).',
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
    ],
  },
}
