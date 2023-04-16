describe('Manage budgets', () => {
  context('Test budget backup and restore with db delete in between', () => {
    before(() => {
      cy.initPath('manage')
    })
    it('Checks that backup and restore work properly', () => {
      // Do backup
      cy.get('[data-testid="do-backup-button"]').click()

      // Delete the database
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      // Check that accounts are gone
      cy.get('[data-testid="transactions-page-v6A"]').should('not.exist')
      cy.get('[data-testid="transactions-page-7kW"]').should('not.exist')
      cy.get('[data-testid="transactions-page-ELC"]').should('not.exist')

      // Restore the backup
      cy.get('[data-testid="last-backup-time"]')
        .invoke('text')
        .then((text) => {
          const file = `cypress/downloads/BudgetZero_Export_${text.trim()}.json`
          cy.get('input[type="file"]').selectFile(file, { force: true })
        })
      cy.get('[data-testid="restore-button"]').click()

      // Check that accounts are back
      cy.get('[data-testid="transactions-page-v6A"]').should('contain.text', '$918.43')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')
    })
  })
  context.only('Test that restore from an while budget exists deletes the active budget', () => {
    before(() => {
      cy.initPath('manage')
    })
    it('Checks that backup and restore work properly', () => {
      // Do backup
      cy.get('[data-testid="do-backup-button"]').click()
      cy.get('[data-testid="last-backup-time"]').should('not.contain.text', 'None recorded')
      // Restore the backup
      cy.get('[data-testid="last-backup-time"]')
        .invoke('text')
        .then((text) => {
          cy.wait(1000)
          const file = `cypress/downloads/BudgetZero_Export_${text.trim()}.json`
          cy.get('input[type="file"]').selectFile(file, { force: true })
        })
      cy.get('[data-testid="restore-button"]').click()
      // Check that accounts are back
      cy.get('[data-testid="transactions-page-v6A"]').should('contain.text', '$918.43')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')
    })
  })
  context('Test budget backup and restore with modification in between', () => {
    before(() => {
      cy.initPath('manage')
    })
    it('Checks that backup and restore work properly', () => {
      // Do backup
      cy.get('[data-testid="do-backup-button"]').click()

      // Go to transactions page
      cy.get('[data-testid="transactions-page-v6A"]').click()

      // Change the value of one of the transactions
      cy.get('.transaction-row .row-description').eq(4).click()
      cy.get('[data-testid="details-value"]').click()
      cy.get('[data-testid="details-value"]').type('5.00').type('{enter}')
      cy.get('[data-testid="details-inflow-button"]').click()
      cy.get('[data-testid="save-edit-button"]').click()

      // Add a new transaction
      cy.get('[data-testid="create-transaction-button"]').click()
      cy.get('[data-testid="details-value"]').type('3.00')
      cy.get('[data-testid="save-edit-button"]').click()

      // Go to categories page
      cy.get('[data-testid="sidebar-button-categories"]').click()

      // Change the budgeted value for one of the categories
      const vacation_selector = '[data-testid="category-budget-Lx7"]'
      const vacation_input_selector = '[data-testid="category-budget-input-Lx7"]'
      cy.get(vacation_selector).click()
      cy.get(vacation_input_selector).click('center')
      cy.get(vacation_input_selector).clear()
      cy.get(vacation_input_selector).type('-100')
      cy.get(vacation_input_selector).type('{enter}')
      cy.get(vacation_input_selector).should('have.value', '-$100.00')
      cy.get(vacation_selector).should('have.text', ' -$100.00 ')

      // Go to manage budgets page
      cy.get('[data-testid="sidebar-button-manage"]').click()

      // Restore the backup
      cy.get('[data-testid="last-backup-time"]')
        .invoke('text')
        .then((text) => {
          const file = `cypress/downloads/BudgetZero_Export_${text.trim()}.json`
          cy.get('input[type="file"]').selectFile(file, { force: true })
        })
      cy.get('[data-testid="restore-button"]').click()

      // Check that accounts are back
      cy.get('[data-testid="transactions-page-v6A"]').should('contain.text', '$918.43')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')

      // Go to categories page
      cy.get('[data-testid="sidebar-button-categories"]').click()

      // Check that original values are restored
      cy.get(vacation_input_selector).should('have.value', '$0.00')
    })
  })
})
