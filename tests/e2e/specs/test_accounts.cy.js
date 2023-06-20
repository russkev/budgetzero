describe('Test accounts', () => {
  beforeEach(() => {
    cy.initPath('transactions/7kW')
  })
  it('Adds a simple account', () => {
    // Open the add account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="btn-new-account-on-budget"]', { force: true }).click({ force: true })

    // Give a name
    cy.get('[data-testid="account-name-input"]').type('Emergency')

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').click()

    // Check that account list has been updated correctly
    cy.get('.sidebar-on-account-item').should('have.length', 4)
    cy.get('.sidebar-on-account-item').eq(3).should('contain', 'Emergency')
  })

  it.only('Deletes an account', () => {
    // Open the add account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.sidebar-on-account-item').eq(1).click().trigger('mouseover').should('have.class', 'expanded')
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Delete account transactions
    cy.get('[data-testid="btn-delete-account-transactions"]').click()
    cy.get('[data-testid="delete-confirm-button"]').click()

    // Check that there are no transactions left
    cy.get('.transaction-row').should('have.length', 0)

    // Check that header was updated
    cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' $0.00')
    cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $0.00')
    cy.get('[data-testid="account-balance-working"]').should('contain.text', ' $0.00')

    // Check that sidebar balance was updated
    cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '$0.00')
    cy.get('[data-testid="sidebar-group-accounts"]').should('contain.text', '$3,754.53')

    // Re-open the account modal
    cy.get('.sidebar-on-account-item').eq(1).click().trigger('mouseover').should('have.class', 'expanded')
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Delete the account
    cy.get('[data-testid="btn-delete-account"]').click()
    cy.get('[data-testid="delete-confirm-button"]').filter(':visible').click()

    // Check that account is removed from list
    cy.get('.sidebar-on-account-item').should('have.length', 2)
    cy.get('.sidebar-on-account-item').eq(1).should('not.contain', 'Credit')

    // Check that we are redirected
    cy.get('[data-testid="transactions-heading"]').should('contain.text', 'Savings')
  })
  // Test invert balance
})
