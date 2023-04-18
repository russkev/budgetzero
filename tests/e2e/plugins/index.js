/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

// /* eslint-disable import/no-extraneous-dependencies, global-require */
// const webpack = require('@cypress/webpack-preprocessor')

module.exports = (on, config) => {
  // on('file:preprocessor', webpack({
  //  webpackOptions: require('@vue/cli-service/webpack.config'),
  //  watchOptions: {}
  // }))

  // on('task', {
  //   // deleteFolder(folderName) {
  //   //   console.log('Deleting folder %s', folderName)
  //   //   return new Promise((resolve, reject) => {
  //   //     rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
  //   //       if (err) {
  //   //         console.log(err)
  //   //         return reject(err)
  //   //       }
  //   //       resolve(null)
  //   //     })
  //   //   })
  //   // },
  //   getEnv(key) {
  //     return process.env[key]
  //   }
  // })
  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js'
  })
}
