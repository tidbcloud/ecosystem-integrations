/* globals describe, it, expect */

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('digest auth', () => {
  it('correctly authenticates', async () => {
    // Try changing the values of username or password to see how the test method behaves
    const bundle = {
      authData: {
        username: process.env.TEST_PUBLIC_KEY,
        password: process.env.TEST_PRIVATE_KEY,
      },
    };

    const response = await appTester(App.authentication.test, bundle);

    expect(response.status).toBe(200);
  });

  it('fails on bad auth', async () => {
    // Try changing the values of username or password to see how the test method behaves
    const bundle = {
      authData: {
        username: 'user',
        password: 'badpwd',
      },
    };

    try {
      await appTester(App.authentication.test, bundle);
    } catch (err) {
      expect(err.message).toContain(
        'The public key and/or private key you supplied is incorrect'
      );
      return;
    }
    throw new Error('appTester should have thrown');
  });
});
