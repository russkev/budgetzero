describe('Test transactions', () => {
  context('Test transaction create', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Check transaction values and balance displays correctly', () => {
      cy.get('.transaction-row > .row-outflow').eq(6).should('contain.text', '$160.50')
      cy.get('.transaction-row > .row-balance').eq(6).should('contain.text', '-$160.50')

      cy.get('.transaction-row > .row-inflow').eq(5).should('contain.text', '$1,250.00')
      cy.get('.transaction-row > .row-balance').eq(5).should('contain.text', '$1,089.50')

      cy.get('.transaction-row > .row-outflow').eq(4).should('contain.text', '$173.76')
      cy.get('.transaction-row > .row-balance').eq(4).should('contain.text', '$915.74')

      cy.get('.transaction-row > .row-outflow').eq(3).should('contain.text', '$174.76')
      cy.get('.transaction-row > .row-balance').eq(3).should('contain.text', '$740.98')

      cy.get('.transaction-row > .row-inflow').eq(2).should('contain.text', '$2,300.00')
      cy.get('.transaction-row > .row-balance').eq(2).should('contain.text', '$3,040.98')

      cy.get('.transaction-row > .row-outflow').eq(1).should('contain.text', '$189.44')
      cy.get('.transaction-row > .row-balance').eq(1).should('contain.text', '$2,851.54')

      cy.get('.transaction-row > .row-outflow').eq(0).should('contain.text', '$15.44')
      cy.get('.transaction-row > .row-balance').eq(0).should('contain.text', '$2,836.10')
    })

    it('Checks transactions header', () => {
      cy.get('[data-testid="transactions-heading"]').should('contain.text', 'Savings')
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '$725.54')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', '$2,836.10')
    })

    it('Checks sidebar has correct balance', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', 'Savings')
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,836.10')
    })

    it('Adds new transaction', () => {
      cy.get('.transaction-row', { timeout: 6000 }).should('have.length', 7)

      cy.get('[data-testid="create-transaction-button"]').click()
      cy.get('[data-testid="details-cleared"]').click()
      cy.get('[data-testid="details-status"]').should('contain.text', 'Cleared')
      cy.get('[data-testid="details-cleared"]').click()
      cy.get('[data-testid="details-status"]').should('contain.text', 'Uncleared')

      cy.get('[data-testid="details-date"] input').clear().type('2022-07-30').blur()
      cy.get('[data-testid="details-category"]').click()
      cy.get('[data-testid="category-search"]').type('Groceries').type('{downArrow}{downArrow}{enter}')
      cy.get('[data-testid="details-memo"]').type('Supermarket')
      cy.get('[data-testid="details-value"]').type('56.23')
      cy.get('[data-testid="details-outflow-button"]').click()
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row').should('have.length', 8)
      cy.get('.date-row').eq(0).should('not.contain.text', 'Saturday, 30 July, 2022')
      cy.get('.date-row').eq(4).should('contain.text', 'Saturday, 30 July, 2022')
      cy.get('.transaction-row .row-category').eq(4).should('contain.text', 'Groceries')
      cy.get('.transaction-row .row-description').eq(4).should('contain.text', 'Supermarket')
      cy.get('.transaction-row > .row-outflow').eq(4).should('contain.text', '$56.23')
      cy.get('.transaction-row > .row-inflow').eq(4).should('not.contain.text', '$')
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(5).should('have.text', ' $915.74 ')
      cy.get('.transaction-row > .row-balance').eq(4).should('have.text', ' $859.51 ')
      cy.get('.transaction-row > .row-balance').eq(3).should('have.text', ' $684.75 ')
      cy.get('.transaction-row > .row-balance').eq(2).should('have.text', ' $2,984.75 ')
      cy.get('.transaction-row > .row-balance').eq(1).should('have.text', ' $2,795.31 ')
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' $2,779.87 ')
    })

    it('Checks that transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '$725.54')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$2,054.33')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', '$2,779.87')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,779.87')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $749.72 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $958.97 ')
      cy.get('[data-testid="transactions-page-7kW"]').click()
    })
  })

  context('Test transaction value update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Updates existing transaction value', () => {
      cy.get('.transaction-row .row-description').eq(4).click()
      cy.get('[data-testid="details-value"]').click()
      cy.get('[data-testid="details-value"]').type('5.00').type('{enter}')
      cy.get('[data-testid="details-inflow-button"]').click()
      cy.get('[data-testid="save-edit-button"]').click()

      cy.get('.transaction-row').should('have.length', 7)
      cy.get('.transaction-row > .row-inflow').eq(4).should('have.text', ' $5.00 ')
      cy.get('.transaction-row > .row-outflow').eq(4).should('not.contain.text', '$')
    })

    it('Checks that running balance was updated correctly', () => {
      cy.get('.transaction-row > .row-balance').eq(5).should('have.text', ' $1,089.50 ')
      cy.get('.transaction-row > .row-balance').eq(4).should('have.text', ' $1,094.50 ')
      cy.get('.transaction-row > .row-balance').eq(3).should('have.text', ' $919.74 ')
      cy.get('.transaction-row > .row-balance').eq(2).should('have.text', ' $3,219.74 ')
      cy.get('.transaction-row > .row-balance').eq(1).should('have.text', ' $3,030.30 ')
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' $3,014.86 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="transactions-heading"]').should('contain.text', 'Savings')
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '$904.30')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', '$3,014.86')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,014.86')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $202.60 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,193.96 ')
    })
  })

  context('Test transaction category update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Change category from Groceries to Vacation', () => {
      cy.get('.transaction-row .row-category').eq(3).click()
      cy.get('[data-testid="category-search"]').type('Vacation').type('{downArrow}{downArrow}{downArrow}{enter}')
      cy.get('.transaction-row .row-category').eq(3).should('contain.text', 'Vacation')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $980.71 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $1,189.96 ')

      cy.get('[data-testid="category-balance-Lx7"]').should('have.text', ' -$710.10 ')
      cy.get('[data-testid="master-category-balance-ggJ"]').should('contain.text', ' -$710.10 ')

      cy.get('[data-testid="transactions-page-7kW"]').click()
    })

    it('Change category from Paycheck 1 to Uncategorized', () => {
      cy.get('.transaction-row .row-category').eq(2).click()
      cy.get('[data-testid="category-search"]')
        .type('Uncategorized')
        .type('{downArrow}{downArrow}{downArrow}{downArrow}{enter}')
      cy.get('.transaction-row .row-category').eq(2).should('contain.text', 'Uncategorized')
    })

    it('Checks that budget was updated correctly', () => {
      cy.visit('http://localhost:8082/categories/2022-08')

      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $581.64 ')

      cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $581.64 ')

      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' $2,218.68 ')

      cy.get('[data-testid="transactions-page-7kW"]').click()
    })
  })

  context('Test transaction date update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Updates existing transaction category', () => {
      cy.get('.transaction-row .row-description').eq(2).click()
      cy.get('[data-testid="details-date"] input').clear().type('2022-07-08')
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row').should('have.length', 7)
    })

    // August should have income of $2881.64 - $2300 = $581.64
    // July should have income of $1586.79 + $2300 = $3886.79

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.visit('http://localhost:8082/categories/2022-08')
      cy.get('[data-testid="working-income"]').should('have.text', '$581.64')
      cy.get('[data-testid="previous-month-button"]').click()
      cy.get('[data-testid="working-income"]').should('have.text', '$3,886.79')
    })
  })

  context('Test delete transactions', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Deletes last transaction', () => {
      cy.get('.transaction-row .row-delete').eq(6).click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 6)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(5).should('have.text', ' $1,250.00 ')
      cy.get('.transaction-row > .row-balance').eq(4).should('have.text', ' $1,076.24 ')
      cy.get('.transaction-row > .row-balance').eq(3).should('have.text', ' $901.48 ')
      cy.get('.transaction-row > .row-balance').eq(2).should('have.text', ' $3,201.48 ')
      cy.get('.transaction-row > .row-balance').eq(1).should('have.text', ' $3,012.04 ')
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' $2,996.60 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' $886.04')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', ' $2,996.60')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$2,996.60')
    })

    it('Deletes second to last transaction', () => {
      cy.get('.transaction-row .row-delete').eq(4).click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 5)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(4).should('have.text', ' $1,250.00 ')
      cy.get('.transaction-row > .row-balance').eq(3).should('have.text', ' $1,075.24 ')
      cy.get('.transaction-row > .row-balance').eq(2).should('have.text', ' $3,375.24 ')
      cy.get('.transaction-row > .row-balance').eq(1).should('have.text', ' $3,185.80 ')
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' $3,170.36 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' $1,059.80')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', ' $3,170.36')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,170.36')
    })

    it('Deletes first transaction', () => {
      cy.get('.transaction-row .row-delete').eq(0).click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 4)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(3).should('have.text', ' $1,250.00 ')
      cy.get('.transaction-row > .row-balance').eq(2).should('have.text', ' $1,075.24 ')
      cy.get('.transaction-row > .row-balance').eq(1).should('have.text', ' $3,375.24 ')
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' $3,185.80 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' $1,075.24')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', ' $3,185.80')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$3,185.80')
    })

    it('Deletes 3 transactions', () => {
      cy.get('.transaction-row > .row-checkbox').eq(0).click()
      cy.get('.transaction-row > .row-checkbox').eq(1).click()
      cy.get('.transaction-row > .row-checkbox').eq(3).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 1)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' -$174.76 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' -$174.76')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $0.00')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', ' -$174.76')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '-$174.76')
    })

    it('Deletes the final transaction', () => {
      cy.get('.transaction-row .row-delete').eq(0).click()
      cy.get('[data-testid="delete-confirm-button"]').click()
      cy.get('.transaction-row').should('have.length', 0)
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' $0.00')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $0.00')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', ' $0.00')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', '$0.00')
    })

    it('Checks that budget was updated correctly', () => {
      cy.visit('http://localhost:8082/categories/2022-08')

      cy.get('[data-testid="master-category-name-:in"]').should('have.text', ' Income ')
      cy.get('[data-testid="master-category-spent-:in"]').should('contain.text', ' $581.64 ')

      cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $581.64 ')

      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $1,185.59 ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $358.10 ')
    })
  })

  context('Test clear and unclear multiple transactions at once', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Un-clears 3 transactions', () => {
      cy.get('.transaction-row > .row-checkbox').eq(6).click()
      cy.get('.transaction-row > .row-checkbox').eq(5).click()
      cy.get('.transaction-row > .row-checkbox').eq(0).click()
      cy.get('[data-testid="unclear-selected-button"]').click()
    })

    it('Checks that the number of cleared transactions is correct', () => {
      cy.get('.cleared-icon').should('have.length', 2)
      cy.get('.uncleared-icon').should('have.length', 5)
    })

    it('Checks that transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '-$348.52')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$3,184.62')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', '$2,836.10')
    })

    it('Clears 3 transactions', () => {
      cy.get('.select-all-checkbox').click().click()
      cy.get('.transaction-row > .row-checkbox').eq(4).click()
      cy.get('.transaction-row > .row-checkbox').eq(2).click()
      cy.get('.transaction-row > .row-checkbox').eq(1).click()
      cy.get('[data-testid="clear-selected-button"]').click()
    })

    it('Checks that the number of cleared transactions is correct', () => {
      cy.get('.cleared-icon').should('have.length', 4)
      cy.get('.uncleared-icon').should('have.length', 3)
    })

    it('Checks that transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '$1,762.04')
      cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$1,074.06')
      cy.get('[data-testid="account-balance-working"]').should('contain.text', '$2,836.10')
    })
  })

  context('Test categorize 3 transactions at once', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Categorizes 3 transactions as Gas', () => {
      cy.get('.transaction-row > .row-checkbox').eq(6).click()
      cy.get('.transaction-row > .row-checkbox').eq(2).click()
      cy.get('.transaction-row > .row-checkbox').eq(1).click()
      cy.get('[data-testid="categorize-as-button"]').click()
      cy.get('[data-testid="category-search"]').type('Gas').type('{downArrow}{downArrow}{enter}')
      cy.get('.transaction-row .row-category').eq(6).should('contain.text', 'Gas')
      cy.get('.transaction-row .row-category').eq(2).should('contain.text', 'Gas')
      cy.get('.transaction-row .row-category').eq(1).should('contain.text', 'Gas')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $2,134.40 ') // Gas
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $995.39 ') // Groceries
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $3,315.20 ')
    })
  })

  context('Test that split category works', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Sets transaction as split category', () => {
      cy.get('.transaction-row .row-description').eq(4).click()
      cy.get('[data-testid="add-split-button"]').click()
      cy.get('[data-testid="split-0-value"]').should('have.value', '$173.76')
      cy.get('[data-testid="split-1-value"]').should('have.value', '$0.00')
      cy.get('[data-testid="split-0-value"]').clear().type('31.22')

      cy.get('[data-testid="details-category-split-0"]').click()
      cy.get('[data-testid="category-search"]').type('Water').type('{downArrow}{downArrow}{enter}')
      cy.get('[data-testid="details-category-split-0"]').should('contain.text', 'Water')

      cy.get('[data-testid="split-0-value"]').should('have.value', '$31.22')
      cy.get('[data-testid="split-1-value"]').should('have.value', '$142.54')

      cy.get('[data-testid="save-edit-button"]').click()
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-name-n00"]').should('have.text', ' Gas ')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $197.60 ')

      cy.get('[data-testid="category-name-2aW"]').should('have.text', ' Water ')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $146.03 ')

      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$223.86 ')
    })
  })

  context('Modify category, splits, date, amount, all at once', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Does the modifications', () => {
      cy.get('.transaction-row .row-description').eq(5).click()
      cy.get('[data-testid="details-date"] input').clear().type('2022-08-29').blur()
      cy.get('[data-testid="details-date"] input').should('have.value', '2022-08-29')

      cy.get('[data-testid="details-value"]').click().clear().type('1.25').type('{enter}')
      cy.get('[data-testid="details-outflow-button"]').click()

      cy.get('[data-testid="details-value"]').should('have.value', '$1.25')

      cy.get('[data-testid="add-split-button"]').click()
      cy.get('[data-testid="split-0-value"]').clear().type('0.25').blur()
      cy.get('[data-testid="split-0-value"]').should('have.value', '$0.25')
      cy.get('[data-testid="split-1-value"]').should('have.value', '$1.00')

      cy.get('[data-testid="details-category-split-0"]').click()
      cy.get('[data-testid="category-search"]').type('Water').type('{downArrow}{downArrow}{enter}')
      cy.get('[data-testid="details-category-split-0"]').should('contain.text', 'Water')

      cy.get('[data-testid="details-category-split-1"]').click()
      // Need to select second search input because the first one is hidden but still in DOM
      cy.get('[data-testid="category-search"]').eq(1).type('Groceries').type('{downArrow}{downArrow}{enter}')
      cy.get('[data-testid="details-category-split-1"]').should('contain.text', 'Groceries')

      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row').should('have.length', 7)
      cy.get('.transaction-row:nth-child(2) .row-description').should('contain.text', 'Big Agra')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.get('[data-testid="category-name-2aW"]').should('have.text', ' Water ')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $177.00 ')

      cy.get('[data-testid="category-name-ATi"]').should('have.text', ' Groceries ')
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $804.95 ')
    })
  })
})
