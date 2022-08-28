describe('Test categories (budget) page', () => {
  before(() => {
    cy.initPath('budget/2022-07')
  })

  it('Checks category values for July', () => {
    cy.get('[data-testid="master-category-name-input-fVM"]').should('have.value', 'Income')
    cy.get('[data-testid="master-category-budget-fVM"]').should('have.text', ' -$1,500.00 ')
    cy.get('[data-testid="master-category-spent-fVM"]').should('have.text', ' $1,586.79 ')
    cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $86.79 ')

    cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
    cy.get('[data-testid="category-budget-input-gpe"]').should('have.value', '-$1,500.00')
    cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $1,586.79 ')
    cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $86.79 ')

    //---------------------------------------------------------------------//

    cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
    cy.get('[data-testid="master-category-budget-3ks"]').should('have.text', ' $1,488.26 ')
    cy.get('[data-testid="master-category-spent-3ks"]').should('have.text', ' -$394.26 ')
    cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $1,094.00 ')

    cy.get('[data-testid="category-name-input-ATi"]').should('have.value', 'Groceries')
    cy.get('[data-testid="category-budget-input-ATi"]').should('have.value', '$1,003.26')
    cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' -$60.00 ')
    cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $943.26 ')

    cy.get('[data-testid="category-name-input-6b2"]').should('have.value', 'Electricity')
    cy.get('[data-testid="category-budget-input-6b2"]').should('have.value', '$50.00')
    cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $50.00 ')     

    cy.get('[data-testid="category-name-input-n00"]').should('have.value', 'Gas')
    cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$420.00')
    cy.get('[data-testid="category-spent-n00"]').should('have.text', ' -$334.26 ')
    cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $85.74 ')

    cy.get('[data-testid="category-name-input-2aW"]').should('have.value', 'Water')
    cy.get('[data-testid="category-budget-input-2aW"]').should('have.value', '$15.00')
    cy.get('[data-testid="category-spent-2aW"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $15.00 ')

    //---------------------------------------------------------------------//

    cy.get('[data-testid="master-category-name-input-ggJ"]').should('have.value', 'Misc')

    cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
    cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '$430.00')
    cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' -$420.00 ')
    cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' $10.00 ')

    //---------------------------------------------------------------------//

    cy.get('[data-testid="master-category-name-input-\\:\\:\\:"]').should('have.value', 'Uncategorized')

    cy.get('[data-testid="category-name-input-\\:\\:\\:"]').should('have.value', 'Uncategorized')
    cy.get('[data-testid="category-budget-input-\\:\\:\\:"]').should('have.value', '$0.00')
    cy.get('[data-testid="category-spent-\\:\\:\\:"]').should('have.text', ' -$81.32 ')
    cy.get('[data-testid="category-balance-\\:\\:\\:"]').should('have.text', ' -$81.32 ')
  })


  it('Checks category values for August and September', () => {
    cy.get('[data-testid="next-month-button"]').click()

    cy.get('[data-testid="master-category-name-input-fVM"]').should('have.value', 'Income')
    cy.get('[data-testid="master-category-budget-fVM"]').should('have.text', ' -$170.90 ')
    cy.get('[data-testid="master-category-spent-fVM"]').should('have.text', ' $2,881.64 ')
    cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $2,797.53 ')

    cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
    cy.get('[data-testid="category-budget-input-gpe"]').should('have.value', '-$170.90')
    cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,881.64 ')
    cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')

    //---------------------------------------------------------------------//

    cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
    cy.get('[data-testid="master-category-budget-3ks"]').should('have.text', ' $300.84 ')
    cy.get('[data-testid="master-category-spent-3ks"]').should('have.text', ' -$379.64 ')
    cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $1,015.20 ')

    cy.get('[data-testid="category-name-input-ATi"]').should('have.value', 'Groceries')
    cy.get('[data-testid="category-budget-input-ATi"]').should('have.value', '$242.33')
    cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' -$379.64 ')
    cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $805.95 ')

    cy.get('[data-testid="category-name-input-6b2"]').should('have.value', 'Electricity')
    cy.get('[data-testid="category-budget-input-6b2"]').should('have.value', '-$41.84')
    cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')

    cy.get('[data-testid="category-name-input-n00"]').should('have.value', 'Gas')
    cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '-$61.90')
    cy.get('[data-testid="category-spent-n00"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $23.84 ')

    cy.get('[data-testid="category-name-input-2aW"]').should('have.value', 'Water')
    cy.get('[data-testid="category-budget-input-2aW"]').should('have.value', '$162.25')
    cy.get('[data-testid="category-spent-2aW"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $177.25 ')

    // //---------------------------------------------------------------------//

    cy.get('[data-testid="master-category-name-input-ggJ"]').should('have.value', 'Misc')
    cy.get('[data-testid="master-category-budget-ggJ"]').should('have.text', ' -$25.34 ')
    cy.get('[data-testid="master-category-spent-ggJ"]').should('have.text', ' -$520.00 ')
    cy.get('[data-testid="master-category-balance-ggJ"]').should('have.text', ' -$535.34 ')

    cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
    cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '-$25.34')
    cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' -$520.00 ')
    cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')

    // //---------------------------------------------------------------------//

    cy.get('[data-testid="master-category-name-input-\\:\\:\\:"]').should('have.value', 'Uncategorized')
    cy.get('[data-testid="master-category-budget-\\:\\:\\:"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="master-category-spent-\\:\\:\\:"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="master-category-balance-\\:\\:\\:"]').should('have.text', ' -$81.32 ')

    cy.get('[data-testid="category-name-input-\\:\\:\\:"]').should('have.value', 'Uncategorized')
    cy.get('[data-testid="category-budget-input-\\:\\:\\:"]').should('have.value', '$0.00')
    cy.get('[data-testid="category-spent-\\:\\:\\:"]').should('have.text', ' $0.00 ')
    cy.get('[data-testid="category-balance-\\:\\:\\:"]').should('have.text', ' -$81.32 ')

    // //---------------------------------------------------------------------//
    // September

    cy.get('[data-testid="next-month-button"]').click()
    cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $2,797.53 ')
    cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')
    cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $805.95 ')
    cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')
    cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $23.84 ')
    cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $177.25 ')
    cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')
    cy.get('[data-testid="category-balance-\\:\\:\\:"]').should('have.text', ' -$81.32 ')

    // Return to start page for future tests
    cy.get('[data-testid="previous-month-button"]').click()
    cy.get('[data-testid="previous-month-button"]').click()

  })

  it('Checks that pressing enter on budget input causes the next one to be highlighted', () => {
    cy.get('[data-testid="category-budget-input-gpe"]').should('have.attr', 'readonly')
    cy.get('[data-testid="category-budget-input-gpe"]').click().type('{enter}')
    cy.get('[data-testid="category-budget-input-gpe"]').should('have.attr', 'readonly')

    cy.get('[data-testid="category-budget-input-ATi"]').should('not.have.attr', 'readonly')
    cy.get('[data-testid="category-budget-input-ATi"]').should('have.focus')
    cy.get('[data-testid="category-budget-input-ATi"]').type('{enter}')

    cy.get('[data-testid="category-budget-input-6b2"]').should('have.focus')
  })

  it('Checks that updating a budget value updates balance correctly', () => {
    cy.get('[data-testid="category-budget-input-n00"]').focus().click().type('23.24').blur()
    cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$23.24')
    cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$311.02 ')
    cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $697.24 ')

    cy.get('[data-testid="next-month-button"]').click()
    cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$372.92 ')
    cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $618.44 ')


    cy.get('[data-testid="next-month-button"]').click()
    cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$372.92 ')
    cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $618.44 ')

    // Return to start page for future tests
    cy.get('[data-testid="previous-month-button"]').click()
    cy.get('[data-testid="previous-month-button"]').click()
  })

})
