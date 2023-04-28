describe('Import bank transactions', () => {
  context('Test import ofx', () => {
    it('Tests import from ING', () => {
      cy.initPath('')
      cy.get('[data-testid="transactions-page-7kW"]').click()

      // Check that pagination shows the correct number
      cy.get('.v-data-footer__pagination').should('contain.text', '1-7 of 7')

      // Import transactions
      cy.get('[data-testid="import-transactions-button"]').click()
      const file = 'tests/__mockdata__/bankexports/ing.ofx'
      cy.get('input[type="file"]').selectFile(file, { force: true })
      cy.get('.heading').should('contain.text', '18 transactions')
      cy.get('[data-testid="import-ofx-transactions-button"]').click()

      // Ensure current account transaction totals are updated
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,762.40')

      // Check that pagination shows the correct number
      cy.get('.v-data-footer__pagination').should('contain.text', '1-20 of 25')

      // Open import dialog again
      cy.get('[data-testid="import-transactions-button"]').click()

      // Ensure that previous data has been cleared
      cy.get('.v-file-input__text').should('not.contain.text', 'ing.ofx')

      // Do same import
      cy.get('input[type="file"]').selectFile(file, { force: true })
      cy.wait(1000)
      cy.get('[data-testid="import-ofx-transactions-button"]').click()

      // Ensure current account transaction totals do not change
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,762.40')

      // Check that page 2 loads correctly
      cy.get('.v-data-footer__icons-after > .v-btn').click()
    })
  })
})
