import { prevMonth, logPerformanceTime } from '../../helper'
import { ID_LENGTH, ID_NAME } from '../../constants'
import { compareAscii } from './id-module'
import _, { result } from 'lodash'
import Vue from 'vue'

export default {
  state: {
    monthlyCategoryData: {},
    allCategoryBalances: {}
  },
  getters: {
    monthlyCategoryData: (state) => state.monthlyCategoryData,
    allCategoryBalances: (state) => {
      console.log("ALL CATEGORY BALANCES ACCESSED")
      return state.allCategoryBalances
    },
    allMonths: (state) => Object.keys(state.allCategoryBalances),
    // allMonths: (state) =>{return Object.keys(state.allCategoryBalances)},
    monthsInUse (state) {
      console.log("MONTHS IN USE ACCESSED")
      return Object.keys(state.allCategoryBalances)
    },
    // monthsInUse: (state) => Object.keys(state.allCategoryBalances)
    smonths: (state) => Object.keys(state.allCategoryBalances),
    // allMonths: (state) => state.allCategoryBalances.reduce((partial, current))
  },
  mutations: {
    SET_MONTHLY_CATEGORY_DATA(state, payload) {
      state.monthlyCategoryData = payload
    },
    REORDER_MASTER_CATEGORIES(state, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        this.dispatch('commitDocToPouchAndVuex', { current: master, previous: null })
      })
    },

    SET_ALL_CATEGORY_BALANCES(state, payload) {
      state.allCategoryBalances = payload
    },

    INIT_CATEGORY_BALANCES_MONTH(state, {month, categories, monthCategories, getters }) {
      const month_balances 
        = initCategoryBalancesMonth(state.allCategoryBalances, month, categories, monthCategories)
      Vue.set(state.allCategoryBalances, month, month_balances)
    },

    UPDATE_CATEGORY_BALANCES(state, { month, master_id, category_id, budgeted, spent }) {
      const month_balances 
        = updateSingleCategory(state.allCategoryBalances, month, master_id, category_id, budgeted, spent, null)
      Vue.set(state.allCategoryBalances, month, month_balances)

      let prev_balance = getCategoryBalance(state.allCategoryBalances, month, master_id, category_id)

      Object.keys(state.allCategoryBalances).map((current_month) => {
        if (this._vm.compareAscii(current_month, month) > 0) {
          const current_month_balances 
            = updateSingleCategory(state.allCategoryBalances, current_month, master_id, category_id, 0, 0, prev_balance)
          Vue.set(state.allCategoryBalances, current_month, current_month_balances)
          prev_balance = getCategoryBalance(state.allCategoryBalances, current_month, master_id, category_id)
        }
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

      return context.dispatch('commitDocToPouchAndVuex', { current: payload, previous: null })
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
      return context.dispatch('commitDocToPouchAndVuex', { current: category, previous: null })
    },
    updateCategory(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', { current: payload, previous: null })
    },
    flipMasterCategoryCollapsed(context, payload) {
      const cat = Object.assign({}, payload)
      cat.collapsed = !cat.collapsed
      context.dispatch('commitDocToPouchAndVuex', { current: cat, previous: null })
    },
    flipCategoryHidden(context, payload) {
      const cat = Object.assign({}, payload)
      cat.hidden = !cat.hidden
      context.dispatch('commitDocToPouchAndVuex', { current: cat, previous: null })
    },
    updateCategoryAmount(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', { current: payload, previous: null }).catch((error) => {
        console.log('updateCategoryAmount error:', error)
      })
    },
    reorderMasterCategories(context, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        context.dispatch('commitDocToPouchAndVuex', { current: master, previous: null })
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
      context.dispatch('commitDocToPouchAndVuex', { current: item, previous: null }).then((result) => {
        let categoriesGroupedByMaster = JSON.parse(JSON.stringify(context.getters.categoriesGroupedByMaster))
        // Then iterate through them and re-set all their sort values
        for (const [key, masterArray] of Object.entries(categoriesGroupedByMaster)) {
          if (key !== 'undefined') {
            //Skip undefined master categories (income, incomeNextMonth, etc)
            masterArray.sort((a, b) => (a.sort > b.sort ? 1 : -1))
            masterArray.forEach((category, i) => {
              if (category.sort !== i) {
                category.sort = i
                context.dispatch('commitDocToPouchAndVuex', { current: category, previous: null })
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
    },

    // updateCategoryData({ commit, getters }, { month, master_id, category_id, budgeted, spent }) {
    //   if (!getters.monthsInUse.contains(month)) {
    //     // dispatch('initCategoryBalancesMonth', {})
    //     const categories = getters.categories
    //     const monthCategories = getters.monthCategories
    //     commit('INIT_CATEGORY_BALANCES_MONTH', { month, categories, monthCategories })
    //     // commit('UPDATE_ALL_MONTHS', month)
    //   }
    //   if (getters.monthsInUse.contains(month)) {
    //     const monthsInUse = getters.monthsInUse
    //     commit('UPDATE_CATEGORY_BALANCES', { month, master_id, category_id, budgeted, spent, monthsInUse })
    //   }
    // },

    async calculateAllValues({ commit, dispatch, getters }) {
      console.log('CALCULATE ALL VALUES')

      return Promise.all([
        dispatch('fetchCategories'),
        dispatch('fetchMasterCategories'),
        dispatch('fetchMonthCategories')
      ])
        .then(() => {
          return dispatch('fetchAllTransactions')
        })
        .then((result) => {
          const t1 = performance.now()
          let a_balances = {}
          let b_balances = {}
          // console.log(result)
          result.rows.map((row) => {
            const account_id = row.doc.account
            const working = row.doc.value
            const month = row.doc.date.slice(0, 7)
            // const prev_month = prevMonth(month)
            const category_id = row.doc.category
            const master_id = _.get(getters.categoriesByTruncatedId, [category_id, 'masterCategory'], 'null')
            // const budgeted = _.get(getters.monthCategoryBudgets, [month, category_id, 'budget'], 0)
            const cleared = row.doc.cleared ? working : 0
            const uncleared = row.doc.cleared ? 0 : working

            _.defaultsDeep(a_balances, this._vm.defaultAccountBalance(account_id))
            this._vm.updateAccountBalances(a_balances, account_id, cleared, uncleared, working)

            if (b_balances[month] === undefined) {
              b_balances[month] = initCategoryBalancesMonth(b_balances, month, getters.categories, getters.monthCategoryBudgets)
            }

            b_balances[month] = updateSingleCategory(b_balances, month, master_id, category_id, 0, working, null)

          })
          logPerformanceTime('calculateAllValues', t1)
          // commit('SET_ALL_MONTHS_FROM_OBJECT', b_balances)
          commit('SET_ALL_ACCOUNT_BALANCES', a_balances)
          commit('SET_ALL_CATEGORY_BALANCES', b_balances)
          console.log(a_balances)
          console.log(b_balances)
          return b_balances
        })
      //     .then((b_balances) => {
      //       /** Initial load:
      //        *  - Save a list of used months to global state
      //        *  - Load up first month in list
      //        *  - Read all available budget and balance data for that month
      //        *  - Create a document list with all monthCategory data for every category of that month
      //        *  - Put in database (use rev etc. to make sure existing documents get updated correctly)
      //        *  - Set variable called previous to the document list
      //        *  - Move to month in the list
      //        *  - Repeat the same steps to updated database and local
      //        *    - Make sure to include balance from previous month
      //        *
      //        *  Updating category budget item
      //        *  - Make sure the month is in global list of months
      //        *  - Use pouchdb map function to get all CategoryMonth documents
      //        *    - From edited month to latest month
      //        *    - Just the category ID being edited
      //        *  - Use bulk docs to put updated docs back into database
      //        *
      //        *  Displaying
      //        *  - For every category, use global months state to fetch the most previous month data
      //        *  - Add the previous balance to the current
      //        *  - Maybe deal with negative previous balances differently
      //        */
      //       context.getters.monthsInUse.map((month) => {
      //         context.getters.categories.map((category) => {
      //           const category_id = category._id.slice(-ID_LENGTH.category)
      //           const master_id = category.masterCategory
      //           _.defaultsDeep(b_balances, defaultCategoryBalance())
      //           // Get month category data
      //           // Update every category
      //           // Save
      //         })
      //       })

      //       //   let previous = null
      //       //   const db = Vue.prototype.$pouch
      //       //   const key = `b_${budget_id}${ID_NAME.monthCategory}`
      //       //   return db.allDocs({
      //       //     include_docs: true,
      //       //     attachments: false,
      //       //     startkey: key,
      //       //     endkey: key + '\ufff0'
      //       //   }).then((allMonthCategories) => {
      //       //     context.getters.monthsInUse.map((month) => {

      //       //     })
      //       //   })
      //       //   return Promise.all(context.getters.monthsInUse.map((month) => {
      //       //     return db.allDocs({

      //       //     }).then((result) => {
      //       //       const data = context.getters.categories.map((category) => {
      //       //         const category_id = category._id.split(ID_LENGTH.category)

      //       //     })

      //       //       // const previous_balance = previous ? _.get(previous, [month, category])
      //       //     })

      //       //   }))
      //     })
      // }

      // // calculateCategoryBalanceUpdate(context, { current, previous }) {
      // //   const category = context.getters.categoriesByTruncatedId[current.category]
      // //   if (category === undefined) {
      // //     Promise.reject("Couldn't find category")
      // //     return
      // //   }

      // //   const master_id = context.getters.masterCategoriesByTruncatedId[category.masterCategory]
      // //   const budget_payload = {
      // //     month: current.date.slice(0, 7),
      // //     master_id: master_id,
      // //     category_id: category._id.slice(-ID_LENGTH.category),
      // //     budgeted: 0,
      // //     spent: current.value
      // //   }
      // //   console.log('BUDGET PAYLOAD')
      // //   console.log(budget_payload)
      // //   return budget_payload
    },
    calculateCategoryBalanceUpdate({ commit, getters }, { current, previous }) {
      if (!current && !previous) {
        console.warn('calculateCategoryBalanceUpdate called with no current or previous data')
      }
      const current_month = current ? current.date.slice(0, 7) : null
      const previous_month = previous ? previous.date.slice(0, 7) : null


      const current_master_id = getters.categoriesByTruncatedId[current.category]['masterCategory']

      // let current_index = getters.monthsInUse.indexOf(current_month)
      // const previous_index = previous === null ? -1 : getters.monthsInUse.indexOf(current_month)


      if (getters.allCategoryBalances[current_month] === undefined) {
        console.log('INITING BALANCE MONTH')
        commit('INIT_CATEGORY_BALANCES_MONTH', {
          month: current_month,
          categories: getters.categories,
          monthCategories: getters.monthCategories,
          getters: getters,

        })

        }
        // current_index = getters.monthsInUse.indexOf(current_month)
        
        

      // const _allMonths = getters.monthsInUse
      // const _monthsInUse = getters.monthsInUse
      // const _smonths = getters.smonths

      // const monthsInUse = getters.monthsInUse
      if (getters.allCategoryBalances[current_month] === undefined) {
        console.warn(`Unable to init category balances month with: ${current_month}`)
      }

      const transaction_payload = {
        month: current_month,
        master_id: current_master_id,
        category_id: current.category,
        // budgeted: _.get(getters.allCategoryBalances, [current_month, current_master_id, current.category, 'budgeted'], 0),
        budgeted: 0,
        spent: 0,
      }

      if (previous === null) {
        previous = { ...transaction_payload }
      }

      const value_difference = current.value - previous.value
      let result = []

      if (current.category === previous.category && current_month === previous_month) {
        result.push({
          ...transaction_payload,
          spent: value_difference
        })
      } else {
        result.push({
          ...transaction_payload,
          spent: current.value
        })
        result.push({
          ...transaction_payload,
          month: previous.month,
          master_id: previous.masterCategory,
          category_id: previous.category,
          spent: -current.value
        })
      }

                // console.log('--manual:', JSON.stringify(Object.keys(getters.allCategoryBalances)))
                // console.log('--smonths:', JSON.stringify(getters.smonths))
                // console.log('--allMonths:', JSON.stringify(getters.allMonths))
                // console.log('--monthsInUse:', JSON.stringify(getters.monthsInUse))
      return result
    }
  }
}

const initCategoryBalancesMonth = (current_balances, month, categories, monthCategoryBudgets) => {
  const used_months = Object.keys(current_balances).filter((used_month) => {
    // return ('' + used_month).localeCompare(month) < 0
    return compareAscii(used_month, month) < 0
  })
  const num_months = used_months.length
  const prev_month = num_months > 0 ? used_months[num_months - 1] : null
  // console.log("CATEGORIES")
  // console.log(categories)
  return categories.reduce((partial, category) => {
    const category_id = category._id !== null ? category._id.slice(-ID_LENGTH.category) : null
    const master_id = category.masterCategory
    const category_budget = _.get(monthCategoryBudgets, [month, category_id, 'budget'], 0)
    let prev_balance = 0
    if (prev_month) {
      prev_balance = getCategoryBalance(current_balances, prev_month, master_id, category_id)
    }
    partial = updateSingleCategory(current_balances, month, master_id, category_id, category_budget, 0, prev_balance)
    return partial
    // return current_balances
  }, {})
}

const getCategoryBalance = (current_balances, month, master_id, category_id, default_carryover = 0) => {
  return (
    _.get(current_balances, [month, master_id, category_id, 'budgeted'], 0) +
    _.get(current_balances, [month, master_id, category_id, 'spent'], 0) +
    _.get(current_balances, [month, master_id, category_id, 'carryover'], default_carryover)
  )
}

/**
 * 
 * @param {Object} previous_balances The object to update
 * @param {string} month The month
 * @param {string} master_id Truncated Master Category ID
 * @param {string} category_id Truncated Category ID
 * @param {number} budgeted The value in cents to update the category budget with
 * @param {number} spent The value in cents to update the category spent amount with
 * @param {number|null} carryover The value to overwrite the category carryover value with. 
 * Note: Use null for carryover if not intending to update this value
 */
const updateSingleCategory = (previous_balances, month, master_id, category_id, budgeted, spent, carryover) => {
  const month_balances 
    = _.defaultsDeep(previous_balances, defaultCategoryBalance(month, master_id, category_id))[month]
  let carryover_difference = 0
  if (carryover !== null) {
    carryover_difference = carryover - previous_balances[month][master_id][category_id].carryover
  }
  if (isNaN(budgeted) || isNaN(spent)) {
    console.warn(`updateSingleCategory called with invalid values, budgeted: ${budgeted}, spent:${spent}`)
    return
  }

  month_balances.budgeted += budgeted
  month_balances.spent += spent
  month_balances.carryover += carryover_difference
  month_balances[master_id].budgeted += budgeted
  month_balances[master_id].spent += spent
  month_balances[master_id].carryover += carryover_difference
  month_balances[master_id][category_id].budgeted += budgeted
  month_balances[master_id][category_id].spent += spent
  month_balances[master_id][category_id].carryover += carryover_difference

  return month_balances
}

const defaultCategoryBalance = (month, master_id, category_id) => {
  return {
    [month]: {
      budgeted: 0,
      spent: 0,
      carryover: 0,
      [master_id]: {
        budgeted: 0,
        spent: 0,
        carryover: 0,
        [category_id]: {
          budgeted: 0,
          spent: 0,
          carryover: 0
        }
      }
    }
  }
}

export { updateSingleCategory, defaultCategoryBalance, getCategoryBalance }
