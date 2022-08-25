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

describe('My First Test', () => {
  context('Initial experience', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8082/settings')
      cy.on('window:before:load', async () => {
        let pouch = new PouchDB(LOCAL_DB_NAME)
        await pouch.destroy()
        pouch = new PouchDB(LOCAL_DB_NAME)
        return
      })
    })
    it('Create new budget', () => {
      cy.get('#budget-name-field', { timeout: 6000 }).type('Cy1')
      cy.get('#budget-create').click()
      cy.get('#agree-button').click()

      cy.contains('.v-chip', 'Cy1')
    })
  })
  context('Accounts page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8082/accounts')
      cy.on('window:before:load', async () => {
        let pouch = new PouchDB(LOCAL_DB_NAME)
        await pouch.destroy()
        pouch = new PouchDB(LOCAL_DB_NAME)
        await pouch.bulkDocs(db_data)
        return
      })
    })
    it('Adds new account', () => {
      cy.get('.crud-actions', { timeout: 6000 }).should('have.length', 3)
      cy.get('#add-account-button').click()
      cy.get('[data-cy="account-name"]').type('Emergency')
      cy.get('.v-select__selections').click()
      cy.get('div').contains('CHECKING').click()
      cy.get('[data-cy="account-notes"]').type('e1')
      cy.get('#save-account-button').click()

      cy.contains('#accounts-table', 'Emergency')
      cy.contains('#accounts-table', 'CHECKING')
    })
  })

  context.only('Transactions page', () => {
    beforeEach(()  => {
      cy.visit('http://localhost:8082/transactions/7kW')
      cy.on('window:before:load', async () => {
        let pouch = new PouchDB(LOCAL_DB_NAME)
        await pouch.destroy()
        pouch = new PouchDB(LOCAL_DB_NAME)
        await pouch.bulkDocs(db_data)
        return
      })
    })
    it('Adds new transaction', () => {
      cy.get('.transaction-row', {timeout: 6000}).should('have.length', 7)

      cy.get('#create-transaction-button').click()
      cy.get('#edit-row-cleared').click()
      cy.get('#edit-row-date input').clear().type('2022-08-20')
      cy.get('#edit-row-category-select input')
        .type('Groceries')
        .type('{downArrow}')
        .type('{downArrow}')
        .type('{enter}')
      cy.get('#edit-row-memo input').type('Supermarket')
      cy.get('#edit-row-outflow input').type('56.23').blur()
      cy.get('#save-edit-button').click()
      cy.get('.transaction-row', {timeout: 600}).should('have.length', 8)
      cy.get(':nth-child(2) > .row-date').should('contain.text', '2022-08-20')
      cy.get(':nth-child(2) > .row-category').should('contain.text', 'Groceries')
      cy.get(':nth-child(2) > .row-memo').should('contain.text', 'Supermarket')
      cy.get(':nth-child(2) > .row-outflow').should('contain.text', '$56.23')
      cy.get(':nth-child(2) > .row-memo').should('not.contain.text', '$')
    })
  })

  // it('Add account and it shows in table', () => {
  //   cy.get('#accountsSidebarBtn').click()

  //   cy.get('#addAccountBtn').click()
  //   cy.get('#nameField').type('myaccount')
  //   cy.get('#typeField').type('CHECKING', { force: true })

  //   cy.get('#saveAccountBtn').click()

  //   cy.get('.account-table').contains("myaccount")

  //   cy.get('#myaccount').click()
  // })

  // it('Add a transaction', () => {
  //   cy.get('#addTransactionBtn').click()

  //   cy.get('#inflow-input').type('55.55', { force: true })
  //   cy.get('#save-btn').click()

  //   cy.get(".transaction-table tbody").find("tr").should("have.length", 1);
  //   cy.get("#inflow").should("contain", "55.55");
  // })

  // it('Add a transaction 2', () => {
  //   cy.get('#addTransactionBtn').click()

  //   cy.get('#outflow-input').type('66.55', { force: true })
  //   cy.get('#save-btn').click()

  //   cy.get(".transaction-table tbody").find("tr").should("have.length", 2);
  //   cy.get(".transaction-table tbody").should("contain", "66.55");
  // })

  // it('test malformed', () => {
  //   cy.get('#addTransactionBtn').click()

  //   cy.get('#outflow-input').type('7ff5.g58', { force: true })
  //   cy.get('#save-btn').click()

  //   cy.get(".transaction-table tbody").find("tr").should("have.length", 3);
  //   cy.get(".transaction-table tbody").should("contain", "75.58");
  // })
})
