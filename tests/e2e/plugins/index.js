/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

// /* eslint-disable import/no-extraneous-dependencies, global-require */
// const webpack = require('@cypress/webpack-preprocessor')


import mock_budget from '../../__mockdata__/mock_budget_3.json'
import PouchDB from 'pouchdb'
const data = mock_budget.rows
  .map((row) => {
    delete row.doc._rev
    return row.doc
  })
  .filter((row) => {
    return row._id[0] == 'b'
  })

module.exports = (on, config) => {
  // on('file:preprocessor', webpack({
  //  webpackOptions: require('@vue/cli-service/webpack.config'),
  //  watchOptions: {}
  // }))

  on('task', {
    'db:seed': () => {
      const pouch = new PouchDB('budgetzero_local_db')
      return pouch.bulkDocs(data)
    }
  })
  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js'
  })

}
