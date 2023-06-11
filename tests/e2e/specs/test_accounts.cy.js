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
  })
})
