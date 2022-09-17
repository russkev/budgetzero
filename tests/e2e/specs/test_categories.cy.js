describe('Test categories (budget) page', () => {
  context('Test values', () => {
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

  context('Test drag and drop', () => {
    before(() => {
      cy.initPath('budget/2022-08')
    })

    it('Drag category to different place in same master category', () => {
      cy.get('[data-testid="master-category-budget-3ks"]').should('have.text', ' $300.84 ')
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 4)
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(2)')
        .find('[data-testid="category-name-6b2"]')
        .should('have.length', 1)
      // Do the drag and drop
      cy.get('[data-testid="drag-category-n00"]').drag('[data-testid="category-name-ATi"]')
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(1)')
        .find('[data-testid="category-name-n00"]')
        .should('have.length', 1)
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(2)')
        .find('[data-testid="category-name-ATi"]')
        .should('have.length', 1)
    })

    it('Checks that values are all the same', () => {
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
    })

    it('Drag category to different master category', () => {
      cy.get('[data-testid="master-category-budget-3ks"]').should('have.text', ' $300.84 ')
      // Do the drag and drop
      cy.get('[data-testid="drag-category-Lx7"]').drag('[data-testid="category-name-gpe"]', {
        target: {
          position: 'bottom'
        }
      })
      cy.get('[data-testid="categories-container-ggJ"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-fVM"]').children().should('have.length', 2)

      cy.get('[data-testid="categories-container-fVM"] > div:nth-child(1)')
        .find('[data-testid="category-name-gpe"]')
        .should('have.length', 1)
      cy.get('[data-testid="categories-container-fVM"] > div:nth-child(2)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)
    })

    it('Checks that values are correctly updated', () => {
      // cy.reload()
      cy.get('[data-testid="master-category-name-input-fVM"]').should('have.value', 'Income')
      cy.get('[data-testid="master-category-budget-fVM"]').should('have.text', ' -$196.24 ')
      cy.get('[data-testid="master-category-spent-fVM"]').should('have.text', ' $2,361.64 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $2,262.19 ')

      cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
      cy.get('[data-testid="category-budget-input-gpe"]').should('have.value', '-$170.90')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,881.64 ')
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')

      cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
      cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '-$25.34')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' -$520.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')
    })
    // Test moving water to above paycheck
  })

  context('Test delete / hide', () => {
    before(() => {
      cy.initPath('budget/2022-08')
    })

    it('Hides a category', () => {
      cy.get('[data-testid="btn-hide-category-Lx7"]').click()

      cy.get('[data-testid="categories-container-ggJ"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-\\:\\:\\:"]').children().should('have.length', 2)

      cy.get('[data-testid="categories-container-\\:\\:\\:"] > div:nth-child(1)')
        .find('[data-testid="category-name-\\:\\:\\:"]')
        .should('have.length', 1)
      cy.get('[data-testid="categories-container-\\:\\:\\:"] > div:nth-child(2)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)

      cy.get('[data-testid="master-category-budget-ggJ"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="master-category-spent-ggJ"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="master-category-balance-ggJ"]').should('have.text', ' $0.00 ')

      cy.get('[data-testid="master-category-budget-\\:\\:\\:"]').should('have.text', ' -$25.34 ')
      cy.get('[data-testid="master-category-spent-\\:\\:\\:"]').should('have.text', ' -$520.00 ')
      cy.get('[data-testid="master-category-balance-\\:\\:\\:"]').should('have.text', ' -$616.66 ')

      cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
      cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '-$25.34')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' -$520.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')
    })
    it('Deletes a master category', () => {
      cy.get('[data-testid="btn-delete-master-category-3ks"]').click()

      cy.get('[data-testid="master-category-name-3ks"]').should('not.exist')
      cy.get('[data-testid="categories-container-\\:\\:\\:"]').children().should('have.length', 6)

      cy.get('[data-testid="master-category-budget-\\:\\:\\:"]').should('have.text', ' $275.50 ')
      cy.get('[data-testid="master-category-spent-\\:\\:\\:"]').should('have.text', ' -$899.64 ')
      cy.get('[data-testid="master-category-balance-\\:\\:\\:"]').should('have.text', ' $398.54 ')

      cy.get('[data-testid="category-name-input-6b2"]').should('have.value', 'Electricity')
      cy.get('[data-testid="category-budget-input-6b2"]').should('have.value', '-$41.84')
      cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')
    })
  })

  context('Test create new categories', () => {
    before(() => {
      cy.initPath('budget/2022-08')
    })

    it('Creates a new category', () => {
      cy.get('[data-testid="btn-new-category-3ks"]').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 5)
      const name_input_selector = '[data-testid="categories-container-3ks"] > div:nth-child(5) .category-name-input input'

      cy.get(name_input_selector).should('not.have.attr', 'readonly')
      cy.get(name_input_selector).should('have.focus')
      cy.get(name_input_selector).type('Internet').type('{enter}')
      cy.get(name_input_selector).should('have.value', 'Internet')
    })

    it('Creates a new master category', () => {
      cy.get('main').find('div.master-category-row').should('have.length', 4)
      cy.get('[data-testid="btn-new-master-category-fVM"]').click()
      cy.get('main').find('div.master-category-row').should('have.length', 5)
      cy.get('main').find('div.master-category-row:nth-child(1) input').should('not.have.attr', 'readonly')
      cy.get('main').find('div.master-category-row:nth-child(1) input').should('have.focus')
      cy.get('main').find('div.master-category-row:nth-child(1) input').type('Dividends').type('{enter}')
      cy.get('main').find('div.master-category-row:nth-child(1) input').should('have.value', 'Dividends')
      cy.get('main').find('div.master-category-row:nth-child(1) .categories-container').children().should('have.length', 0)
    })
  })
})
