/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core')

// Use this to make test calls into your app:
const App = require('../../index')
const appTester = zapier.createAppTester(App)
// read the `.env` file into the environment, if available
zapier.tools.env.inject()

describe('resources.cluster', () => {
  it('should run', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.resources.cluster.list.operation.perform, bundle)
    expect(results).toBeDefined()
  })

  const clusterName = 'zapier-test'
  it('should create', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterName: clusterName,
        region: 'ap-southeast-1',
        tidbPassword: '12345678',
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.resources.cluster.create.operation.perform, bundle)
    expect(results.name).toBe(clusterName)
  })

  it('should search', async () => {
    const bundle = {
      inputData: {
        projectId: process.env.TEST_PROJECTID,
        clusterType: 'DEVELOPER',
        clusterName: clusterName,
      },
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    }

    const results = await appTester(App.resources.cluster.search.operation.perform, bundle)
    expect(results).toBeDefined()
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe(clusterName)
  })
})
