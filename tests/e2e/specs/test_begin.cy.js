describe('Initial experience', () => {
  context('Test budget creation', () => {
    before(() => {
      cy.initPathEmpty('create')
      // cy.visit(`http://localhost:8082/create`)
    })
    it('Creates a new budget', () => {
      cy.get('[data-testid="budget-name-field"]').type('Cy1').type('{enter}')
      cy.get('[data-testid="budget-name-field"]').should('have.value', 'Cy1')
      cy.get('[data-testid="master-checkbox-Giving"]').click({ force: true })
      cy.get('[data-testid="master-checkbox-Giving"]').should('not.be.checked')
      cy.get('[data-testid="checkbox-Tithing"]').should('not.be.checked')
      cy.get('[data-testid="checkbox-Charitable"]').should('not.be.checked')

      cy.get('[data-testid="checkbox-Restaurants"]').click({ force: true })
      cy.get('[data-testid="checkbox-Restaurants"]').should('not.be.checked')
      cy.get('[data-testid="master-checkbox-Everyday Expenses"]').should('not.be.checked')

      cy.get('[data-testid="checkbox-Car Payment"]').click({ force: true })

      cy.get('[data-testid="create-budget-button"]').click()

      cy.url().should('include', '/categories')

      cy.get('div.category-card .master-row').eq(0).should('contain', 'Uncategorized')

      cy.get('div.category-card .master-row').eq(1).should('contain', 'Income')
      cy.get('div.category-card').eq(1).find('div.category-name').eq(0).should('contain', 'Income')

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
  })
})
