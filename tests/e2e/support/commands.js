import PouchDB from 'pouchdb'
import mock_budget from '../../__mockdata__/mock_budget_3.json'
import { LOCAL_DB_NAME } from '../../../src/constants'

const db_data = mock_budget.rows
  .map((row) => {
    delete row.doc._rev
    return row.doc
  })
  .filter((row) => {
    return row._id[0] == 'b'
  })

Cypress.Commands.add("initPath", (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.bulkDocs(db_data)
    return
  })
})

Cypress.Commands.add("initPathEmpty", (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    return
  })
})