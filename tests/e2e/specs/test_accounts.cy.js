describe('Test accounts', () => {
  before(() => {
    cy.initPath('transactions/7kW')
  })
  it('Adds an account', () => {
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="btn-new-account-on-budget"]', { force: true }).click({ force: true })
    cy.get('[data-testid="account-name-input"]').type('Emergency')
    cy.get('[data-testid="btn-modal-confirm"]').click()
    cy.get('.sidebar-on-account-item').should('have.length', 4)

    // Check if third one is Emergency
    cy.get('.sidebar-on-account-item').eq(3).should('contain', 'Emergency')

    // cy.get('.crud-actions', { timeout: 6000 }).should('have.length', 3)
    // cy.get('#add-account-button').click()
    // cy.get('[data-testid="account-name"]', { timeout: 400 }).type('Emergency')
    // cy.get('.v-select__selections').click()
    // cy.get('div').contains('CHECKING').click()
    // cy.get('[data-testid="account-notes"]').type('e1')
    // cy.get('#save-account-button').click()

    // cy.contains('#accounts-table', 'Emergency')
    // cy.contains('#accounts-table', 'CHECKING')
  })
})
