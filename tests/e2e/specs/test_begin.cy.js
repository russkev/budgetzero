describe('Initial experience', () => {
  context('Test budget creation', () => {
    it('Creates a new budget', () => {
      cy.initPathEmpty('categories/2022-07')
      // Ensure automatic redirect to landing page
      cy.url().should('include', '/landing')

      // Create new budget
      cy.get('[data-testid="create-new-budget-button"]').click()

      // Input name
      cy.get('[data-testid="budget-name-field"]').type('Cy1').type('{enter}')
      cy.get('[data-testid="budget-name-field"]').should('have.value', 'Cy1')

      // Uncheck some checkboxes
      cy.get('[data-testid="master-checkbox-Giving"]').click({ force: true })
      cy.get('[data-testid="master-checkbox-Giving"]').should('not.be.checked')
      cy.get('[data-testid="checkbox-Tithing"]').should('not.be.checked')
      cy.get('[data-testid="checkbox-Charitable"]').should('not.be.checked')

      cy.get('[data-testid="checkbox-Restaurants"]').click({ force: true })
      cy.get('[data-testid="checkbox-Restaurants"]').should('not.be.checked')
      cy.get('[data-testid="master-checkbox-Everyday Expenses"]').should('not.be.checked')

      cy.get('[data-testid="checkbox-Car Payment"]').click({ force: true })

      // Click 'Create'
      cy.get('[data-testid="create-budget-button"]').click()

      // Ensure automatic redirect to categories page
      cy.url().should('include', '/categories')

      // Ensure 'Uncategorized' category is present
      cy.get('div.category-card .master-row').eq(0).should('contain', 'Uncategorized')

      // Ensure 'Income' category is present
      cy.get('div.category-card .master-row').eq(1).should('contain', 'Income')
      cy.get('div.category-card').eq(1).find('div.category-name').eq(0).should('contain', 'Income')

      // Ensure the rest of the categories display correctly
      cy.get('div.category-card .master-row input').eq(0).should('have.value', 'Everyday Expenses')
      cy.get('div.category-card').eq(2).find('div.category-name').eq(0).should('contain', 'Groceries')
      cy.get('div.category-card').eq(2).find('div.category-name').eq(1).should('contain', 'Household Goods')
      cy.get('div.category-card').eq(2).find('div.category-name').eq(2).should('contain', 'Spending Money')

      cy.get('div.category-card .master-row input').eq(1).should('have.value', 'Monthly Bills')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(0).should('contain', 'Medical/Dental')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(1).should('contain', 'Internet')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(2).should('contain', 'Rent/Mortgage')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(3).should('contain', 'Clothing')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(4).should('contain', 'Water')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(5).should('contain', 'Renters Insurance')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(6).should('contain', 'Car Insurance')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(7).should('contain', 'Phone')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(8).should('contain', 'Fuel')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(9).should('contain', 'Car Maintenance')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(10).should('contain', 'Electricity')
      cy.get('div.category-card').eq(3).find('div.category-name').eq(11).should('contain', 'Cable TV')

      cy.get('div.category-card .master-row input').eq(2).should('have.value', 'Debt')
      cy.get('div.category-card').eq(4).find('div.category-name').eq(0).should('contain', 'Student Loan Payment')

      cy.get('div.category-card .master-row input').eq(3).should('have.value', 'Savings Goals')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(0).should('contain', 'Rainy Day Funds')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(1).should('contain', 'Christmas')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(2).should('contain', 'Birthdays')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(3).should('contain', 'Emergency Fund')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(4).should('contain', 'Car Replacement')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(5).should('contain', 'Retirement')
      cy.get('div.category-card').eq(5).find('div.category-name').eq(6).should('contain', 'Vacation')
    })
    it('Loads a budget from backup', () => {
      cy.initPathEmpty('manage')

      // Ensure automatic redirect to landing page
      cy.url().should('include', '/landing')

      // Click 'Load from backup'
      cy.get('[data-testid="restore-budget-button"]').click()

      // Load backup file
      const file = 'tests/__mockdata__/budgetzero_export.json'
      cy.get('input[type="file"]').selectFile(file, { force: true })

      cy.get('[data-testid="restore-button"]').click()

      // Check that accounts are back
      cy.get('[data-testid="transactions-page-v6A"]').should('contain.text', '$918.43')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')
    })
    it('Loads a budget from cloud sync', () => {
      // cy.initPathEmpty('')
      cy.initPathRemote('')

      // Ensure automatic redirect to landing page
      cy.url().should('include', '/landing')
      cy.get('[data-testid="full-screen-loading"]').should('not.exist')

      // Click 'Sync with cloud'
      cy.get('[data-testid="sync-budget-button"]').click()

      // Input cloud server address
      cy.get('[data-testid="cloud-sync-url"]').type(Cypress.env('CYPRESS_CLOUD_ADDRESS'))
      cy.get('[data-testid="save-edit-button"]').click()

      // Confirm the data is updated
      cy.get('[data-testid="transactions-page-v6A"]', { timeout: 20000 }).should('contain.text', '$918.43')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$1,081.32')
    })
    it('Checks that landing page redirects if budget exists', () => {
      cy.initPath('landing')

      // Ensure automatic redirect to categories page
      cy.url().should('include', '/categories')
    })
    it('Checks that enter and ctrl+enter works', () => {
      cy.initPathEmpty('landing')

      /* ------- Name Field ------- */
      cy.get('[data-testid="create-new-budget-button"]').click()
      // Input name
      cy.get('[data-testid="budget-name-field"]').type('Cy1').type('{ctrl+enter}')

      // Ensure automatic redirect to categories page
      cy.url().should('include', '/categories')

      /* ------- Master Categories Checkbox ------- */
      cy.get('[data-testid="sidebar-button-manage"]').click()
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      // Create new budget
      cy.get('[data-testid="create-new-budget-button"]').click()
      // Input name
      cy.get('[data-testid="budget-name-field"]').type('Cy1')
      // Uncheck a checkbox
      cy.get('[data-testid="master-checkbox-Giving"]').click({ force: true }).type('{ctrl+enter}', { force: true })

      // Ensure automatic redirect to categories page
      cy.url().should('include', '/categories')

      /* ------- Category Checkbox ------- */
      cy.get('[data-testid="sidebar-button-manage"]').click()
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      // Create new budget
      cy.get('[data-testid="create-new-budget-button"]').click()
      // Input name
      cy.get('[data-testid="budget-name-field"]').type('Cy1')
      // Uncheck a checkbox
      cy.get('[data-testid="checkbox-Tithing"]').click({ force: true }).type('{ctrl+enter}', { force: true })

      // Ensure automatic redirect to categories page
      cy.url().should('include', '/categories')

      /* ------- Cloud Sync Address ------- */
      cy.get('[data-testid="sidebar-button-manage"]').click()
      cy.get('[data-testid="delete-local-db-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      cy.get('[data-testid="sync-budget-button"]').click()
      cy.get('[data-testid="cloud-sync-url"]').type('TestAddress').type('{enter}')
      cy.get('[data-testid="cloud-sync-url"]').should('have.attr', 'readonly')
      cy.get('[data-testid="cloud-sync-url"]').should('have.value', 'TestAddress')
    })

    it.only('Checks that esc key goes back to main landing page', () => {
      cy.initPathEmpty('landing')

      /* ------- Name Field ------- */
      cy.get('[data-testid="create-new-budget-button"]').click()
      cy.get('[data-testid="budget-name-field"]').type('Cy1').type('{esc}')
      cy.get('[data-testid="landing-title"]').should('contain.text', 'No budget loaded')

      /* ------- Master Categories Checkbox ------- */
      cy.get('[data-testid="create-new-budget-button"]').click()
      cy.get('[data-testid="master-checkbox-Giving"]').click({ force: true }).type('{esc}', { force: true })
      cy.get('[data-testid="landing-title"]').should('contain.text', 'No budget loaded')

      /* ------- Category Checkbox ------- */
      cy.get('[data-testid="create-new-budget-button"]').click()
      cy.get('[data-testid="checkbox-Tithing"]').click({ force: true }).type('{esc}', { force: true })
      cy.get('[data-testid="landing-title"]').should('contain.text', 'No budget loaded')

      /* ------- Import From File ------- */
      cy.get('[data-testid="restore-budget-button"]').click()
      const file = 'tests/__mockdata__/budgetzero_export.json'
      cy.get('input[type="file"]').selectFile(file, { force: true })
      cy.get('[data-testid="restore-button"]').should('not.be.disabled')
      cy.get('[data-testid="restore-button"]').focus().type('{esc}')
      cy.get('[data-testid="landing-title"]').should('contain.text', 'No budget loaded')

      /* ------- Cloud Sync Address ------- */
      cy.get('[data-testid="sync-budget-button"]').click()
      cy.get('[data-testid="cloud-sync-url"]').type('{esc}')
      cy.get('[data-testid="cloud-sync-url"]').should('have.attr', 'readonly')
      cy.get('[data-testid="landing-back-button"]').click()

      /* ------- Cloud Edit Button ------- */
      cy.get('[data-testid="sync-budget-button"]').click()
      cy.get('[data-testid="cloud-sync-url"]').type('{esc}')
      cy.get('[data-testid="edit-cloud-button"]').focus().type('{esc}')
      cy.get('[data-testid="landing-title"]').should('contain.text', 'No budget loaded')

      /* ------- Cloud Clear Button ------- */
      cy.get('[data-testid="sync-budget-button"]').click()
      cy.get('[data-testid="cloud-sync-url"]').type('{esc}')
      cy.get('[data-testid="clear-cloud-button"]').focus().type('{esc}')
      cy.get('[data-testid="landing-title"]').should('contain.text', 'No budget loaded')
    })
  })
})
