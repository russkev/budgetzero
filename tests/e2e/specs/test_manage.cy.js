describe('Manage budgets', () => {
  context('Test local backup and restore', () => {
    beforeEach(() => {
      cy.initPath('manage')
    })
    it('Checks that backup and restore work properly with deleting in between', () => {
      // Do backup
      cy.get('[data-testid="do-backup-button"]').click()

      // Load backup file
      cy.get('[data-testid="last-backup-time"]')
        .invoke('text')
        .then((text) => {
          // Delete the database
          cy.get('[data-testid="delete-local-db-button"]').click()
          cy.get('[data-testid="delete-confirm-button"]').click()

          // Check that accounts are gone
          cy.get('[data-testid="transactions-page-v6A"]').should('not.exist')
          cy.get('[data-testid="transactions-page-7kW"]').should('not.exist')
          cy.get('[data-testid="transactions-page-ELC"]').should('not.exist')

          // cy.get('input[type="file"]').selectFile(file, { force: true })

          // Ensure automatic redirect to landing page
          cy.url().should('include', '/landing')

          // Restore the backup
          cy.get('[data-testid="restore-budget-button"]').click()
          const file = `cypress/downloads/BudgetZero_Export_${text.trim()}.json`
          cy.get('input[type="file"]').selectFile(file, { force: true })
          cy.get('[data-testid="restore-button"]').click()

          // Check that accounts are back
          cy.get('[data-testid="transactions-page-v6A"]').should('contain.text', '$918.43')
          cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
          cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')
        })
    })
    it('Checks that backup and restore work properly without deleting in between', () => {
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
    it('Checks that backup and restore work properly with changes in between', () => {
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
    it('Checks that a new budget can be created after database deleted', () => {
      // Delete the database
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('[data-testid="create-new-budget-button"]').click()
      cy.get('[data-testid="budget-name-field"]').type('Test Budget')
      cy.get('[data-testid="create-budget-button"]').click()
      // Ensure automatic redirect to manage page
      cy.url().should('include', '/manage')
    })
  })
  context('Test cloud backup and restore', () => {
    it('Checks connection to cloud server', () => {
      // cy.visit('http://localhost:8082/manage/')
      cy.initPath('manage')

      // Check that address indicates that noting is input
      cy.get('[data-testid="cloud-sync-url"]').should('have.value', 'No URL set')

      // Input cloud server address
      cy.get('[data-testid="edit-cloud-button"]').click()
      cy.get('[data-testid="cloud-sync-url"]').type(Cypress.env('CYPRESS_CLOUD_ADDRESS'))
      // cy.get('[data-testid="cloud-sync-url"]').type('http://127.0.0.1:5984/cypress-test')
      cy.get('[data-testid="save-edit-button"]').click()
    })
    it('Checks that changes are updated to the cloud', () => {
      const new_value_1 = 5
      const new_value_2 = 2
      // Go to transactions page
      cy.initPath('transactions/v6A')

      cy.get('.transaction-row .row-description').should('have.length', 5)

      // // Delete existing extra transactions if they exist
      // deleteExtraTransactions()

      // Add a new transaction
      cy.get('[data-testid="create-transaction-button"]').click()
      cy.get('[data-testid="details-value"]').type(`${new_value_1}.00`)
      cy.get('[data-testid="save-edit-button"]').click()

      // Confirm the data is updated
      cy.get('[data-testid="transactions-page-v6A"]', { timeout: 20000 }).should(
        'contain.text',
        `$${918 + new_value_1}.43`
      )

      // Go to manage budgets page
      cy.get('[data-testid="sidebar-button-manage"]').click()

      // Check that address indicates that noting is input
      cy.get('[data-testid="cloud-sync-url"]').should('have.value', 'No URL set')

      // Input cloud server address
      cy.get('[data-testid="edit-cloud-button"]').click()
      // cy.get('[data-testid="cloud-sync-url"]').type(Cypress.env('CYPRESS_CLOUD_ADDRESS'))
      cy.get('[data-testid="cloud-sync-url"]').type('http://127.0.0.1:5984/cypress-test')
      cy.get('[data-testid="save-edit-button"]').click()

      // Check that sync has happened
      cy.get('[data-testid="sync-status-chip').should('contain.text', 'Synced', { timeout: 10000 })

      // // Go to transactions page
      // cy.get('[data-testid="transactions-page-v6A"]').click()

      // Delete the local database
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      // Check that accounts are gone
      cy.get('[data-testid="transactions-page-v6A"]').should('not.exist')
      cy.get('[data-testid="transactions-page-7kW"]').should('not.exist')
      cy.get('[data-testid="transactions-page-ELC"]').should('not.exist')

      // Check that sync has happened
      cy.get('[data-testid="sync-status-chip', { timeout: 10000 }).should('contain.text', 'Synced', { timeout: 10000 })

      // Go to transactions page
      cy.get('[data-testid="transactions-page-v6A"]', { timeout: 10000 }).click()

      cy.get('.v-progress-linear__buffer').should('exist')
      cy.get('.v-progress-linear__buffer', { timeout: 100000 }).should('not.exist', { timeout: 100000 })
      cy.get('.transaction-row .row-description').each(($row, index, $list) => {
        if (index < $list.length - 6) {
          cy.get('.transaction-row .row-delete').eq(0).click({ force: true })
          cy.get('[data-testid="delete-confirm-button"]').filter(':visible').click()
          cy.get('.v-progress-linear__buffer').should('exist')
          cy.get('.v-progress-linear__buffer', { timeout: 100000 }).should('not.exist', { timeout: 100000 })
        }
      })

      // Check that the correct number of transactions are present
      cy.get('.transaction-row .row-description').should('have.length', 6)

      // delete extra transactions if they exist

      // Confirm the data is updated
      cy.get('[data-testid="transactions-page-v6A"]').should('contain.text', `$${918 + new_value_1}.43`)
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')

      // Change new transaction value again
      // cy.get('.v-progress-linear__buffer').should('exist')
      cy.get('.v-progress-linear__buffer').should('not.exist')
      cy.get('.transaction-row .row-description').eq(0).click()
      cy.get('[data-testid="details-value"]', { timeout: 10000 }).click()
      cy.get('[data-testid="details-value"]').type(`${new_value_2}.00`).type('{enter}')
      cy.get('[data-testid="save-edit-button"]').click()

      // Confirm the data is updated
      cy.get('[data-testid="transactions-page-v6A"]', { timeout: 20000 }).should(
        'contain.text',
        `$${918 + new_value_2}.43`
      )

      // Go to manage budgets page
      cy.get('[data-testid="sidebar-button-manage"]').click()

      // Delete the local database
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      // Check that accounts are gone
      cy.get('[data-testid="transactions-page-v6A"]').should('not.exist')
      cy.get('[data-testid="transactions-page-7kW"]').should('not.exist')
      cy.get('[data-testid="transactions-page-ELC"]').should('not.exist')

      // Check that data automatically updates from cloud
      cy.get('[data-testid="transactions-page-v6A"]', { timeout: 20000 }).should(
        'contain.text',
        `$${918 + new_value_2}.43`
      )

      // Go to transactions page
      cy.get('[data-testid="transactions-page-v6A"]').click()

      // cy.wait(10000)
      cy.get('.v-progress-linear__buffer').should('not.exist')

      // Delete the newly created transaction
      cy.get('.transaction-row .row-delete').eq(0).click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.v-progress-linear__buffer').should('exist')
      cy.get('.v-progress-linear__buffer').should('not.exist')
      cy.get('.transaction-row').should('have.length', 5, { timeout: 10000 })

      // Check that accounts are updated
      cy.get('[data-testid="transactions-page-v6A"]', { timeout: 10000 }).should('contain.text', '$918.43')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')
    })
  })
})
