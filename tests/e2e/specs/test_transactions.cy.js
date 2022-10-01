describe('Test transactions', () => {
  // beforeEach(() => {
  //   cy.initPath('transactions/7kW')
  // })

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
      cy.get('[data-testid="transactions-account-name"]').should('contain.text', 'Savings')
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
      // cy.get('[data-testid="edit-row-cleared"]').click()
      cy.get('.transaction-row > .row-cleared').eq(0).click()
      cy.get('[data-testid="edit-row-date"] input').clear().type('2022-07-30')
      cy.get('[data-testid="edit-row-select-category"]').type('Groceries').type('{downArrow}').type('{enter}')
      cy.get('[data-testid="edit-row-memo"]').type('Supermarket')
      cy.get('[data-testid="edit-row-outflow"]').type('56.23').blur()
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row').should('have.length', 8)
      cy.get('.date-row').eq(0).should('not.contain.text', '2022-07-30')
      cy.get('.date-row').eq(4).should('contain.text', '2022-07-30')
      cy.get('.transaction-row .row-category').eq(4).should('contain.text', 'Groceries')
      cy.get('.transaction-row .transaction-details').eq(4).should('contain.text', 'Supermarket')
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
      cy.get('.transaction-row .row-category').eq(4).click()
      cy.get('[data-testid="edit-row-inflow"]').click()
      cy.get('[data-testid="edit-row-inflow"]').type('5.00').type('{enter}')
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
      cy.get('[data-testid="transactions-account-name"]').should('contain.text', 'Savings')
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
      cy.get('[data-testid="edit-row-select-category"]').click().type('Vacation').type('{downArrow}').type('{enter}')
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('[data-testid="edit-row-memo"]').should('not.exist')
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
      cy.get('[data-testid="edit-row-select-category"]')
        .click()
        .clear()
        .type('Uncategorized')
        .type('{downArrow}')
        .type('{enter}')
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('[data-testid="edit-row-memo"]').should('not.exist')
      cy.get('.transaction-row .row-category').eq(2).should('contain.text', 'Uncategorized')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $497.53 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('contain.text', ' $497.53 ')

      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' $2,218.68 ')

      cy.get('[data-testid="transactions-page-7kW"]').click()
    })
  })

  context('Test transaction date update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Updates existing transaction category', () => {
      cy.get('.transaction-row .row-category').eq(2).click()
      cy.get('[data-testid="edit-row-date"] input').clear().type('2022-07-08')
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row').should('have.length', 7)
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('contain.text', ' $2,797.53 ')

      cy.visit('http://localhost:8082/budget/2022-07')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $3,886.79 ')
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,386.79 ')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('contain.text', ' $2,797.53 ')
    })
  })

  context('Test delete transactions', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Deletes last transaction', () => {
      cy.get('.transaction-row > .row-checkbox').eq(6).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('.transaction-row').should('have.length', 6)
      // cy.wait(1000)
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
      cy.get('[data-testid="account-balance-cleared"]').should('have.text', ' $886.04')
      cy.get('[data-testid="account-balance-uncleared"]').should('have.text', ' $2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('have.text', ' $2,996.60')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', ' $2,996.60 ')
    })

    it('Deletes second to last transaction', () => {
      cy.get('.transaction-row > .row-checkbox').eq(4).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
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
      cy.get('[data-testid="account-balance-cleared"]').should('have.text', ' $1,059.80')
      cy.get('[data-testid="account-balance-uncleared"]').should('have.text', ' $2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('have.text', ' $3,170.36')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', ' $3,170.36 ')
    })

    it('Deletes first transaction', () => {
      cy.get('.transaction-row > .row-checkbox').eq(0).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('.transaction-row').should('have.length', 4)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(3).should('have.text', ' $1,250.00 ')
      cy.get('.transaction-row > .row-balance').eq(2).should('have.text', ' $1,075.24 ')
      cy.get('.transaction-row > .row-balance').eq(1).should('have.text', ' $3,375.24 ')
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' $3,185.80 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('have.text', ' $1,075.24')
      cy.get('[data-testid="account-balance-uncleared"]').should('have.text', ' $2,110.56')
      cy.get('[data-testid="account-balance-working"]').should('have.text', ' $3,185.80')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', ' $3,185.80 ')
    })

    it('Deletes 3 transactions', () => {
      cy.get('.transaction-row > .row-checkbox').eq(0).click()
      cy.get('.transaction-row > .row-checkbox').eq(1).click()
      cy.get('.transaction-row > .row-checkbox').eq(3).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('.transaction-row').should('have.length', 1)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get('.transaction-row > .row-balance').eq(0).should('have.text', ' -$174.76 ')
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('have.text', ' -$174.76')
      cy.get('[data-testid="account-balance-uncleared"]').should('have.text', ' $0.00')
      cy.get('[data-testid="account-balance-working"]').should('have.text', ' -$174.76')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', ' -$174.76 ')
    })

    it('Deletes the final transaction', () => {
      cy.get('.transaction-row > .row-checkbox').eq(0).click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('.transaction-row').should('have.length', 0)
    })

    it('Checks transactions header was updated correctly', () => {
      cy.get('[data-testid="account-balance-cleared"]').should('have.text', ' $0.00')
      cy.get('[data-testid="account-balance-uncleared"]').should('have.text', ' $0.00')
      cy.get('[data-testid="account-balance-working"]').should('have.text', ' $0.00')
    })

    it('Checks that sidebar balance was updated correctly', () => {
      cy.get('[data-testid="transactions-page-7kW"]').should('contain.text', ' $0.00 ')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' -$752.47 ')
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
      // cy.wait(2000)
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
      cy.get('[data-testid="multiple-transaction-category-input"]')
        .click()
        .type('Gas')
        .type('{downArrow}')
        .type('{enter}')
      cy.get('[data-testid="multiple-transaction-category-apply"]').click()
      cy.get('.transaction-row .row-category').eq(6).should('contain.text', 'Gas')
      cy.get('.transaction-row .row-category').eq(2).should('contain.text', 'Gas')
      cy.get('.transaction-row .row-category').eq(1).should('contain.text', 'Gas')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $2,134.40 ') // Gas
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $995.39 ') // Groceries
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $497.53 ') // Paycheck
      cy.get('[data-testid="master-category-balance-3ks"]').should('contain.text', ' $3,315.20 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('contain.text', ' $497.53 ')
    })
  })

  context('Test that split category works', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Sets transaction as split category', () => {
      cy.get('.transaction-row .row-category').eq(4).click()
      cy.get('[data-testid="splits-button"]').click()
      cy.get('[data-testid="edit-row-split-0-outflow"]').should('have.value', '')
      cy.get('[data-testid="edit-row-split-1-outflow"]').should('have.value', '173.76')
      cy.get('[data-testid="edit-row-split-0-outflow"]').click().type('31.22')
      cy.get('[data-testid="split-category-input-0"]').click().type('Water').type('{downArrow}').type('{enter}')
      cy.get('[data-testid="split-category-input-0"]').should('have.value', 'Water')

      cy.get('[data-testid="edit-row-split-0-inflow"]').click()
      cy.get('[data-testid="edit-row-outflow"]').should('have.value', '173.76')
      cy.get('[data-testid="edit-row-split-0-outflow"]').should('have.value', '31.22')
      cy.get('[data-testid="edit-row-split-1-outflow"]').should('have.value', '142.54')
      cy.get('[data-testid="save-edit-button"]').click()
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-name-input-n00"]').should('have.value', 'Gas')
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $197.60 ')

      cy.get('[data-testid="category-name-input-2aW"]').should('have.value', 'Water')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $146.03 ')

      cy.get('[data-testid="uncategorized-balance"]').should('contain.text', ' -$223.86 ')
    })
  })

  context('Modify category, splits, date, amount, all at once', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Does the modifications', () => {
      cy.get('.transaction-row .row-category').eq(5).click()
      cy.get('[data-testid="edit-row-date"] input').clear().type('2022-08-29').blur()
      cy.get('[data-testid="edit-row-date"] input').should('have.value', '2022-08-29')

      cy.get('[data-testid="edit-row-outflow"]').type('1.25').blur()
      cy.get('[data-testid="edit-row-outflow"]').should('have.value', '1.25')
      cy.get('[data-testid="edit-row-inflow"]').should('have.value', '')

      cy.get('[data-testid="splits-button"]').click()
      cy.get('[data-testid="edit-row-split-0-outflow"]').click().type('0.25').blur()
      cy.get('[data-testid="edit-row-split-0-outflow"]').should('have.value', '0.25')
      cy.get('[data-testid="edit-row-split-1-outflow"]').should('have.value', '1.00')
      cy.get('[data-testid="edit-row-split-0-inflow"]').should('have.value', '')
      cy.get('[data-testid="edit-row-split-1-inflow"]').should('have.value', '')

      cy.get('[data-testid="split-category-input-0"]').click().type('Water').type('{downArrow}').type('{enter}')
      cy.get('[data-testid="split-category-input-0"]').should('have.value', 'Water')

      cy.get('[data-testid="split-category-input-1"]').click().type('Groceries').type('{downArrow}').type('{enter}')
      cy.get('[data-testid="split-category-input-1"]').should('have.value', 'Groceries')

      cy.get('[data-testid="save-edit-button"]').click()
      cy.get(':nth-child(2) > td.row-memo').should('contain.text', 'Split')
      cy.get('.transaction-row > .row-outflow').eq(0).should('contain.text', '$1.25')
      cy.get('.transaction-row > .row-inflow').eq(0).should('not.contain.text', '$')
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="master-category-name-input-fVM"]').should('have.value', 'Income')
      cy.get('[data-testid="master-category-balance-fVM"]').should('contain.text', ' $1,547.53 ')
      cy.get('[data-testid="category-name-input-gpe"]').should('have.value', 'Paycheck 1')
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $1,547.53 ')

      cy.get('[data-testid="category-name-input-2aW"]').should('have.value', 'Water')
      cy.get('[data-testid="category-balance-2aW"]').should('have.text', ' $177.00 ')

      cy.get('[data-testid="category-name-input-ATi"]').should('have.value', 'Groceries')
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $804.95 ')
    })
  })
})
