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
      cy.get('.transaction-row').should('have.length', 20)
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
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,762.40', { timeout: 10000 })

      // // Check that page 2 loads correctly
      // cy.get('.v-data-footer__icons-after > .v-btn').click()
    })
  }),
    context('Test import CSV', () => {
      it('Tests basic import', () => {
        cy.initPath('')
        cy.get('[data-testid="transactions-page-7kW"]').click()

        // Import transactions
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })
        cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')
        cy.get('[data-testid="use-headers-checkbox"]').click({ force: true })

        // Check that the date format select has an alert icon
        cy.get('[data-testid="date-format-select"]').find('.mdi-alert-circle-outline').should('be.visible')

        // Check that the pagination shows the correct number of transactions
        cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-22 of 22')
        // cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-200 of 563')

        cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')

        // Click the date format select and select the "M/D/YYYY" option
        cy.get('[data-testid="date-format-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()

        // Check that the alert icon is no longer visible in the date format select
        cy.get('[data-testid="date-format-select"]').should('not.have.descendants', '.mdi-alert-circle-outline')

        // Choose column 3 for the 'memo' column
        cy.get('[data-testid="memo-column-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("3 (memo)")').click()

        // Check that the first transaction's memo contains the expected text
        cy.get('.import-preview-memo').eq(0).should('contain.text', 'memo')

        // Check if import button is enabled
        cy.get('[data-testid="import-csv-transactions-button"]').should('not.be.disabled')

        cy.get('[data-testid="import-csv-transactions-button"]').click()
        // Total from import: 43924.02
        // Total from before: 2646.80

        // Ensure loading indicator appears and goes away
        cy.get('.v-progress-circular__overlay').should('exist')
        cy.get('.v-progress-circular__overlay').should('not.exist')

        // Check that pagination shows the correct number
        cy.get('.v-data-footer__pagination').should('contain.text', '1-20 of 29')

        // Ensure current account transaction totals are updated
        cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$5,482.90')

        // Confirm there are 20 .transaction-row elements
        cy.get('.transaction-row').should('have.length', 20)

        // Delete some transactions
        cy.get('.transaction-row > .row-checkbox').eq(9).click()
        cy.get('.transaction-row > .row-checkbox').eq(11).click()
        cy.get('.transaction-row > .row-checkbox').eq(12).click()
        cy.get('[data-testid="delete-selected-transactions-button"]').click()
        cy.get('[data-testid="delete-confirm-button"]').click()
        cy.get('.transaction-row').should('have.length', 20)

        // Check that pagination shows the correct number
        cy.get('.v-data-footer__pagination').should('contain.text', '1-20 of 26')

        // Ensure current account transaction totals are updated
        cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$5,938.76')

        // Open import view again
        cy.get('[data-testid="import-csv-transactions-button"]').click()

        // Ensure that previous data has been cleared
        cy.get('.v-file-input__text').should('not.contain.text', 'csv.csv')

        // Do same import
        cy.get('input[type="file"]').selectFile(file, { force: true })

        // Check that only transactions that were just deleted are white
        cy.get('.import-preview-amount').eq(1).should('not.have.css', 'color', 'rgb(255, 255, 255)')
        cy.get('.import-preview-amount').eq(2).should('have.css', 'color', 'rgb(255, 255, 255)')
        cy.get('.import-preview-amount').eq(3).should('not.have.css', 'color', 'rgb(255, 255, 255)')
        cy.get('.import-preview-amount').eq(4).should('have.css', 'color', 'rgb(255, 255, 255)')
        cy.get('.import-preview-amount').eq(5).should('have.css', 'color', 'rgb(255, 255, 255)')
        cy.get('.import-preview-amount').eq(6).should('not.have.css', 'color', 'rgb(255, 255, 255)')

        cy.get('[data-testid="import-csv-transactions-button"]').click()

        // Ensure current account transaction totals are updated
        cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$5,938.76')
      })
      it('Tests separate credit and debit columns', () => {
        cy.initPath('transactions/7kW')

        // Import transactions
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv_credit_debit.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })
        cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')
        cy.get('[data-testid="use-headers-checkbox"]').click({ force: true })
        cy.get('[data-testid="separate-credit-debit-checkbox"]').click({ force: true })

        // Click the date format select and select the "M/D/YYYY" option
        cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-22 of 22')
        cy.get('[data-testid="date-format-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()

        // Choose column 4 for the 'memo' column
        cy.get('[data-testid="memo-column-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("4 (memo)")').click()

        cy.get('[data-testid="import-csv-transactions-button"]').click()

        // Ensure current account transaction totals are updated
        cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$5,482.90')
      })
      it('Tests data with headers', () => {
        cy.initPath('transactions/7kW')
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv_headers.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })

        // Click the date format select and select the "M/D/YYYY" option
        cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-22 of 22')
        cy.get('[data-testid="date-format-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()

        cy.get('[data-testid="import-csv-transactions-button"]').click()

        // Ensure current account transaction totals are updated
        cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$5,482.90')
      })
      it('Tests data with unusual headers', () => {
        cy.initPath('transactions/7kW')
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv_headers_unusual.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })

        // Click the date format select and select the "M/D/YYYY" option
        cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-22 of 22')
        cy.get('[data-testid="date-format-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()

        // Choose column for the 'memo'
        cy.get('[data-testid="memo-column-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("ddddd")').click()

        // Choose column for the 'amount'
        cy.get('[data-testid="credit-column-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("ccccc"):visible').click()

        // Do the import
        cy.get('[data-testid="import-csv-transactions-button"]').click()

        // Ensure current account transaction totals are updated
        cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$5,482.90')
      })
      it('Tests data with an invalid amount', () => {
        cy.initPath('transactions/7kW')
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv_invalid_amount.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })

        // Click the date format select and select the "M/D/YYYY" option
        cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-22 of 22')
        cy.get('[data-testid="date-format-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()
        cy.get('[data-testid="use-headers-checkbox"]').click({ force: true })

        // Check that the date format select has an alert icon
        cy.get('[data-testid="credit-column-select"]').find('.mdi-alert-circle-outline').should('be.visible')

        // Check that the import button is disabled
        cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')
      })
      it('Tests data with an invalid date', () => {
        cy.initPath('transactions/7kW')
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv_invalid_date.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })

        // Click the date format select and select the "M/D/YYYY" option
        cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-21 of 21')
        cy.get('[data-testid="date-format-select"]').click()
        cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()
        cy.get('[data-testid="use-headers-checkbox"]').click({ force: true })

        // Check that the date format select has an alert icon
        cy.get('[data-testid="date-format-select"]').find('.mdi-alert-circle-outline').should('be.visible')

        // Check that the import button is disabled
        cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')
      })
      it.only('Tests data with only two columns', () => {
        cy.initPath('transactions/7kW')
        cy.get('[data-testid="import-csv-transactions-button"]').click()
        const file = 'tests/__mockdata__/bankexports/csv_two_columns.csv'

        // Select the file to import and click the "Use headers" checkbox
        cy.get('input[type="file"]').selectFile(file, { force: true })

        // // Click the date format select and select the "M/D/YYYY" option
        // cy.get('[data-testid="use-headers-checkbox"]').click({ force: true })
        // cy.get('.import-preview-table .v-data-footer__pagination').should('contain.text', '1-22 of 22')
        // cy.get('[data-testid="date-format-select"]').click()
        // cy.get('.v-list-item__title').filter(':contains("M/D/YYYY")').click()

        // // Check that the import button is disabled
        // cy.get('[data-testid="import-csv-transactions-button"]').should('be.disabled')
      })
    })
})
