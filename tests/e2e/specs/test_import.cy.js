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
      cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-18 of 18')
      // cy.get('.heading').should('contain.text', '18 transactions')
      cy.get('[data-testid="import-ofx-transactions-button"]').click()

      // Ensure current account transaction totals are updated
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,762.40')

      // Check that pagination shows the correct number
      cy.get('.v-data-footer__pagination').should('contain.text', '1-20 of 25')

      // Delete some transactions
      cy.get('.v-progress-linear__buffer').should('not.exist')
      cy.get('.transaction-row > .row-checkbox').eq(9).click()
      cy.get('.transaction-row > .row-checkbox').eq(13).click()
      cy.get('.transaction-row > .row-checkbox').eq(14).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 20)

      // Check that pagination shows the correct number
      cy.get('.v-data-footer__pagination').should('contain.text', '1-20 of 22')

      // Ensure current account transaction totals are updated
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,736.60')

      // Open import dialog again
      cy.get('[data-testid="import-transactions-button"]').click()

      // Ensure that previous data has been cleared
      cy.get('.v-file-input__text').should('not.contain.text', 'ing.ofx')

      // Do same import
      cy.get('input[type="file"]').selectFile(file, { force: true })

      // Check that only transactions that were just deleted are white
      cy.get('.import-preview-amount').eq(1).should('not.have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('.import-preview-amount').eq(2).should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('.import-preview-amount').eq(3).should('not.have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('.import-preview-amount').eq(6).should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('.import-preview-amount').eq(7).should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('.import-preview-amount').eq(8).should('not.have.css', 'color', 'rgb(255, 255, 255)')
      // cy.wait(1000)
      cy.get('[data-testid="import-ofx-transactions-button"]').click()

      // Ensure current account transaction totals do not change
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,762.40')

      // // Check that page 2 loads correctly
      // cy.get('.v-data-footer__icons-after > .v-btn').click()
    })
  })
})
