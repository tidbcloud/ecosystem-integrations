/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core')

// Use this to make test calls into your app:
const App = require('../../index')
const appTester = zapier.createAppTester(App)
// read the `.env` file into the environment, if available
zapier.tools.env.inject()

describe('resources.project', () => {
  it('should run', async () => {
    const bundle = {
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
      inputData: {},
    }

    const results = await appTester(App.resources.project.list.operation.perform, bundle)
    expect(results).toBeDefined()
  })
})
