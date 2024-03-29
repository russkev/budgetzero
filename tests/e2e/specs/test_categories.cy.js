describe('Test categories (budget) page', () => {
  context('Test values', () => {
    beforeEach(() => {
      cy.initPath('categories/2022-07')
    })

    it('Checks category values', () => {
      //---------------------------------------------------------------------//
      // Check for July
      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $1,586.79 ')

      cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $1,586.79 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $1,488.26 ')
      cy.get('[data-testid="master-category-spent-3ks"]').should('contain.text', ' $394.26 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,094.00 ')

      cy.get('[data-testid="category-name-ATi"]').should('have.text', ' Groceries ')
      cy.get('[data-testid="category-budget-ATi"]').should('have.text', ' $1,003.26 ')
      cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' $60.00 ')
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $943.26 ')

      cy.get('[data-testid="category-name-6b2"]').should('have.text', ' Electricity ')
      cy.get('[data-testid="category-budget-6b2"]').should('have.text', ' $50.00 ')
      cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $50.00 ')

      cy.get('[data-testid="category-name-n00"]').should('have.text', ' Gas ')
      cy.get('[data-testid="category-budget-n00"]').should('have.text', ' $420.00 ')
      cy.get('[data-testid="category-spent-n00"]').should('have.text', ' $334.26 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $85.74 ')

      cy.get('[data-testid="category-name-2aW"]').should('have.text', ' Water ')
      cy.get('[data-testid="category-budget-2aW"]').should('have.text', ' $15.00 ')
      cy.get('[data-testid="category-spent-2aW"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $15.00 ')

      // Check working
      cy.get('[data-testid="working-carryover"]').should('contain.text', '$0.00')
      cy.get('[data-testid="working-income"]').should('contain.text', '$1,586.79')
      cy.get('[data-testid="working-spent"]').should('not.exist')
      cy.get('[data-testid="working-budgeted"]').should('contain.text', '$1,918.26')
      cy.get('[data-testid="working-available"]').should('contain.text', '-$331.47')

      // Check total balance header item
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget')
      cy.get('[data-testid="total-balance"]').should('contain.text', '$331.47')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-ggJ"]').should('have.value', 'Misc')

      cy.get('[data-testid="category-name-Lx7"]').should('have.text', ' Vacation ')
      cy.get('[data-testid="category-budget-Lx7"]').should('have.text', ' $430.00 ')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' $420.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' $10.00 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="uncategorized-name"]').should('contain.text', 'Uncategorized')
      cy.get('[data-testid="uncategorized-spent"]').should('contain.text', ' $81.32 ')
      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$81.32 ')

      //---------------------------------------------------------------------//
      // Check for August
      //---------------------------------------------------------------------//
      cy.get('[data-testid="next-month-button"]').click()

      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $2,881.64 ')

      cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,881.64 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $300.84 ')
      cy.get('[data-testid="master-category-spent-3ks"]').should('contain.text', ' $379.64 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,015.20 ')

      cy.get('[data-testid="category-name-ATi"]').should('have.text', ' Groceries ')
      cy.get('[data-testid="category-budget-ATi"]').should('have.text', ' $242.33 ')
      cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' $379.64 ')
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $805.95 ')

      cy.get('[data-testid="category-name-6b2"]').should('have.text', ' Electricity ')
      cy.get('[data-testid="category-budget-6b2"]').should('have.text', ' -$41.84 ')
      cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')

      cy.get('[data-testid="category-name-n00"]').should('have.text', ' Gas ')
      cy.get('[data-testid="category-budget-n00"]').should('have.text', ' -$61.90 ')
      cy.get('[data-testid="category-spent-n00"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $23.84 ')

      cy.get('[data-testid="category-name-2aW"]').should('have.text', ' Water ')
      cy.get('[data-testid="category-budget-2aW"]').should('have.text', ' $162.25 ')
      cy.get('[data-testid="category-spent-2aW"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $177.25 ')

      // //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-ggJ"]').should('have.value', 'Misc')
      cy.get('[data-testid="master-category-budget-ggJ"]').should('contain.text', ' -$25.34 ')
      cy.get('[data-testid="master-category-spent-ggJ"]').should('contain.text', ' $520.00 ')
      cy.get('[data-testid="master-category-balance-ggJ"]').should('contain.text', ' -$535.34 ')

      cy.get('[data-testid="category-name-Lx7"]').should('have.text', ' Vacation ')
      cy.get('[data-testid="category-budget-Lx7"]').should('have.text', ' -$25.34 ')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' $520.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')

      // //---------------------------------------------------------------------//

      cy.get('[data-testid="uncategorized-spent"]').should('contain.text', ' $0.00 ')
      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$81.32 ')

      // Check working
      cy.get('[data-testid="working-carryover"]').should('contain.text', '-$331.47')
      cy.get('[data-testid="working-income"]').should('contain.text', '$2,881.64')
      cy.get('[data-testid="working-budgeted"]').should('contain.text', '$275.50')
      cy.get('[data-testid="working-available"]').should('contain.text', '$2,274.67')

      // Check total balance header item
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount left to budget')
      cy.get('[data-testid="total-balance"]').should('contain.text', '$2,274.67')

      //---------------------------------------------------------------------//
      // Check for September
      //---------------------------------------------------------------------//

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $805.95 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $23.84 ')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $177.25 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')
      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$81.32 ')
      // Return to start page for future tests
      cy.get('[data-testid="previous-month-button"]').click()
      cy.get('[data-testid="previous-month-button"]').click()
    })
  })

  context('Test drag and drop', () => {
    beforeEach(() => {
      cy.initPath('categories/2022-08')
    })

    it('Drag category to different place in same master category', () => {
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $300.84 ')
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 4)
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(2)')
        .find('[data-testid="category-name-6b2"]')
        .should('have.length', 1)
      // Do the drag and drop (drag 'Gas' to above  'Groceries')
      cy.get('[data-testid="drag-category-n00"]').trigger('mouseenter')
      cy.get('[data-testid="drag-category-n00"] ').drag('[data-testid="drag-category-ATi"]')

      cy.wait(1000)

      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(1)')
        .find('[data-testid="category-name-n00"]')
        .should('have.length', 1, { setTimeout: 10000 })
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(2)')
        .find('[data-testid="category-name-ATi"]')
        .should('have.length', 1)

      // Check that Spending values are all the same
      cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $300.84 ')
      cy.get('[data-testid="master-category-spent-3ks"]').should('contain.text', ' $379.64 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,015.20 ')

      // Check that Groceries values are all the same
      cy.get('[data-testid="category-name-ATi"]').should('have.text', ' Groceries ')
      cy.get('[data-testid="category-budget-ATi"]').should('have.text', ' $242.33 ')
      cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' $379.64 ')
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $805.95 ')

      // Check that Electricity values are all the same
      cy.get('[data-testid="category-name-6b2"]').should('have.text', ' Electricity ')
      cy.get('[data-testid="category-budget-6b2"]').should('have.text', ' -$41.84 ')
      cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')

      // Check that Gas values are all the same
      cy.get('[data-testid="category-name-n00"]').should('have.text', ' Gas ')
      cy.get('[data-testid="category-budget-n00"]').should('have.text', ' -$61.90 ')
      cy.get('[data-testid="category-spent-n00"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $23.84 ')

      // Drag category to different master category
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $300.84 ')
      // Do the drag and drop
      cy.get('[data-testid="drag-category-Lx7"]').trigger('mouseenter')
      cy.get('[data-testid="drag-category-Lx7"]').drag('[data-testid="category-name-gpe"]', {
        target: {
          position: 'bottom'
        }
      })
      cy.get('[data-testid="categories-container-ggJ"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-:in"]')
      cy.get('[data-testid="categories-container-:in"] > div:nth-child(1)')
        .find('[data-testid="category-name-gpe"]', { setTimeout: 10000 })
        .should('have.length', 1)
      cy.get('[data-testid="categories-container-:in"] > div:nth-child(2)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)

      // Check that values are correctly updated
      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $2,361.64 ')

      cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,881.64 ')

      cy.get('[data-testid="category-name-Lx7"]').should('have.text', ' Vacation ')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' -$520.00 ')
    })
  })

  context('Test updating', () => {
    beforeEach(() => {
      cy.initPath('categories/2022-07')
    })
    it('Checks that updating budget value and clicking enter works', () => {
      cy.get('[data-testid="full-screen-loading"]').should('not.exist')
      cy.get('.v-progress-linear__buffer').should('not.exist')
      const vacation_selector = '[data-testid="category-budget-Lx7"]'
      const vacation_input_selector = '[data-testid="category-budget-input-Lx7"]'
      cy.get(vacation_selector).click()
      cy.get(vacation_input_selector).should('have.value', '430.00')
      cy.get(vacation_input_selector).clear()
      cy.get(vacation_input_selector).type('-100')
      cy.get(vacation_input_selector).type('{enter}')

      cy.get(vacation_input_selector).should('have.value', '-$100.00')
      cy.get(vacation_selector).should('have.text', ' -$100.00 ')

      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$520.00 ')
    })
    it('Checks that updating budget value and blurring works', () => {
      cy.get('[data-testid="category-budget-n00"]').should('have.text', ' $420.00 ')
      cy.get('[data-testid="category-budget-n00"]').click()
      cy.get('[data-testid="category-budget-input-n00"]').click()
      cy.get('[data-testid="category-budget-input-n00"]').clear().type('word')
      cy.get('[data-testid="category-budget-input-n00"]').blur()
      cy.get('.category-budget-note textarea').should('not.be.disabled')
      cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$420.00')
      cy.get('[data-testid="category-budget-input-n00"]').click()
      cy.get('[data-testid="category-budget-input-n00"]').clear().type('23.24')
      cy.get('[data-testid="category-budget-input-n00"]').blur()
      cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$23.24')
      cy.get('[data-testid="category-budget-n00"]').should('have.text', ' $23.24 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$311.02 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $697.24 ')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$372.92 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $618.44 ')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$372.92 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $618.44 ')
    })
    it('Checks that total balance value updates correctly', () => {
      // Income category for July is $1,586.79
      // Total budgeted for July is  $1,918.26
      // Total left for July is       -$331.47

      // Income category for August is $2,881.64
      // Total carryover from July is   -$331.47
      // Total budgeted for August is    $275.50
      // Total left for August is      $2,274.67

      // Total income should be: $4,476.00

      // Check the value for July and August
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $331.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $2,274.67 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount left to budget:')

      cy.get('[data-testid="previous-month-button"]').click()

      // Check that updating a budgeted value causes the correct total balance update
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $331.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')
      const water_selector = '[data-testid="category-budget-2aW"]'
      const water_input_selector = '[data-testid="category-budget-input-2aW"]'
      cy.get(water_selector).click()
      cy.get(water_input_selector).should('have.value', '15.00')
      cy.get(water_input_selector).click()
      cy.get(water_input_selector).clear()
      cy.get(water_input_selector).type('-1')
      cy.get(water_input_selector).type('{enter}')
      cy.get(water_input_selector).should('have.value', '-$1.00')
      cy.get(water_selector).should('have.text', ' -$1.00 ')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $315.47 ')
      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $2,290.67 ')
      cy.get('[data-testid="previous-month-button"]').click()

      cy.get(water_input_selector).should('have.value', '-$1.00')
      cy.get(water_input_selector).click()
      cy.get(water_input_selector).clear()
      cy.get(water_input_selector).type('2000')
      cy.get(water_input_selector).type('{enter}')
      cy.get(water_input_selector).should('have.value', '$2,000.00')
      cy.get(water_selector).should('have.text', ' $2,000.00 ')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $2,316.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')
      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $289.67 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount left to budget:')
      cy.get('[data-testid="previous-month-button"]').click()

      cy.get(water_input_selector).should('have.value', '$2,000.00')
      cy.get(water_input_selector).click()
      cy.get(water_input_selector).clear()
      cy.get(water_input_selector).type('15')
      cy.get(water_input_selector).type('{enter}')
      cy.get(water_input_selector).should('have.value', '$15.00')
      cy.get(water_selector).should('have.text', ' $15.00 ')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $331.47 ')

      // Check that updating a transaction results in the correct update of total balance
      // In $21.00
      cy.get('[data-testid="transactions-page-v6A"]').click()
      cy.get('.transaction-row').should('have.length', 5)
      cy.get('[data-testid="create-transaction-button"]').click()
      cy.get('[data-testid="details-date"] input').clear().type('2022-07-30')
      cy.get('[data-testid="details-category"]').click()
      cy.get('[data-testid="category-search"]').type('Paycheck 1').type('{downArrow}{enter}')
      cy.get('[data-testid="details-value"]').click().clear().type('21.00').blur()
      cy.get('[data-testid="details-inflow-button"]').click()
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row:nth-child(8) > .row-inflow').should('have.text', ' $21.00 ')
      cy.get('.transaction-row').should('have.length', 6)

      // In -$15.00
      cy.get('.transaction-row .row-description').eq(5).click()
      cy.get('[data-testid="details-value"]').click().clear().type('20.21').blur()
      cy.get('[data-testid="details-outflow-button"]').click()
      cy.get('[data-testid="save-edit-button"]').click()

      cy.get('.transaction-row:nth-child(12) > .row-outflow').should('have.text', ' $20.21 ')
      cy.get('.transaction-row').should('have.length', 6)

      // In -$42
      cy.get('.transaction-row .row-description').eq(4).click()
      cy.get('[data-testid="details-value"]').click().clear().type('300').blur()
      cy.get('[data-testid="details-inflow-button"]').click()
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row:nth-child(10) > .row-inflow').should('have.text', ' $300.00 ')
      cy.get('.transaction-row').should('have.length', 6)

      // In -$320 (August)
      cy.get('.transaction-row .row-delete').eq(0).click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 5)

      // Check categories
      cy.get('[data-testid="sidebar-button-categories"]').click()

      cy.get('[data-testid="total-balance"]').should('contain.text', ' $367.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $1,918.67 ')
    })

    it('Creates a new category', () => {
      const name_selector = '[data-testid="categories-container-3ks"] > div:nth-child(6) .category-name'
      const balance_selector = '[data-testid="categories-container-3ks"] .category-balance'
      const name_input_selector = '.category-name-input > :nth-child(1) input'

      // Check that making two new categories one after the other doesn't result in the name input loading
      cy.get('[data-testid="btn-new-category-3ks"]').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 5)
      cy.get('[data-testid="btn-new-category-3ks"]').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 6)

      // // Check that name input updates correctly
      cy.get(name_selector).should('have.text', ' Name ')
      cy.get(name_input_selector).clear().type('Internet')
      cy.get(name_input_selector).should('be.enabled')

      // Check that value update works correctly
      cy.get('.category-budget-input input').eq(0).focus()
      cy.get(name_selector).should('have.text', ' Internet ')
      cy.get('.category-budget-input input').eq(0).clear().type('5')

      // Check that note update works correctly
      cy.get('.category-budget-note textarea').should('not.be.disabled')
      cy.get('.category-budget-note textarea').focus()
      cy.get('.category-budget-input input').eq(0).should('have.value', '$5.00')
      cy.get('.category-budget-note textarea').type('This is a note')
      cy.get('.transaction-details-grid > :nth-child(8)').click()
      cy.get('.category-budget-note textarea').should('not.be.disabled')
      cy.get('.category-budget-note textarea').should('have.value', 'This is a note')
      cy.get('[data-testid="category-name-:in"]').click()
      cy.get('.category-budget-note textarea').should('have.value', '')

      // Create a new master category
      cy.get('.master-categories > div').should('have.length', 2)
      cy.get('[data-testid="btn-new-master-category"]').click()
      cy.get('.master-categories > div').should('have.length', 3)
      const name_input = () => cy.get('main').find('div.master-row').eq(4).find('input')
      name_input().should('not.have.attr', 'readonly')
      name_input().should('have.focus')
      cy.wait(1)
      name_input().clear().type('Dividends').type('{enter}')
      name_input().should('have.value', 'Dividends')
      name_input().should('not.have.focus')
      cy.get('.categories-container').eq(3).should('not.be.visible')
    })

    it('Tests that the move section works properly', () => {
      cy.get('[data-testid="category-budget-n00"]').should('contain.text', '$420.00').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', '$331.47')

      // Check that move section has correct values
      cy.get('[data-testid="category-move-input-n00"]').should('contain.value', '$85.74')
      cy.get('[data-testid="details-moving-to-button"].mdi-radiobox-marked').should('exist')
      cy.get('#category-menu-button').should('contain.text', 'Groceries')

      // Change budget value so balance is negative
      cy.get('[data-testid="category-budget-input-n00"]').clear().type('10').blur()
      cy.get('[data-testid="category-budget-input-n00"]').should('contain.value', '$10.00')

      // Check that move section has correct values
      cy.get('[data-testid="category-move-input-n00"]').should('contain.value', '$324.26')
      cy.get('[data-testid="details-moving-from-button"].mdi-radiobox-marked').should('exist')
      cy.get('#category-menu-button').should('contain.text', 'Groceries')

      // Open Groceries details
      cy.get('[data-testid="category-budget-ATi"]').click()

      // Check that move section has correct values
      cy.get('[data-testid="category-move-input-ATi"]').should('contain.value', '$324.26')
      cy.get('[data-testid="details-moving-to-button"].mdi-radiobox-marked').should('exist')
      cy.get('#category-menu-button').should('contain.text', 'Gas')

      // Send some money
      cy.get('[data-testid="category-move-input-ATi"]').click()
      cy.get('[data-testid="category-move-input-ATi"]').clear().type('320.26').type('{enter}')
      cy.get('[data-testid="details-move-save-button"]').click()

      // Check that values were updated correctly
      cy.get('[data-testid="total-balance"]').should('contain.text', '$78.53')
      cy.get('[data-testid="category-balance-ATi"]').should('contain.text', '$623.00')
      cy.get('[data-testid="category-budget-ATi"]').should('contain.text', '$683.00')
      cy.get('[data-testid="category-budget-input-ATi"]').should('contain.value', '$683.00')

      // Check that move section has correct values
      cy.get('[data-testid="category-move-input-ATi"]').should('contain.value', '$4.00')
      cy.get('[data-testid="details-moving-to-button"].mdi-radiobox-marked').should('exist')
      cy.get('#category-menu-button').should('contain.text', 'Gas')

      // Check that Gas values were updated correctly
      cy.get('[data-testid="category-balance-n00"]').should('contain.text', '-$4.00')
      cy.get('[data-testid="category-budget-n00"]').should('contain.text', '$330.26')

      // Go to Gas category details
      cy.get('[data-testid="category-budget-n00"]').click()

      // Check that move section has correct values
      cy.get('[data-testid="category-move-input-n00"]').should('contain.value', '$4.00')
      cy.get('[data-testid="details-moving-from-button"].mdi-radiobox-marked').should('exist')
      cy.get('#category-menu-button').should('contain.text', 'Groceries')

      // Send some money
      cy.get('[data-testid="category-move-input-n00"]').click()
      cy.get('[data-testid="category-move-input-n00"]').clear().type('6.00').type('{enter}')
      cy.get('[data-testid="details-move-save-button"]').click()

      // Check that move section has correct values
      cy.get('[data-testid="category-move-input-n00"]').should('contain.value', '$2.00')
      cy.get('[data-testid="details-moving-to-button"].mdi-radiobox-marked').should('exist')
      cy.get('#category-menu-button').should('contain.text', 'Groceries')

      // Hide the Water category
      cy.get('[data-testid="btn-hide-category-2aW"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('[data-testid="master-category-balance-::0"]').should('contain.text', '$15.00')

      // Check that Water is not included in the list of options to move to
      cy.get('#category-menu-button').click()
      cy.get('[data-testid="category-list"]').should('not.contain.text', 'Water')
    })

    it('Tests that esc key works', () => {
      // Budgeted
      cy.get('[data-testid="category-budget-n00"]').click()
      cy.get('[data-testid="category-budget-input-n00"]').focus()
      cy.get('[data-testid="category-budget-input-n00"]').type('{esc}')
      cy.get('[data-testid="details-title"]').should('not.contain.text', 'Update Selected')
      // Move amount
      cy.get('[data-testid="category-budget-n00"]').click()
      cy.get('[data-testid="category-move-input-n00"]').focus()
      cy.get('[data-testid="category-move-input-n00"]').type('{esc}')
      cy.get('[data-testid="details-title"]').should('not.contain.text', 'Update Selected')
      // Move to
      cy.get('[data-testid="category-budget-n00"]').click()
      cy.get('[data-testid="details-moving-to-button"]').focus()
      cy.get('[data-testid="details-moving-to-button"]').type('{esc}')
      cy.get('[data-testid="details-title"]').should('not.contain.text', 'Update Selected')
      // Send button
      cy.get('[data-testid="category-budget-n00"]').click()
      cy.get('[data-testid="details-move-save-button"]').focus()
      cy.get('[data-testid="details-move-save-button"]').type('{esc}')
      cy.get('[data-testid="details-title"]').should('not.contain.text', 'Update Selected')
    })
  })

  context('Test delete / hide', () => {
    it('Checks that hide and delete work correctly', () => {
      cy.initPath('categories/2022-08')
      cy.get('[data-testid="btn-expand-::0"]').trigger('mouseenter').click()

      // Hide a category
      cy.get('.master-categories').should('have.length', 2)
      cy.get('[data-testid="btn-hide-category-Lx7"]').trigger('mouseenter').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      cy.get('[data-testid="categories-container-ggJ"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 1)

      cy.get('[data-testid="categories-container-\\:\\:0"] > div:nth-child(1)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)

      cy.get('[data-testid="master-category-budget-ggJ"]').should('contain.text', ' $0.00 ')
      cy.get('[data-testid="master-category-spent-ggJ"]').should('contain.text', ' $0.00 ')
      cy.get('[data-testid="master-category-balance-ggJ"]').should('contain.text', ' $0.00 ')

      cy.get('[data-testid="master-category-budget-\\:\\:0"]').should('contain.text', ' -$25.34 ')
      cy.get('[data-testid="master-category-spent-\\:\\:0"]').should('contain.text', ' $520.00 ')
      cy.get('[data-testid="master-category-balance-\\:\\:0"]').should('contain.text', ' -$535.34 ')

      cy.get('[data-testid="category-name-Lx7"]').should('have.text', ' Vacation ')
      cy.get('[data-testid="category-budget-Lx7"]').should('have.text', ' -$25.34 ')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' $520.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')

      // Delete a master category
      cy.get('[data-testid="btn-delete-master-category-3ks"]').trigger('mouseenter').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      cy.get('[data-testid="master-category-name-3ks"]').should('not.exist')
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 5)

      cy.get('[data-testid="master-category-budget-\\:\\:0"]').should('contain.text', ' $275.50 ')
      cy.get('[data-testid="master-category-spent-\\:\\:0"]').should('contain.text', ' $899.64 ')
      cy.get('[data-testid="master-category-balance-\\:\\:0"]').should('contain.text', ' $479.86 ')

      cy.get('[data-testid="category-name-6b2"]').should('have.text', ' Electricity ')
      cy.get('[data-testid="category-budget-6b2"]').should('have.text', ' -$41.84 ')
      cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $8.16 ')
    })

    it('Checks that it is possible to delete an empty category', () => {
      cy.initPath('categories/2022-06')
      cy.get('[data-testid="btn-expand-::0"]').trigger('mouseenter').click()

      // Check that clicking a category with transactions and then one without works
      cy.get('[data-testid="category-name-n00"]').click()
      cy.get('[data-testid="category-name-6b2"]').click()
      cy.get('[data-testid="delete-category-button"]').should('be.enabled')

      // Delete a category
      cy.get('[data-testid="delete-category-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('[data-testid="category-name-input-6b2"]').should('not.exist')

      // Check that balance is updated correctly
      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', '$281.47')

      // Create a new category and then delete it straight away
      cy.get('[data-testid="btn-new-category-3ks"]').click()
      cy.get('[data-testid="delete-category-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 3)

      // Check that delete gas category button is disabled
      cy.get('[data-testid="category-name-n00"]').click()
      cy.get('[data-testid="delete-category-button"]').should('not.be.enabled')

      // Delete all gas related transactions
      cy.get('[data-testid="transactions-page-7kW"]').click()
      cy.get('.transaction-row > .row-checkbox').eq(4).click()
      cy.get('.transaction-row > .row-checkbox').eq(6).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 5)

      // Check that delete gas category button is enabled
      cy.get('[data-testid="sidebar-button-categories"]').click()
      cy.get('[data-testid="category-name-n00"]').click()
      cy.get('[data-testid="delete-category-button"]').should('be.enabled')

      // Delete gas category
      cy.get('[data-testid="delete-category-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('[data-testid="category-name-input-n00"]').should('not.exist')
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 2)
      cy.get('[data-testid="total-balance"]').should('contain.text', '$138.53')
    })

    it('Checks that restoring with the restore button works', () => {
      cy.initPath('categories/2022-08')
      cy.get('[data-testid="btn-expand-::0"]').trigger('mouseenter').click()

      cy.get('[data-testid="btn-hide-category-6b2"]').trigger('mouseenter').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 3)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 1)

      cy.get('[data-testid="btn-restore-category-6b2"]').trigger('mouseenter').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 4)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(4)')
        .find('[data-testid="category-name-6b2"]')
        .should('have.length', 1)

      // Check that restoring after drag drop works
      cy.get('[data-testid="drag-category-ATi"]').trigger('mouseenter')
      cy.get('[data-testid="drag-category-ATi"]').drag('[data-testid="btn-new-category-::0"]', {
        target: {
          position: 'top'
        }
      })
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 3)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 1)
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', '$209.25')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="category-name-ATi"]').trigger('mouseenter')
      cy.get('[data-testid="btn-restore-category-ATi"]').trigger('mouseenter')
      cy.get('[data-testid="btn-restore-category-ATi"]').click()
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(4)', { timeout: 10000 })
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-3ks"] [data-testid="category-name-ATi"]').should('have.length', 1)
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', '$1,015.20')

      // Check that deleting a master category and then restoring works
      cy.get('[data-testid="btn-delete-master-category-ggJ"]').trigger('mouseenter').click()
      cy.get('[data-testid="delete-confirm-button"]').click({ waitForAnimations: false, force: true })
      cy.get('[data-testid="categories-container-ggJ"]').should('not.exist')
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 1)
      cy.get('[data-testid="categories-container-\\:\\:0"] > div:nth-child(1)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)

      cy.get('[data-testid="btn-restore-category-Lx7"]').trigger('mouseenter').click()
      cy.get('[data-testid="categories-container-3ks"] .category-row').should('have.length', 5)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(5)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)
    })
  })

  context('Utility functions', () => {
    it('Checks that selected date is saved', () => {
      cy.initPath('categories/2022-01')
      cy.get('[data-testid="transactions-page-7kW"]').click()
      cy.get('[data-testid="sidebar-button-categories"]').click()
      cy.url().should('include', 'categories/2022-01')
    })

    it('Checks that rounding works correctly', () => {
      cy.initPath('categories/2022-08')
      const water_selector = '[data-testid="category-budget-2aW"]'
      const water_input_selector = '[data-testid="category-budget-input-2aW"]'
      cy.get(water_selector).should('contain.text', '$162.25')
      cy.get(water_selector).click()
      cy.get(water_input_selector).should('have.value', '162.25')
      cy.get(water_input_selector).click()
      cy.get(water_input_selector).clear().type('18.99')
      cy.get(water_input_selector).blur()
      cy.get(water_input_selector).should('have.value', '$18.99')
      cy.get(water_selector).should('contain.text', '18.99')
    })
  })
})
