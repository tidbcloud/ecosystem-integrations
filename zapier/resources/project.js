// get a list of projects
const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.tidbcloud.com/api/v1beta/projects',
    digest: {
      username: bundle.authData.username,
      password: bundle.authData.password,
    },
  })
  return response.data.items
}

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'project',
  noun: 'Project',

  list: {
    display: {
      label: 'New Project',
      description: 'Triggers when a new project is created.',
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
    org_id: 1,
    cluster_count: 4,
    user_count: 10,
    create_timestamp: 1656991448,
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [],
}
