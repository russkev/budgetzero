// const PouchDB = require('pouchdb')
// const { defineConfig } = require('cypress')
// const mock_budget = require('./mock_budget_3.json')
// const data = mock_budget.rows
//   .map((row) => {
//     delete row.doc._rev
//     return row.doc
//   })
//   .filter((row) => {
//     return row._id[0] == 'b'
//   })

// const loadBudget3 = () => {
//   const pouch = new PouchDB('budgetzero_local_db')
//   return pouch.bulkDocs(data)
// }

// export { loadBudget3 }