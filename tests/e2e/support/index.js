import './commands'

import PouchDB from 'pouchdb'
import mock_budget from '../../__mockdata__/mock_budget_3.json'

Cypress.on('window:before:load', async (win) => {

  const data = mock_budget.rows
    .map((row) => {
      delete row.doc._rev
      return row.doc
    })
    .filter((row) => {
      return row._id[0] == 'b'
    })

  win.indexedDB.deleteDatabase('_pouch_budgetzero_local_db')
  win.indexedDB.deleteDatabase('_pouch_budgetzero_local_db-mrview-6cc2e1b71cb4d1d9a11506e062150e98')
  const pouch = new PouchDB('budgetzero_local_db')
  return pouch.bulkDocs(data)
})