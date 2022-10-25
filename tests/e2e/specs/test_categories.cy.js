import { wait } from "@testing-library/vue"

describe('Test categories (budget) page', () => {
  context('Test values', () => {
    before(() => {
      cy.initPath('budget/2022-07')
    })

    it('Checks category values for July', () => {
      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $1,586.79 ')

      cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $1,586.79 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $1,488.26 ')
      cy.get('[data-testid="master-category-spent-3ks"]').should('contain.text', ' $394.26 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,094.00 ')

      cy.get('[data-testid="category-name-input-ATi"]').should('have.value', 'Groceries')
      cy.get('[data-testid="category-budget-input-ATi"]').should('have.value', '$1,003.26')
      cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' $60.00 ')
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $943.26 ')

      cy.get('[data-testid="category-name-input-6b2"]').should('have.value', 'Electricity')
      cy.get('[data-testid="category-budget-input-6b2"]').should('have.value', '$50.00')
      cy.get('[data-testid="category-spent-6b2"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-6b2"]').should('have.text', ' $50.00 ')

      cy.get('[data-testid="category-name-input-n00"]').should('have.value', 'Gas')
      cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$420.00')
      cy.get('[data-testid="category-spent-n00"]').should('have.text', ' $334.26 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $85.74 ')

      cy.get('[data-testid="category-name-input-2aW"]').should('have.value', 'Water')
      cy.get('[data-testid="category-budget-input-2aW"]').should('have.value', '$15.00')
      cy.get('[data-testid="category-spent-2aW"]').should('have.text', ' $0.00 ')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $15.00 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-ggJ"]').should('have.value', 'Misc')

      cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
      cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '$430.00')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' $420.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' $10.00 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="uncategorized-name"]').should('contain.text', 'Uncategorized')
      cy.get('[data-testid="uncategorized-spent"]').should('contain.text', ' $81.32 ')
      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$81.32 ')
    })

    it('Checks category values for August and September', () => {
      cy.get('[data-testid="next-month-button"]').click()

      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $2,881.64 ')

      cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,881.64 ')

      //---------------------------------------------------------------------//

      cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $300.84 ')
      cy.get('[data-testid="master-category-spent-3ks"]').should('contain.text', ' $379.64 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,015.20 ')

      cy.get('[data-testid="category-name-input-ATi"]').should('have.value', 'Groceries')
      cy.get('[data-testid="category-budget-input-ATi"]').should('have.value', '$242.33')
      cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' $379.64 ')
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
      cy.get('[data-testid="master-category-budget-ggJ"]').should('contain.text', ' -$25.34 ')
      cy.get('[data-testid="master-category-spent-ggJ"]').should('contain.text', ' $520.00 ')
      cy.get('[data-testid="master-category-balance-ggJ"]').should('contain.text', ' -$535.34 ')

      cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
      cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '-$25.34')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' $520.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')

      // //---------------------------------------------------------------------//

      cy.get('[data-testid="uncategorized-spent"]').should('contain.text', ' $0.00 ')
      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$81.32 ')

      // //---------------------------------------------------------------------//
      // September

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

    it.only('Checks that pressing enter on budget input causes the next one to be highlighted', () => {
      cy.get('[data-testid="category-budget-input-2aW"]').should('have.attr', 'readonly')
      cy.get('[data-testid="category-budget-input-2aW"]').click()
      cy.get('[data-testid="category-budget-input-2aW"]').type('{enter}')
      cy.get('[data-testid="category-budget-input-2aW"]').should('have.attr', 'readonly')
      // cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '420.00')
      // cy.wait(1000)
      cy.get('[data-testid="category-budget-input-Lx7"]').should('not.have.attr', 'readonly', {timeout: 10000})
      cy.get('[data-testid="category-budget-input-Lx7"]').should('have.focus')
      cy.get('[data-testid="category-budget-input-Lx7"]').type('{enter}')

      // cy.get('[data-testid="category-budget-input-6b2"]').should('have.focus')
    })

    it('Checks that updating a budget value updates balance correctly', () => {
      cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$420.00')
      cy.get('[data-testid="category-budget-input-n00"]').click()
      cy.get('[data-testid="category-budget-input-n00"]').type('23.24')
      cy.get('[data-testid="category-budget-input-n00"]').blur()
      cy.get('[data-testid="category-budget-input-n00"]').should('have.value', '$23.24')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$311.02 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $697.24 ')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$372.92 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $618.44 ')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' -$372.92 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $618.44 ')

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
    })

    it('Checks that values are all the same', () => {
      cy.get('[data-testid="master-category-name-input-3ks"]').should('have.value', 'Spending')
      cy.get('[data-testid="master-category-budget-3ks"]').should('contain.text', ' $300.84 ')
      cy.get('[data-testid="master-category-spent-3ks"]').should('contain.text', ' $379.64 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,015.20 ')

      cy.get('[data-testid="category-name-input-ATi"]').should('have.value', 'Groceries')
      cy.get('[data-testid="category-budget-input-ATi"]').should('have.value', '$242.33')
      cy.get('[data-testid="category-spent-ATi"]').should('have.text', ' $379.64 ')
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
        .find('[data-testid="category-name-input-gpe"]', { setTimeout: 10000 })
        .should('have.length', 1)
      cy.get('[data-testid="categories-container-:in"] > div:nth-child(2)')
        .find('[data-testid="category-name-input-Lx7"]')
        .should('have.length', 1)
    })

    it('Checks that values are correctly updated', () => {
      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $2,361.64 ')

      cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,881.64 ')

      cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' -$520.00 ')
    })
  })

  context('Test delete / hide', () => {
    before(() => {
      cy.initPath('budget/2022-08')
      cy.get('[data-testid="btn-expand-::0"]').trigger('mouseenter').click()
    })

    it('Hides a category', () => {
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

      cy.get('[data-testid="category-name-input-Lx7"]').should('have.value', 'Vacation')
      cy.get('[data-testid="category-budget-input-Lx7"]').should('have.value', '-$25.34')
      cy.get('[data-testid="category-spent-Lx7"]').should('have.text', ' $520.00 ')
      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$535.34 ')
    })
    it('Deletes a master category', () => {
      cy.get('[data-testid="btn-delete-master-category-3ks"]').trigger('mouseenter').click()
      cy.get('[data-testid="delete-confirm-button"]').click()

      cy.get('[data-testid="master-category-name-3ks"]').should('not.exist')
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 5)

      cy.get('[data-testid="master-category-budget-\\:\\:0"]').should('contain.text', ' $275.50 ')
      cy.get('[data-testid="master-category-spent-\\:\\:0"]').should('contain.text', ' $899.64 ')
      cy.get('[data-testid="master-category-balance-\\:\\:0"]').should('contain.text', ' $479.86 ')

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
      const name_input_selector =
        '[data-testid="categories-container-3ks"] > div:nth-child(5) .category-name-input input'

      cy.get(name_input_selector).should('have.value', 'Name')
      cy.wait(1000)
      cy.get(name_input_selector).should('not.have.attr', 'readonly')
      cy.get(name_input_selector).should('have.focus')
      cy.get(name_input_selector).type('Internet').type('{enter}')
      cy.get(name_input_selector).should('have.value', 'Internet')
    })

    it('Creates a new master category', () => {
      cy.get('main').find('div.master-row').should('have.length', 5)
      cy.get('[data-testid="btn-new-master-category"]').click()
      cy.get('main').find('div.master-row').should('have.length', 6)
      const name_input = () => cy.get('main').find('div.master-row').eq(4).find('input')
      name_input().should('not.have.attr', 'readonly')
      name_input().should('have.focus')
      name_input().type('Dividends').type('{enter}')
      name_input().should('have.value', 'Dividends')
      cy.get('main')
        .find('div.master-row:nth-child(5) .categories-container')
        .children()
        .should('have.length', 0)
    })
  })

  context('Test selected date is saved', () => {
    before(() => {
      cy.initPath('budget/2022-01')
    })

    it('Accesses transaction page and then categories page again', () => {
      cy.get('[data-testid="transactions-page-7kW"]').click()
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.url().should('include', 'budget/2022-01')
    })
  })

  context('Test updating budgeted values', () => {
    before(() => {
      cy.initPath('budget/2022-07')
    })
    it('Checks that changing budgeted values results in values updating properly', () => {
      const vacation_selector = '[data-testid="category-budget-input-Lx7"]'
      cy.get(vacation_selector).click()
      cy.get(vacation_selector).focus()

      cy.get(vacation_selector).clear()
      cy.get(vacation_selector).type('-100')
      cy.get(vacation_selector).type('{enter}')
      cy.get(vacation_selector).should('have.value', '-$100.00')

      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$520.00 ')
    })
  })

  context('Test that total balance value updates correctly', () => {
    before(() => {
      cy.initPath('budget/2022-07')
    })

    it('Checks the value for July and August', () => {
      // Income category for July is $1,586.79
      // Total budgeted for July is  $1,918.26
      // Total left for July is       -$331.47

      // Income category for August is $2,881.64
      // Total carryover from July is   -$331.47
      // Total budgeted for August is    $275.50
      // Total left for August is      $2,274.67

      // Total income should be: $4,476.00

      // cy.get('[data-testid="total-balance"]').should('contain.text', ' $1,173.74 ')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $331.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $2,274.67 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount left to budget:')

      cy.get('[data-testid="previous-month-button"]').click()
    })

    it('Checks that updating a budgeted value causes the correct total balance update', () => {
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $331.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')
      const water_selector = '[data-testid="category-budget-input-2aW"]'
      cy.get(water_selector).click()
      cy.get(water_selector).clear()
      cy.get(water_selector).type('-1')
      cy.get(water_selector).type('{enter}')
      cy.get(water_selector).should('have.value', '-$1.00')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $315.47 ')
      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $2,290.67 ')
      cy.get('[data-testid="previous-month-button"]').click()

      cy.get(water_selector).click()
      cy.get(water_selector).clear()
      cy.get(water_selector).type('2000')
      cy.get(water_selector).type('{enter}')
      cy.get(water_selector).should('have.value', '$2,000.00')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $2,316.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')
      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $289.67 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount left to budget:')
      cy.get('[data-testid="previous-month-button"]').click()

      cy.get(water_selector).click()
      cy.get(water_selector).clear()
      cy.get(water_selector).type('15')
      cy.get(water_selector).type('{enter}')
      cy.get(water_selector).should('have.value', '$15.00')
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $331.47 ')
    })

    it('Checks tha updating a transaction results in the correct update of total balance', () => {
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
      // cy.get('[data-testid="edit-row-outflow"]').type('20.21').type('{enter}')
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
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.get('[data-testid="total-balance"]').should('contain.text', ' $367.47 ')
      cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget:')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="total-balance"]').should('contain.text', ' $1,918.67 ')
      cy.get('[data-testid="sidebar-button-budgets"]').click()
    })
  })

  context('Test that hidden restore works correctly', () => {
    beforeEach(() => {
      cy.initPath('budget/2022-08')
      cy.get('[data-testid="btn-expand-::0"]').trigger('mouseenter').click()
    })

    it('Checks that restoring with the restore button works', () => {
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
    })

    it('Checks that restoring after drag drop works', () => {
      // Do the drag and drop
      cy.get('[data-testid="drag-category-ATi"]').trigger('mouseenter')
      cy.get('[data-testid="drag-category-ATi"]').drag('[data-testid="btn-new-category-::0"]', {
        target: {
          position: 'top'
        }
      })
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 3)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 1)
      cy.wait(10)
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
      cy.get('[data-testid="category-name-input-ATi"]').trigger('mouseenter')
      cy.get('[data-testid="btn-restore-category-ATi"]').trigger('mouseenter')
      cy.get('[data-testid="btn-restore-category-ATi"]').click()
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(4)', {timeout: 10000})
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-3ks"] [data-testid="category-name-ATi"]').should('have.length', 1)

    })

    it('Checks that deleting a master category and then restoring works', () => {
      cy.get('[data-testid="btn-delete-master-category-ggJ"]').trigger('mouseenter').click()
      cy.wait(500)
      cy.get('[data-testid="delete-confirm-button"]').click({waitForAnimations: false, force: true})
      // cy.get('[data-testid="all-categories-container"]')
      //   .find('[data-testid="categories-container-ggJ"]')
      //   .should('have.length', 0)
      cy.get('[data-testid="categories-container-ggJ"]').should('not.exist')
      //   .should('have.length', 0)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 1)
      cy.get('[data-testid="categories-container-\\:\\:0"] > div:nth-child(1)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)

      cy.get('[data-testid="btn-restore-category-Lx7"]').trigger('mouseenter').click()
      cy.get('[data-testid="categories-container-3ks"]').children().should('have.length', 5)
      cy.get('[data-testid="categories-container-\\:\\:0"]').children().should('have.length', 0)
      cy.get('[data-testid="categories-container-3ks"] > div:nth-child(5)')
        .find('[data-testid="category-name-Lx7"]')
        .should('have.length', 1)
    })
  })

  context('Tests math rounding', () => {
    beforeEach(() => {
      cy.initPath('budget/2022-08')
    })

    it('Checks that 18.99 is stored as 18.99', () => {
      cy.get('[data-testid="category-budget-input-2aW"]').click()
      cy.get('[data-testid="category-budget-input-2aW"]').clear().type('18.99')
      cy.get('[data-testid="category-budget-input-2aW"]').blur()
      cy.get('[data-testid="category-budget-input-2aW"]').should('have.value', '$18.99')
    })
  })
})
