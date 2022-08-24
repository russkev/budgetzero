describe('My First Test', () => {
  context("Initial experience", () => {
    beforeEach(() => {
      cy.visit('http://localhost:8082/settings')
    })
    it('Create new budget', () => {
      cy.get('#budget-name-field').type('Cy1')
      cy.get('#budget-create').click()
      cy.get('#agree-button').click()
  
      cy.contains('.v-chip', 'Cy1')
    })
  
  })
  context.only("Accounts page", () => {
    beforeEach(() => {
      cy.visit('http://localhost:8082/accounts')
    })
    it('Adds new account', () => {
      cy.get('.crud-actions').should('have.length', 3)
      cy.get('#add-account-button').click()
      cy.get('[data-cy="account-name"]').type('Emergency')
      cy.get('.v-select__selections').click()
      cy.get('div').contains('CHECKING').click()
      cy.get('[data-cy="account-notes"]').type("e1")
      cy.get('#save-account-button').click()

      cy.contains('#accounts-table', 'Emergency')
      cy.contains('#accounts-table', 'CHECKING')
    })
  })

  context.only("Transactions page", () => {
    beforeEach(() => {
      cy.visit('http://localhost:8082/transactions/7kW')
    })
    it('Adds new transaction', () => {
      cy.get(".transaction-row").should("have.length", 7)

      cy.get('#create-transaction-button').click()
      cy.get('#edit-row-cleared').click()
      cy.get('#edit-row-date input').clear().type('2022-08-20')
      cy.get('#edit-row-category-select input').type('Groceries')
        .type('{downArrow}')
        .type('{downArrow}')
        .type('{enter}')
      cy.get('#edit-row-memo input').type('Supermarket')
      cy.get('#edit-row-outflow').type('56.23')
      cy.get('#save-edit-button').click()
      cy.wait(600)
      cy.get('.transaction-row').should('have.length', 8)


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

