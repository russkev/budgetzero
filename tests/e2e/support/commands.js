import PouchDB from 'pouchdb'
import mock_budget from '../../__mockdata__/mock_budget_3.json'
import mock_budget_large from '../../__mockdata__/mock_budget_large.json'
import { LOCAL_DB_NAME } from '../../../src/constants'
import '@4tw/cypress-drag-drop'
// import { rmdirSync } from 'fs'
// import 'fs'
// const fs = require('fs')
// const path = require('path')

const getData = (mock) => {
  return mock
    .map((row) => {
      delete row.doc._rev
      return row.doc
    })
    .filter((row) => {
      return row._id[0] == 'b'
    })
}

Cypress.Commands.add('initPath', (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    const data = getData(mock_budget.rows)
    await pouch.bulkDocs(data)
    return
  })
})

Cypress.Commands.add('initPathLarge', (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    // const data = getData(mock_budget_large)
    await pouch.bulkDocs(mock_budget_large)
    return
  })
})

Cypress.Commands.add('initPathEmpty', (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    return
  })
})
