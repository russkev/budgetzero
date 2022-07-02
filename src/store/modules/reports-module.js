import _ from 'lodash'

export default {
  state: {},
  getters: {
    /**
     * Used to graph net worth report
     */
    incomeAndSpentByMonth: (state, getters) => {
      var income_and_spend_by_month = []
      var net_worth = 0
      
      Object.entries(getters.budgetBalances).forEach((entry) => {
        const [month, month_data] = entry
        var month_item = {}

        month_item.month = month
        const amount_data = Object.entries(month_data).reduce((partial, [id, value]) => {
          if (_.get(getters.categoriesById, [id, "isIncome"], false)) {
            partial.income += value
          }
          partial.value += value
          return partial
        }, {spent: 0, income: 0, value: 0})

        month_item = {
          ... month_item,
          income: amount_data.income / 100,
          value: amount_data.value / 100,
          spent: (amount_data.income - amount_data.value) / 100,
          net_worth: (net_worth + amount_data.value) / 100
        }

        net_worth += month_item.net_worth
        income_and_spend_by_month.push(month_item)

        net_worth = net_worth + month_data.value / 100
        month_item.net_worth = net_worth
      })

      return income_and_spend_by_month
    }
  },
  mutations: {},
  actions: {}
}
