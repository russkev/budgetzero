describe('Test large budget', () => {
  before(() => {
    cy.initPathLarge('transactions/q1F')
  }),
    it('Imports ofx file', () => {
      cy.get('.v-progress-linear__buffer').should('not.exist', { timeout: 10000 })
      cy.get('[data-testid="transactions-page-q1F"]').should('contain.text', '$252,268.02')
      cy.get('[data-testid="transactions-page-9LW"]').should('contain.text', '$237,800.98')

      // Import transactions
      cy.get('[data-testid="import-transactions-button"]').click()
      const file = 'tests/__mockdata__/bankexports/ing.ofx'
      cy.get('input[type="file"]').selectFile(file, { force: true })
      cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-18 of 18')
      // cy.get('.heading').should('contain.text', '18 transactions')
      cy.get('[data-testid="import-ofx-transactions-button"]').click()

      // Ensure current account transaction totals are updated
      cy.get('[data-testid="transactions-page-q1F"]').should('contain.text', '$253,194.32')
    })
})
