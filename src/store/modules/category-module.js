import { prevMonth, logPerformanceTime } from '../../helper'
import { ID_LENGTH, ID_NAME } from '../../constants'

export default {
  state: {
    monthlyCategoryData: {}
  },
  getters: {
    monthlyCategoryData: (state) => state.monthlyCategoryData
  },
  mutations: {
    SET_MONTHLY_CATEGORY_DATA(state, payload) {
      state.monthlyCategoryData = payload
    },
    REORDER_MASTER_CATEGORIES(state, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        this.dispatch('commitDocToPouchAndVuex', master)
      })
    }
  },
  actions: {
    /**
     * Recalculates entire budget. Returns dict of final budget data calculations. 
     * Example:
         monthly_data: Object
            2020-01: Object
              06831c46-ac34-43a9-b0c7-be672d3059ab: Object
                balance:0
                budgeted:0
                spent:0
    * @returns 
    */
    calculateMonthlyCategoryData({ getters, commit, dispatch }) {
      let final_data = {}

      const selected_month = getters.selectedMonth
      const prev_month = prevMonth(selected_month)
      console.log(`Selected month: ${selected_month}, prev month: ${prev_month}`)
      const t1 = performance.now()

      return new Promise((resolve, reject) => {
        return dispatch('calculateSingleMonthData', { month: prev_month, previous_month_data: {} })
          .then((result) => {
            final_data[prev_month] = result
            return dispatch('calculateSingleMonthData', {
              month: selected_month,
              previous_month_data: final_data[prev_month]
            })
          })
          .then((result) => {
            final_data[selected_month] = result
            commit('SET_MONTHLY_CATEGORY_DATA', final_data)
            resolve(final_data)
            logPerformanceTime('calculateMonthlyCategoryData', t1)
          })
      })
    },

    calculateSingleMonthData({ getters, dispatch }, { month, previous_month_data }) {
      let summaryData = {
        income_this_month: 0,
        overspent: 0,
        last_month_overspent: _.get(previous_month_data, `summaryData.overspent`, 0),
        balance_this_month: 0,
        budgeted_this_month: 0,
        available_to_budget_this_month: 0,
        available_to_budget_last_month: _.get(previous_month_data, `summaryData.available_to_budget_this_month`, 0)
      }
      let categories = {}

      return Promise.all(
        getters.categories.map((category) => {
          return dispatch('calculateSingleCategoryData', {
            month: month,
            category: category,
            previous_month_data: previous_month_data
          }).then((result) => {
            summaryData.overspent += result.overspent
            summaryData.budgeted_this_month += result.budgeted_this_month
            summaryData.income_this_month += result.income_this_month
            categories = { ...categories, ...result.categories }
            return
          })
        })
      ).then(() => {
        summaryData.available_to_budget_this_month =
          summaryData.available_to_budget_last_month +
          summaryData.income_this_month -
          summaryData.budgeted_this_month +
          summaryData.last_month_overspent

        return { summaryData: summaryData, categories: categories }
      })
    },

    calculateSingleCategoryData({ getters }, { month, category, previous_month_data }) {
      const category_id = category._id ? category._id.slice(-ID_LENGTH.category) : null

      const spent = _.get(getters.budgetBalances, [month, category_id], 0)
      const isIncome = _.get(getters.categoriesByTruncatedId, [category_id, 'isIncome'], false)
      const budgeted = _.get(getters.monthCategoryBudgets, [month, category_id, 'budget'], 0)
      const activity = spent + budgeted
      const prev_month = _.get(previous_month_data, ['categories', category_id, 'overspending'], false)

      const isOverspending = _.get(getters.monthCategoryBudgets, [month, category_id, 'overspending'], false)

      var category_balance
      var category_balance_raw = _.get(previous_month_data, ['categories', category_id, 'balance'], 0)

      if (category_balance_raw > 0 || prev_month) {
        category_balance = activity + category_balance_raw
      } else {
        category_balance = activity
      }

      if (isOverspending) {
        //Need to carry over overspent balance to next month
      }

      let result_object = {
        overspent: category_balance < 0 && !isOverspending ? category_balance : 0,
        budgeted_this_month: budgeted,
        income_this_month: isIncome ? spent : 0,
        categories: {}
      }

      result_object.categories[category_id] = {
        budgeted: budgeted,
        spent: spent,
        balance: category_balance,
        overspending: isOverspending
      }
      return result_object
    },
    createMasterCategory: async (context, { category_name, is_income = false, sort = 1 }) => {
      const prefix = `b_${context.rootState.selectedBudgetID}${ID_NAME.masterCategory}`
      const id = await context.dispatch('generateUniqueShortId', { prefix, sort })
      const payload = {
        _id: prefix + id,
        name: category_name,
        sort: sort,
        collapsed: false,
        isIncome: is_income
      }

      return context.dispatch('commitDocToPouchAndVuex', payload)
    },

    createCategory: async (context, payload) => {
      const categoriesGroup = context.getters.categoriesGroupedByMaster[payload.master_category_id]

      const sort_length = categoriesGroup ? categoriesGroup.length : 0

      const prefix = `b_${context.rootState.selectedBudgetID}${ID_NAME.category}`
      const id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      const category = {
        _id: `b_${context.rootState.selectedBudgetID}${ID_NAME.category}${id}`,
        name: payload.category_name,
        sort: sort_length,
        hidden: false,
        masterCategory: payload.master_category_id,
        isIncome: payload.isIncome ? payload.isIncome : false
      }
      return context.dispatch('commitDocToPouchAndVuex', category)
    },
    updateCategory(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', payload)
    },
    flipMasterCategoryCollapsed(context, payload) {
      const cat = Object.assign({}, payload)
      cat.collapsed = !cat.collapsed
      context.dispatch('commitDocToPouchAndVuex', cat)
    },
    flipCategoryHidden(context, payload) {
      const cat = Object.assign({}, payload)
      cat.hidden = !cat.hidden
      context.dispatch('commitDocToPouchAndVuex', cat)
    },
    updateCategoryAmount(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', payload).catch((error) => {
        console.log('updateCategoryAmount error:', error)
      })
    },
    reorderMasterCategories(context, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        context.dispatch('commitDocToPouchAndVuex', master)
      })
    },
    reorderSubCategory(context, payload) {
      //Get the category that was moved
      const old_index = payload.oldIndex
      const new_index = payload.newIndex
      const from_master_category_id = payload.from.className
      const to_master_category_id = payload.to.className

      const item = {
        ...context.getters.categoriesGroupedByMaster[from_master_category_id][old_index],
        sort: new_index > old_index ? new_index + 0.5 : new_index - 0.5,
        masterCategory: to_master_category_id
      }

      //First, we update the subcategory to it's correct mastercategory
      context.dispatch('commitDocToPouchAndVuex', item).then((result) => {
        let categoriesGroupedByMaster = JSON.parse(JSON.stringify(context.getters.categoriesGroupedByMaster))
        // Then iterate through them and re-set all their sort values
        for (const [key, masterArray] of Object.entries(categoriesGroupedByMaster)) {
          if (key !== 'undefined') {
            //Skip undefined master categories (income, incomeNextMonth, etc)
            masterArray.sort((a, b) => (a.sort > b.sort ? 1 : -1))
            masterArray.forEach((category, i) => {
              if (category.sort !== i) {
                category.sort = i
                context.dispatch('commitDocToPouchAndVuex', category)
              }
            })
          }
        }
      })
    },

    initializeIncomeCategory(context) {
      console.log('Init base budget categories')
      const master_category_payload = {
        category_name: 'Income',
        is_income: true,
        sort: 0
      }
      return context.dispatch('createMasterCategory', master_category_payload).then((response) => {
        const payload = {
          category_name: 'Paycheck 1',
          master_category_id: response.id.slice(-ID_LENGTH.category),
          isIncome: true
        }
        return context.dispatch('createCategory', payload)
      })
    },

    /**
     * Initialize categories in a new budget
     */
    initializeBudgetCategories(context) {
      console.log('Init default budget categories')
      const starter_categories = {
        Giving: ['Tithing', 'Charitable'],
        'Everyday Expenses': ['Restaurants', 'Groceries', 'Household Goods', 'Spending Money'],
        'Monthly Bills': [
          'Medical/Dental',
          'Internet',
          'Rent/Mortgage',
          'Clothing',
          'Water',
          'Renters Insurance',
          'Car Insurance',
          'Phone',
          'Fuel',
          'Car Maintenance',
          'Electricity',
          'Cable TV'
        ],
        Debt: ['Student Loan Payment', 'Car Payment'],
        'Savings Goals': [
          'Rainy Day Funds',
          'Christmas',
          'Birthdays',
          'Emergency Fund',
          'Car Replacement',
          'Retirement',
          'Vacation'
        ]
      }
      return Promise.all(
        Object.keys(starter_categories).map((master_category, index) => {
          const master_category_payload = {
            category_name: master_category,
            is_income: false,
            sort: index
          }
          return context.dispatch('createMasterCategory', master_category_payload).then((response) => {
            return Promise.all(
              starter_categories[master_category].map((subcategory) => {
                const payload = {
                  category_name: subcategory,
                  master_category_id: response.id.slice(-ID_LENGTH.category),
                  isIncome: false
                }
                return context.dispatch('createCategory', payload)
              })
            )
          })
        })
      )
    }
  }
}
