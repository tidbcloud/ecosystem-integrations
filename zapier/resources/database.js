// get a list of databases
const query = require("../tidb_client/PromiseClient");
const performList = async (z, bundle) => {

  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword

  const [rows,error] = await query(host, user, port, tidbPassword, null, `show databases`)
  if(error) {
    throw new z.errors.Error("Execute SQL error", error, 400)
  }

  const result = [];
  let index = 0;
  for(let i =0; i < rows.length; i++) {
    if(rows[i].Database !== 'INFORMATION_SCHEMA' && rows[i].Database !== 'PERFORMANCE_SCHEMA' && rows[i].Database !== 'gharchive_dev' && rows[i].Database !== 'mysql') {
      result[index] = { id: index, name: rows[i].Database }
      index++
    }
  }

  return result
};

// creates a new database
const performCreate = async (z, bundle) => {

  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword

  const [rows,error] = await query(host, user, port, tidbPassword, null, `create database if not exists ${bundle.inputData.database}`)
  if(error) {
    throw new z.errors.Error("Execute SQL error", error, 400)
  }
  return {
    database: bundle.inputData.database
  }
};

// find a database
const performSearch = async (z, bundle) => {

  const host = bundle.inputData.host
  const port = bundle.inputData.port
  const user = bundle.inputData.user
  const tidbPassword = bundle.inputData.tidbPassword

  const [rows,error] = await query(host, user, port, tidbPassword, null, `show databases`)
  if(error) {
    throw new z.errors.Error("Execute SQL error", error, 400)
  }
  for(let i =0; i < rows.length; i++) {
    if(rows[i].Database === bundle.inputData.database ) {
      return [{database: rows[i].Database}]
    }
  }
  return []
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
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'database',
  noun: 'Database',

  list: {
    display: {
      label: 'New Database',
      description: 'Triggers when lists the databases.',
      hidden: true
    },
    operation: {
      perform: performList,
      // `inputFields` defines the fields a user could provide
      // Zapier will pass them in as `bundle.inputData` later. They're optional on triggers, but required on searches and creates.
      inputFields: []
    }
  },

  create: {
    display: {
      label: 'Create Database',
      description: 'Creates a new database.',
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
          helpText: 'The database you want to create, ignore if exists',
        },
      ],
      perform: performCreate,
      sample: {
        id: 1,
        name: 'test'
      },
    },
  },

  search: {
    display: {
      label: 'Find Database',
      description: 'Finds an existing Database.',
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
          label: 'The database you want to search.',
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
    name: 'Test'
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [
  ]
};
