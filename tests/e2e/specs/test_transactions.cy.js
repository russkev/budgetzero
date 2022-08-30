describe('Test transactions', () => {
  // beforeEach(() => {
  //   cy.initPath('transactions/7kW')
  // })

  context('Test transaction create', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Check transaction values and balance displays correctly', () => {
      cy.get(':nth-child(7) > .row-outflow', { timeout: 6000 }).should('contain.text', '$160.50')
      cy.get(':nth-child(7) > .row-balance').should('contain.text', '-$160.50')

      cy.get(':nth-child(6) > .row-inflow').should('contain.text', '$1,250.00')
      cy.get(':nth-child(6) > .row-balance').should('contain.text', '$1,089.50')

      cy.get(':nth-child(5) > .row-outflow').should('contain.text', '$173.76')
      cy.get(':nth-child(5) > .row-balance').should('contain.text', '$915.74')

      cy.get(':nth-child(4) > .row-outflow').should('contain.text', '$174.76')
      cy.get(':nth-child(4) > .row-balance').should('contain.text', '$740.98')

      cy.get(':nth-child(3) > .row-inflow').should('contain.text', '$2,300.00')
      cy.get(':nth-child(3) > .row-balance').should('contain.text', '$3,040.98')

      cy.get(':nth-child(2) > .row-outflow').should('contain.text', '$189.44')
      cy.get(':nth-child(2) > .row-balance').should('contain.text', '$2,851.54')

      cy.get(':nth-child(1) > .row-outflow').should('contain.text', '$15.44')
      cy.get(':nth-child(1) > .row-balance').should('contain.text', '$2,836.10')
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
      cy.get('[data-testid="edit-row-cleared"]').click()
      cy.get('[data-testid="edit-row-date"] input').clear().type('2022-07-30')
      cy.get('[data-testid="edit-row-category-select"] input')
        .type('Groceries')
        .type('{downArrow}')
        .type('{downArrow}')
        .type('{enter}')
      cy.get('[data-testid="edit-row-memo"] input').type('Supermarket')
      cy.get('[data-testid="edit-row-outflow"] input').type('56.23').blur()
      cy.get('[data-testid="save-edit-button"]').click()
      cy.get('.transaction-row').should('have.length', 8)
      cy.get(':nth-child(5) > .row-date').should('contain.text', '2022-07-30')
      cy.get(':nth-child(5) > .row-category').should('contain.text', 'Groceries')
      cy.get(':nth-child(5) > .row-memo').should('contain.text', 'Supermarket')
      cy.get(':nth-child(5) > .row-outflow').should('contain.text', '$56.23')
      cy.get(':nth-child(5) > .row-memo').should('not.contain.text', '$')
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get(':nth-child(6) > .row-balance').should('have.text', ' $915.74 ')
      cy.get(':nth-child(5) > .row-balance').should('have.text', ' $859.51 ')
      cy.get(':nth-child(4) > .row-balance').should('have.text', ' $684.75 ')
      cy.get(':nth-child(3) > .row-balance').should('have.text', ' $2,984.75 ')
      cy.get(':nth-child(2) > .row-balance').should('have.text', ' $2,795.31 ')
      cy.get(':nth-child(1) > .row-balance').should('have.text', ' $2,779.87 ')
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
      cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $958.97 ')
      cy.get('[data-testid="transactions-page-7kW"]').click()
    })
  })

  context('Test transaction value update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Updates existing transaction value', () => {
      cy.get(':nth-child(5) > .row-category').click()
      cy.get('[data-testid="edit-row-inflow"] input').type('5.00').type('{enter}')
      cy.get(':nth-child(5) > .row-inflow').should('have.text', ' $5.00 ')
      cy.get(':nth-child(5) > .row-outflow').should('not.contain.text', '$')
    })

    it('Checks that running balance was updated correctly', () => {
      cy.get(':nth-child(6) > .row-balance').should('have.text', ' $1,089.50 ')
      cy.get(':nth-child(5) > .row-balance').should('have.text', ' $1,094.50 ')
      cy.get(':nth-child(4) > .row-balance').should('have.text', ' $919.74 ')
      cy.get(':nth-child(3) > .row-balance').should('have.text', ' $3,219.74 ')
      cy.get(':nth-child(2) > .row-balance').should('have.text', ' $3,030.30 ')
      cy.get(':nth-child(1) > .row-balance').should('have.text', ' $3,014.86 ')
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
      cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $1,193.96 ')
    })
  })

  context('Test transaction category update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Updates existing transaction category', () => {
      cy.get(':nth-child(4) > .row-category').click()
      cy.get('[data-testid="edit-row-category-select"] input').click().type('{enter}')
      cy.get('[data-testid="save-edit-button"]').click()
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $980.71 ')
      cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $1,189.96 ')

      cy.get('[data-testid="category-balance-\\:\\:\\:"]').should('have.text', ' -$256.08 ')
      cy.get('[data-testid="master-category-balance-\\:\\:\\:"]').should('have.text', ' -$256.08 ')
    })
  })

  context('Test transaction date update', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Updates existing transaction category', () => {
      cy.get(':nth-child(3) > .row-category').click()
      cy.get('[data-testid="edit-row-date"] input').clear().type('2022-07-08')
      cy.get('[data-testid="save-edit-button"]').click()
    })

    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()

      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $2,797.53 ')

      cy.visit('http://localhost:8082/budget/2022-07')
      cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $3,886.79 ')
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,386.79 ')

      cy.get('[data-testid="next-month-button"]').click()
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $2,797.53 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $2,797.53 ')

    })
  })

  context('Test delete transactions', () => {
    before(() => {
      cy.initPath('transactions/7kW')
    })

    it('Deletes last transaction', () => {
      cy.get(':nth-child(7) > .row-checkbox').click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="transaction-row"]').should('have.length', 6)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get(':nth-child(6) > .row-balance').should('have.text', ' $1,250.00 ')
      cy.get(':nth-child(5) > .row-balance').should('have.text', ' $1,076.24 ')
      cy.get(':nth-child(4) > .row-balance').should('have.text', ' $901.48 ')
      cy.get(':nth-child(3) > .row-balance').should('have.text', ' $3,201.48 ')
      cy.get(':nth-child(2) > .row-balance').should('have.text', ' $3,012.04 ')
      cy.get(':nth-child(1) > .row-balance').should('have.text', ' $2,996.60 ')
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
      cy.get(':nth-child(5) > .row-checkbox').click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="transaction-row"]').should('have.length', 6)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get(':nth-child(5) > .row-balance').should('have.text', ' $1,250.00 ')
      cy.get(':nth-child(4) > .row-balance').should('have.text', ' $1,075.24 ')
      cy.get(':nth-child(3) > .row-balance').should('have.text', ' $3,375.24 ')
      cy.get(':nth-child(2) > .row-balance').should('have.text', ' $3,185.80 ')
      cy.get(':nth-child(1) > .row-balance').should('have.text', ' $3,170.36 ')
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
      cy.get(':nth-child(1) > .row-checkbox').click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="transaction-row"]').should('have.length', 4)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get(':nth-child(4) > .row-balance').should('have.text', ' $1,250.00 ')
      cy.get(':nth-child(3) > .row-balance').should('have.text', ' $1,075.24 ')
      cy.get(':nth-child(2) > .row-balance').should('have.text', ' $3,375.24 ')
      cy.get(':nth-child(1) > .row-balance').should('have.text', ' $3,185.80 ')
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
      cy.get(':nth-child(1) > .row-checkbox').click()
      cy.get(':nth-child(2) > .row-checkbox').click()
      cy.get(':nth-child(4) > .row-checkbox').click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="transaction-row"]').should('have.length', 1)
    })

    it('Checks tha running balance was updated properly', () => {
      cy.get(':nth-child(1) > .row-balance').should('have.text', ' -$174.76 ')
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
      cy.get(':nth-child(1) > .row-checkbox').click()
      cy.get('[data-testid="delete-selected-transactions-button"]').click()
      cy.get('[data-testid="transaction-row"]').should('have.length', 0)
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
      cy.get(':nth-child(7) > .row-checkbox').click()
      cy.get(':nth-child(6) > .row-checkbox').click()
      cy.get(':nth-child(1) > .row-checkbox').click()
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
      cy.get(':nth-child(5) > .row-checkbox').click()
      cy.get(':nth-child(3) > .row-checkbox').click()
      cy.get(':nth-child(2) > .row-checkbox').click()
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
      cy.get(':nth-child(7) > .row-checkbox').click()
      cy.get(':nth-child(3) > .row-checkbox').click()
      cy.get(':nth-child(2) > .row-checkbox').click()
      cy.get('[data-testid="categorize-as-button"]').click()
      cy.get('[data-testid="categorize-multiple-as-list"]').contains('Gas').click()
    })
    
    it('Checks that budget was updated correctly', () => {
      cy.get('[data-testid="sidebar-button-budgets"]').click()
      cy.get('[data-testid="category-balance-n00"]').should('have.text', ' $2,134.40 ') // Gas
      cy.get('[data-testid="category-balance-ATi"]').should('have.text', ' $995.39 ')   // Groceries
      cy.get('[data-testid="category-balance-gpe"]').should('have.text', ' $497.53 ')   // Paycheck
      cy.get('[data-testid="master-category-balance-3ks"]').should('have.text', ' $3,315.20 ')
      cy.get('[data-testid="master-category-balance-fVM"]').should('have.text', ' $497.53 ')
    })
  })
})
