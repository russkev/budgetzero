describe('Test accounts', () => {
  // beforeEach(() => {
  // })
  it('Adds a simple account', () => {
    cy.initPath('transactions/7kW')

    // Open the add account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="btn-new-account-on-budget"]', { force: true }).click({ force: true })

    // Give a name
    cy.get('[data-testid="account-name-input"]').type('Emergency').blur()

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').click()

    // Check that account list has been updated correctly
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.sidebar-on-account-item').should('have.length', 4)
    cy.get('.sidebar-on-account-item').eq(3).should('contain', 'Emergency')
  })

  it.only('Tests starting balance', () => {
    cy.initPath('categories/2022-07')
    cy.get('[data-testid="transactions-page-7kW"]').click()

    // Open the edit account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.sidebar-on-account-item').eq(1).click().trigger('mouseover').should('have.class', 'expanded')
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Give a starting balance
    cy.get('[data-testid="account-initial-balance-input"]').type('1000').blur()

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').click()

    // Check transactions values
    cy.get('.transaction-row > .row-balance').eq(3).should('contain.text', '$580.00')
    cy.get('.transaction-row > .row-balance').eq(2).should('contain.text', '$498.68')
    cy.get('.transaction-row > .row-balance').eq(1).should('contain.text', '$438.68')
    cy.get('.transaction-row > .row-balance').eq(0).should('contain.text', '-$81.32')

    cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$81.32')
    cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '-$81.32')
    cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$0.00')
    cy.get('[data-testid="account-balance-working"]').should('contain.text', '-$81.32')

    // Check that categories page was updated correctly
    cy.get('[data-testid="sidebar-button-categories"]').click()

    cy.get('[data-testid="working-carryover"]').should('contain.text', '$1,000.00')
    cy.get('[data-testid="working-income"]').should('contain.text', '$1,586.79')
    cy.get('[data-testid="working-budgeted"]').should('contain.text', '$1,918.26')
    cy.get('[data-testid="working-available"]').should('contain.text', '$668.53')

    cy.get('[data-testid="next-month-button"]').click()
    cy.get('[data-testid="working-carryover"]').should('contain.text', '$668.53')
    cy.get('[data-testid="working-income"]').should('contain.text', '$2,881.64')
    cy.get('[data-testid="working-budgeted"]').should('contain.text', '$275.50')
    cy.get('[data-testid="working-available"]').should('contain.text', '$3,274.67')

    // TODO this spent value is wrong

    // // Open the add account modal
    // cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    // cy.get('.v-progress-linear__buffer').should('exist')
    // cy.get('.v-progress-linear__buffer').should('not.exist')
    // cy.get('[data-testid="btn-new-account-on-budget"]', { force: true }).click({ force: true })

    // // Give a name
    // cy.get('[data-testid="account-name-input"]').type('Emergency').blur()

    // // Give a starting balance
    // cy.get('[data-testid="account-initial-balance-input"]').type('1000').blur()

    // // Apply
    // cy.get('[data-testid="btn-modal-confirm"]').click()

    // // Check that account list has been updated correctly
    // cy.get('.v-progress-linear__buffer').should('exist')
    // cy.get('.v-progress-linear__buffer').should('not.exist')
    // cy.get('.sidebar-on-account-item').should('have.length', 4)
    // cy.get('.sidebar-on-account-item').eq(3).should('contain', 'Emergency')

    // TODO ensure that initial balance works as expected
  })

  it('Deletes an account', () => {
    // Open the edit account modal
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
