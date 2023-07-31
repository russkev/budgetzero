describe('Test large budget', () => {
  before(() => {
    cy.initPathLarge('transactions/q1F')
  }),
    it('Imports ofx file, checks pages etc.', () => {
      cy.get('.transaction-row', { timeout: 100000 }).should('have.length', 20, { timeout: 100000 })
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
      cy.get('[data-testid="transactions-page-q1F"]').should('contain.text', '$253,194.32', {
        timeout: 100000
      })
      cy.get('[data-testid="create-transaction-button"]', { timeout: 100000 }).should('be.visible')

      // Check that buttons for no transactions selected disable when loading
      cy.get('.v-data-footer__icons-after').click()
      cy.get('[data-testid="create-transaction-button"]').should('be.disabled')
      cy.get('[data-testid="import-transactions-button"]').should('be.disabled')
      cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')
      cy.get('[data-testid="export-excel-button"]').should('be.disabled')

      // Check that multiple selected get deselected and buttons are disabled
      cy.get('.v-progress-linear__buffer', { timeout: 20000 }).should('not.exist')
      cy.get('[data-testid="create-transaction-button"]').should('not.be.disabled')

      cy.get('.transaction-row > .row-checkbox').eq(0).click()
      // cy.get('.transaction-row > .row-checkbox').eq(1).click()
      // cy.get('.v-data-footer__icons-before').click()
      // cy.get('[data-testid="clear-selected-button"]').should('be.disabled')
      // cy.get('[data-testid="unclear-selected-button"]').should('be.disabled')
      // cy.get('[data-testid="categorize-as-button"]').should('be.disabled')
      // cy.get('[data-testid="delete-selected-transactions-button"]').should('be.disabled')
      // cy.get('[data-testid="deselect-all-button"]').should('be.disabled')

      // // Check that a single selected gets deselected
      // cy.get('.v-progress-linear__buffer').should('not.exist')
      // cy.get('[data-testid="create-transaction-button"]').should('be.visible')
      // cy.get('.transaction-row > .row-checkbox').eq(0).click()
      // cy.get('.v-data-footer__icons-after').click()
      // cy.get('.v-progress-linear__buffer').should('not.exist')
      // cy.get('[data-testid="create-transaction-button"]').should('be.visible')
    })
})
