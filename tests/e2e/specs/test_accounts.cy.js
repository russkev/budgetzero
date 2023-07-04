describe('Test accounts', () => {
  // beforeEach(() => {
  // })
  it('Adds a simple account', () => {
    cy.initPath('transactions/7kW')

    // Open the add account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.transaction-row').should('have.length', 7)
    cy.get('[data-testid="btn-new-account-on-budget"]', { force: true }).click({ force: true })

    // Give a name
    cy.get('[data-testid="account-name-input"]').type('Emergency').blur()

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').click()

    // Check that account list has been updated correctly
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.sidebar-on-account-item').should('have.length', 4)
    cy.get('.sidebar-on-account-item').eq(3).should('contain', 'Emergency')
  })

  it('Tests starting balance', () => {
    cy.initPath('categories/2022-07')
    cy.get('[data-testid="transactions-page-7kW"]').click()

    // Open the edit account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.sidebar-on-account-item').eq(1).click().trigger('mouseover').should('have.class', 'expanded')
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Give a starting balance
    cy.get('[data-testid="account-initial-balance-input"]').type('1000').type('{ctrl+enter}')

    // Check that modal is closed
    cy.get('[data-testid="account-edit-modal"]').should('not.be.visible')

    // Check transactions values
    cy.get('.transaction-row > .row-balance').eq(3).should('contain.text', '$580.00')
    cy.get('.transaction-row > .row-balance').eq(2).should('contain.text', '$498.68')
    cy.get('.transaction-row > .row-balance').eq(1).should('contain.text', '$438.68')
    cy.get('.transaction-row > .row-balance').eq(0).should('contain.text', '-$81.32')

    cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '-$81.32')
    cy.get('[data-testid="account-balance-cleared"]').should('contain.text', '-$81.32')
    cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', '$0.00')
    cy.get('[data-testid="account-balance-working"]').should('contain.text', '-$81.32')

    // Check that categories page was updated correctly
    cy.get('[data-testid="sidebar-button-categories"]').click()

    cy.get('[data-testid="working-carryover"]').should('contain.text', '$1,000.00')
    cy.get('[data-testid="working-income"]').should('contain.text', '$1,586.79')
    cy.get('[data-testid="working-budgeted"]').should('contain.text', '$1,918.26')
    cy.get('[data-testid="working-available"]').should('contain.text', '$668.53')

    cy.get('[data-testid="next-month-button"]').click()
    cy.get('[data-testid="working-carryover"]').should('contain.text', '$668.53')
    cy.get('[data-testid="working-income"]').should('contain.text', '$2,881.64')
    cy.get('[data-testid="working-budgeted"]').should('contain.text', '$275.50')
    cy.get('[data-testid="working-available"]').should('contain.text', '$3,274.67')

    // Open the add account modal
    cy.get('[data-testid="btn-new-account-on-budget"]', { force: true }).click({ force: true })

    // Give a name
    cy.get('[data-testid="account-name-input"]').filter(':visible').type('Emergency').blur()

    // Give a starting balance
    cy.get('[data-testid="account-initial-balance-input"]').filter(':visible').type('-500').blur()
    cy.get('[data-testid="account-initial-balance-input"]').filter(':visible').should('have.value', '-$500.00')

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').filter(':visible').click()

    // Check that account list has been updated correctly
    cy.get('.sidebar-on-account-item').should('have.length', 4)
    cy.get('.sidebar-on-account-item').eq(3).should('contain', 'Emergency')

    // Check that categories page was updated correctly
    cy.get('[data-testid="working-carryover"]').should('contain.text', '$168.53')
    cy.get('[data-testid="working-income"]').should('contain.text', '$2,881.64')
    cy.get('[data-testid="working-budgeted"]').should('contain.text', '$275.50')
    cy.get('[data-testid="working-available"]').should('contain.text', '$2,774.67')

    cy.get('[data-testid="previous-month-button"]').click()
    cy.get('[data-testid="working-carryover"]').should('contain.text', '$500.00')
    cy.get('[data-testid="working-income"]').should('contain.text', '$1,586.79')
    cy.get('[data-testid="working-budgeted"]').should('contain.text', '$1,918.26')
    cy.get('[data-testid="working-available"]').should('contain.text', '$168.53')
  })

  it('Tests invert balance', () => {
    cy.initPath('categories/2022-07')

    // Open the edit account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="sidebar-button-categories"]').click().trigger('mouseover')
    cy.get('[data-testid="btn-edit-account-v6A"]').click()

    // Invert balance
    cy.get('[data-testid="account-invert-balance-checkbox"]').click()

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').filter(':visible').click()

    // Check working
    cy.get('[data-testid="working-income"]').should('contain.text', '$913.21')
    cy.get('[data-testid="working-available"]').should('contain.text', '-$1,005.05')

    // Check categories
    cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
    cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $913.21 ')

    // Check total balance header item
    cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget')
    cy.get('[data-testid="total-balance"]').should('contain.text', '$1,005.05')

    // Go to transactions page
    cy.get('[data-testid="transactions-page-v6A"]').click()

    cy.get('.transaction-row > .row-inflow').eq(4).should('contain.text', '$5.21')
    cy.get('.transaction-row > .row-balance').eq(4).should('contain.text', '$5.21')

    cy.get('.transaction-row > .row-outflow').eq(3).should('contain.text', '$342.00')
    cy.get('.transaction-row > .row-balance').eq(3).should('contain.text', '-$336.79')

    cy.get('.transaction-row > .row-inflow').eq(2).should('contain.text', '$2.36')
    cy.get('.transaction-row > .row-balance').eq(2).should('contain.text', '-$334.43')

    cy.get('.transaction-row > .row-outflow').eq(1).should('contain.text', '$264.00')
    cy.get('.transaction-row > .row-balance').eq(1).should('contain.text', '-$598.43')

    cy.get('.transaction-row > .row-outflow').eq(0).should('contain.text', '$320.00')
    cy.get('.transaction-row > .row-balance').eq(0).should('contain.text', '-$918.43')
  })

  it('Tests tracking / untracking account', () => {
    cy.initPath('categories/2022-07')

    // Open the edit account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="sidebar-button-categories"]').click().trigger('mouseover')
    cy.get('[data-testid="btn-edit-account-v6A"]').click()

    // Untrack account
    cy.get('[data-testid="account-on-budget-checkbox"]').filter(':visible').click()

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').filter(':visible').click()

    // Check that account list has been updated correctly
    cy.get('.sidebar-on-account-item').should('have.length', 2)
    cy.get('.sidebar-off-account-item').should('have.length', 1)
    cy.get('.sidebar-off-account-item').eq(0).should('contain', 'Investment')

    // Check working
    cy.get('[data-testid="working-income"]').should('contain.text', '$1,250.00')
    cy.get('[data-testid="working-available"]').should('contain.text', '-$668.26')

    // Check categories
    cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
    cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $1,250.00 ')

    // Check total balance header item
    cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount over budget')
    cy.get('[data-testid="total-balance"]').should('contain.text', '$668.26')

    // Go to next month
    cy.get('[data-testid="next-month-button"]').click()

    // Check working
    cy.get('[data-testid="working-carryover"]').should('contain.text', '-$668.26')
    cy.get('[data-testid="working-income"]').should('contain.text', '2,300.00')
    cy.get('[data-testid="working-available"]').should('contain.text', '$1,356.24')

    // Check categories
    cy.get('[data-testid="category-name-gpe"]').should('have.text', ' Paycheck 1 ')
    cy.get('[data-testid="category-spent-gpe"]').should('have.text', ' $2,300.00 ')

    // Check total balance header item
    cy.get('[data-testid="total-balance-title"]').should('contain.text', 'Amount left to budget')
    cy.get('[data-testid="total-balance"]').should('contain.text', '$1,356.24')

    // Go to transactions page
    cy.get('[data-testid="transactions-page-v6A"]').click()
    cy.get('.transaction-row > .row-category').should('not.exist')

    cy.get('.transaction-row .row-description').eq(2).click()
    cy.get('[data-testid="details-category"]').should('not.exist')

    // Go to tracked account transactions page
    cy.get('[data-testid="transactions-page-ELC"]').click()

    // Open the edit account modal
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Untrack account
    cy.get('[data-testid="account-on-budget-checkbox"]').filter(':visible').click()

    // Apply
    cy.get('[data-testid="btn-modal-confirm"]').filter(':visible').click()

    // Check that account list has been updated correctly
    cy.get('.sidebar-on-account-item').should('have.length', 1)
    cy.get('.sidebar-off-account-item').should('have.length', 2)
    cy.get('.sidebar-off-account-item').eq(0).should('contain', 'Credit')

    // Check transactions
    cy.get('.transaction-row > .row-category').should('not.exist')
    cy.get('.transaction-row .row-description').eq(1).click()
    cy.get('[data-testid="details-category"]').should('not.exist')
  })

  it('Tests drag drop accounts', () => {})

  it('Adds a note to an account', () => {
    cy.initPath('categories/2022-07')

    // Open the edit account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="sidebar-button-categories"]').click().trigger('mouseover')
    cy.get('[data-testid="btn-edit-account-v6A"]').click()

    // Add a note and apply
    cy.get('[data-testid="account-notes-field"]').type('This is a note').type('{ctrl+enter}')

    // Check that modal is closed
    cy.get('[data-testid="account-edit-modal"]').should('not.be.visible')

    // Open the edit account modal
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="sidebar-button-categories"]').click().trigger('mouseover')
    cy.get('[data-testid="btn-edit-account-v6A"]').click()

    // Check note
    cy.get('[data-testid="account-notes-field"]').should('have.value', 'This is a note')

    // Change note
    cy.get('[data-testid="account-notes-field"]').type('Another note')

    // Cancel
    cy.get('[data-testid="btn-modal-cancel"]').filter(':visible').click()

    // Open the edit account modal
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('[data-testid="sidebar-button-categories"]').click().trigger('mouseover')
    cy.get('[data-testid="btn-edit-account-v6A"]').click()

    // Check note
    cy.get('[data-testid="account-notes-field"]').should('have.value', 'This is a note')
  })
  it('Deletes an account', () => {
    cy.initPath('transactions/7kW')
    // Open the edit account modal
    cy.get('[data-testid="full-screen-loading"]').should('not.exist')
    cy.get('.v-progress-linear__buffer').should('not.exist')
    cy.get('.transaction-row').should('have.length', 7)
    cy.get('.sidebar-on-account-item').eq(1).click().trigger('mouseover').should('have.class', 'expanded')
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Delete account transactions
    cy.get('[data-testid="btn-delete-account-transactions"]').click()
    cy.get('[data-testid="delete-confirm-button"]').click()

    // Check that there are no transactions left
    cy.get('.transaction-row').should('have.length', 0)

    // Check that header was updated
    cy.get('[data-testid="account-balance-cleared"]').should('contain.text', ' $0.00')
    cy.get('[data-testid="account-balance-uncleared"]').should('contain.text', ' $0.00')
    cy.get('[data-testid="account-balance-working"]').should('contain.text', ' $0.00')

    // Check that sidebar balance was updated
    cy.get('[data-testid="transactions-page-ELC"]').should('contain.text', '$0.00')
    cy.get('[data-testid="sidebar-group-accounts"]').should('contain.text', '$3,754.53')

    // Re-open the account modal
    cy.get('.sidebar-on-account-item').eq(1).click().trigger('mouseover').should('have.class', 'expanded')
    cy.get('[data-testid="btn-edit-account-ELC"]').click()

    // Delete the account
    cy.get('[data-testid="btn-delete-account"]').click()
    cy.get('[data-testid="delete-confirm-button"]').filter(':visible').click()

    // Check that account is removed from list
    cy.get('.sidebar-on-account-item').should('have.length', 2)
    cy.get('.sidebar-on-account-item').eq(1).should('not.contain', 'Credit')

    // Check that we are redirected
    cy.get('[data-testid="transactions-heading"]').should('contain.text', 'Savings')
  })
})
