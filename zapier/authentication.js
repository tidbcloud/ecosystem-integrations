'use strict'

// You want to make a request to an endpoint that is either specifically designed
// to test auth, or one that every user will have access to. eg: `/me`.
// By returning the entire request object, you have access to the request and
// response data for testing purposes. Your connection label can access any data
// from the returned response using the `json.` prefix. eg: `{{json.username}}`.
const request = require('./tidb_client/TiDBCloudClient')
const test = (z, bundle) => {
  return request(z, 'https://api.tidbcloud.com/api/v1beta/projects', bundle.authData.username, bundle.authData.password)
}

const label = (z, bundle) => {
  return bundle.authData.username
}

// This function runs after every outbound request. You can use it to check for
// errors or modify the response. You can have as many as you need. They'll need
// to each be registered in your index.js file.
const handleBadResponses = (response, z, bundle) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      // This message is surfaced to the user
      'The public key and/or private key you supplied is incorrect',
      'AuthenticationError',
      response.status,
    )
  }

  return response
}

module.exports = {
  config: {
    // "digest" auth automatically creates "username" and "password" input fields. It
    // also registers default middleware to create the authentication header.
    type: 'digest',

    // Define any input app's auth requires here. The user will be prompted to enter
    // this info when they connect their account.
    fields: [
      {
        key: 'username',
        required: true,
        label: 'Public Key',
        helpText:
          'To create an API key, log in to your [TiDB Cloud console](https://tidbcloud.com/). Navigate to the Organization Settings page, and create an API key. An API key contains a public key and a private key. Learn more about how to use TiDB Cloud in our [official doc](https://docs.pingcap.com/tidbcloud/integrate-tidbcloud-with-zapier).',
      },
      {
        key: 'password',
        required: true,
        label: 'Private Key',
      },
    ],

    // The test method allows Zapier to verify that the credentials a user provides
    // are valid. We'll execute this method whenever a user connects their account for
    // the first time.
    test,

    // This template string can access all the data returned from the auth test. If
    // you return the test object, you'll access the returned data with a label like
    // `{{json.X}}`. If you return `response.data` from your test, then your label can
    // be `{{X}}`. This can also be a function that returns a label. That function has
    // the standard args `(z, bundle)` and data returned from the test can be accessed
    // in `bundle.inputData.X`.
    connectionLabel: label,
  },
  befores: [],
  afters: [handleBadResponses],
}
