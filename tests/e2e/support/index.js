import './commands'

Cypress.on('window:before:load', (win) => {
  win.indexedDB.deleteDatabase('_pouch_budgetzero_local_db')
})