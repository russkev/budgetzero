const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'c6uv5r',
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',

  env: {
    CYPRESS_CLOUD_ADDRESS: 'http://127.0.0.1:5984/cypress-test'
  },

  e2e: {
    baseUrl: 'http://localhost:8082',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
    setupNodeEvents(on, config) {
      on('task', {
        getEnv(key) {
          return process.env.local[key]
        }
      })
    },
    defaultCommandTimeout: 20000
  },

  component: {
    devServer: {
      framework: 'vue-cli',
      bundler: 'webpack'
    }
  }
})
