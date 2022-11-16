// get a list of clusters
const performList = async (z, bundle) => {
  const response = await z.request({
    url: `https://api.tidbcloud.com/api/v1beta/projects/${bundle.inputData.projectId}/clusters`,
    digest: {
      username: bundle.authData.username,
      password: bundle.authData.password,
    }
  });
  return response.data.items
};

// find a cluster
const performSearch = async (z, bundle) => {
  const response = await z.request({
    url: `https://api.tidbcloud.com/api/v1beta/projects/${bundle.inputData.projectId}/clusters`,
    digest: {
      username: bundle.authData.username,
      password: bundle.authData.password,
    }
  });
  for (let i = 0; i < response.data.items.length; i++) {
    if (response.data.items[i].cluster_type === bundle.inputData.clusterType) {
      if (bundle.inputData.clusterName === undefined || response.data.items[i].name === bundle.inputData.clusterName)
      return [response.data.items[i]]
    }
  }
  return []
};

// creates a new cluster
const performCreate = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: `https://api.tidbcloud.com/api/v1beta/projects/${bundle.inputData.projectId}/clusters`,
    body: {
      name: bundle.inputData.clusterName,
      "cluster_type": "DEVELOPER",
      "cloud_provider": "AWS",
      "region": bundle.inputData.region,
      "config":{
        "root_password": bundle.inputData.tidbPassword,
      }
    }
  });
  return {
    id: response.data.id,
    name: bundle.inputData.clusterName,
  }
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'cluster',
  noun: 'Cluster',

  list: {
    display: {
      label: 'New Cluster',
      description: 'Triggers when a new cluster is created.',
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
        },
      ]
    }
  },

  create: {
    display: {
      label: 'Create Cluster',
      description: 'Creates a new cluster. Only support create a free serverless tier now.',
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
          key: 'clusterName',
          required: true,
          label: 'Cluster Name',
        },
        {
          key: 'region',
          required: true,
          label: 'Region',
          choices: { 'us-west-2': 'Oregon (us-west-2)', 'us-east-1': 'N. Virginia (us-east-1)','ap-southeast-1':'Singapore (ap-southeast-1)',
            'ap-northeast-1':'Tokyo (ap-northeast-1)','eu-central-1':'Frankfurt (eu-central-1)' },
        },
        {
          key: 'tidbPassword',
          type: 'password',
          required: true,
          label: 'Serverless Tier Password',
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
      label: 'Find Cluster',
      description: 'Finds an existing Serverless tier or Dedicated tier.',
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
          key: 'clusterType',
          required: true,
          choices: {
            'DEVELOPER': 'Serverless tier',
            'DEDICATED': 'Dedicated tier',
          }
        },
        {
          key: 'clusterName',
          label: 'Cluster Name',
          required: true,
          helpText: 'The name of the cluster.',
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
    project_id: 1,
    cluster_type: "DEDICATED",
    cloud_provider: "AWS",
    region: "us-west-1",
    create_timestamp : 1656991448,
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [
  ]
};
