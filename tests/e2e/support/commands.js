// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import PouchDB from 'pouchdb'
import mock_budget from '../../__mockdata__/mock_budget_3.json'

Cypress.Commands.add('loadMockDB', () => {
  const data = mock_budget.rows
    .map((row) => {
      delete row.doc._rev
      return row.doc
    })
    .filter((row) => {
      return row._id[0] == 'b'
    })
  const pouch = new PouchDB('budgetzero_local_db')
  return pouch.bulkDocs(data)
})