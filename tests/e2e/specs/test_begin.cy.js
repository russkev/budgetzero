describe('Initial experience', () => {
    before(() => {
      cy.initPathEmpty("")
    })
    it('Creates a new budget', () => {
      cy.get('#budget-name-field').type('Cy1')
      cy.get('#budget-create').click()
      cy.get('#agree-button').click()

      cy.contains('.v-chip', 'Cy1')
    })
})
