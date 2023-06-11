const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'c6uv5r',
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  e2e: {
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
    setupNodeEvents(on, config) {
      on('task', {
        getEnv(key) {
          return process.env.local[key]
        }
      })
    }
    // defaultCommandTimeout: 1000,
  }
})
