// https://docs.cypress.io/api/introduction/api.html

const { it } = require("vitest")

describe('My First Test', () => {
  it('Create new budget', () => {
    // cy.visit('http://localhost:8082/settings')
    cy.visit('https://www.cypress.io/')
    cy.get('#budget-name-field').type('Cy1')
    // cy.get('#budget-create').click()
    // cy.get('#agree-button').click()

    // // cy.get('.v-chip').should('have.text', 'Cy1')
    // cy.contains('.v-chip', 'Cy1')
  })

  // it('Adds new account', () => {
  //   cy.visit('http://localhost:8082/accounts')
  //   cy.get('#add-account-button').click()
  // })

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

