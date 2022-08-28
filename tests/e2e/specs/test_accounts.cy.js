describe('Test accounts', () => {
  before(() => {
    cy.initPath('accounts')
  })
  it('Adds an account', () => {
    cy.get('.crud-actions', { timeout: 6000 }).should('have.length', 3)
    cy.get('#add-account-button').click()
    cy.get('[data-cy="account-name"]', { timeout: 400 }).type('Emergency')
    cy.get('.v-select__selections').click()
    cy.get('div').contains('CHECKING').click()
    cy.get('[data-cy="account-notes"]').type('e1')
    cy.get('#save-account-button').click()

    cy.contains('#accounts-table', 'Emergency')
    cy.contains('#accounts-table', 'CHECKING')
  })
})