import {  logPerformanceTime, extractMonthCategoryMonth } from '../../helper'
import { ID_LENGTH, ID_NAME, UNCATEGORIZED } from '../../constants'
import { compareAscii } from './id-module'
import _ from 'lodash'
import Vue from 'vue'

const DEFAULT_CATEGORY_STATE = {
  allCategoryBalances: {},
  // monthCategoryBudgets: [],
  masterCategories: [],
  categories: []
}

export default {
  state: {
    ...DEFAULT_CATEGORY_STATE
  },
  getters: {
    allCategoryBalances: (state) => state.allCategoryBalances,
    monthsInUse(state) {
      return Object.keys(state.allCategoryBalances).sort((a, b) => compareAscii(a, b))
    },
    // masterCategories: (state) => [...state.masterCategories].sort((a, b) => (a.sort > b.sort ? 1 : -1)),
    masterCategories: (state) => state.masterCategories,
    masterCategoriesById: (state) => {
      return state.masterCategories.reduce((partial, masterCategory) => {
        partial[masterCategory._id.slice(-ID_LENGTH.category)] = masterCategory
        return partial
      }, {})
    },
    // monthCategoryBudgets: (state) => state.monthCategoryBudgets,
    categories: (state) => state.categories,
    // categories: (state) => {
    //   return [UNCATEGORIZED, ...state.categories]
    // },
    categoriesById: (state) => {
      return state.categories.reduce((partial, category) => {
        partial[category._id.slice(-ID_LENGTH.category)] = category
        return partial
      }, {})
    },
    categoriesByMaster: (state) => _.groupBy(state.categories, 'masterCategory')
  },
  mutations: {
    REORDER_MASTER_CATEGORIES(state, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        this.dispatch('commitDocToPouchAndVuex', { current: master, previous: null })
      })
    },
    SET_ALL_CATEGORY_BALANCES(state, payload) {
      state.allCategoryBalances = payload
    },
    INIT_CATEGORY_BALANCES_MONTH(state, { month, categories, monthCategories }) {
      const month_balances = initCategoryBalancesMonth(state.allCategoryBalances, month, categories, monthCategories)
      Vue.set(state.allCategoryBalances, month, month_balances)
    },
    SET_MASTER_CATEGORIES(state, master_categories) {
      state.masterCategories = master_categories.sort((a, b) => a.sort - b.sort)
    },
    SET_CATEGORIES(state, categories) {
      state.categories = [UNCATEGORIZED, ...categories]
    },
    // UPDATE_MONTH_CATEGORY(state, doc) {
    //   const month = extractMonthCategoryMonth(doc._id)
    //   const category_id = doc._id.slice(-ID_LENGTH.category)

    //   if (state.monthCategoryBudgets[month] === undefined) {
    //     Vue.set(state.monthCategoryBudgets, month, {})
    //   }
    //   Vue.set(state.monthCategoryBudgets[month], category_id, doc)
    // },
    // SET_MONTH_CATEGORY_BUDGETS(state, month_category_budgets) {
    //   state.monthCategoryBudgets = month_category_budgets.reduce((partial, row) => {
    //     const row_id = row._id
    //     const category_id = row_id.slice(-ID_LENGTH.category)
    //     const month = extractMonthCategoryMonth(row_id)

    //     if (partial[month] === undefined) {
    //       partial[month] = {}
    //     }
    //     partial[month][category_id] = row
    //     return partial
    //   }, {})
    // },
    UPDATE_CATEGORY_BALANCES(state, { month, master_id, category_id, spent, doc }) {
      const previous_month_balances = state.allCategoryBalances[month]
      const month_balances = updateSingleCategory(previous_month_balances, master_id, category_id, {
        spent: spent,
        doc: doc
      })
      Vue.set(state.allCategoryBalances, month, month_balances)

      // If month is not the latest month, all subsequent months need to have their carryover updated
      let prev_balance = getCategoryBalance(state.allCategoryBalances, month, master_id, category_id)
      Object.keys(state.allCategoryBalances).map((current_month) => {
        if (this._vm.compareAscii(current_month, month) > 0) {
          const current_month_balances = updateSingleCategory(
            state.allCategoryBalances[current_month],
            master_id,
            category_id,
            { carryover: prev_balance }
          )
          Vue.set(state.allCategoryBalances, current_month, current_month_balances)
          prev_balance = getCategoryBalance(state.allCategoryBalances, current_month, master_id, category_id)
        }
      })
    },
    RESET_CATEGORY_STATE(state) {
      Object.entries(DEFAULT_CATEGORY_STATE).forEach(([key, value]) => {
        state[key] = value
      })
    }
  },
  actions: {
    createMasterCategory: async (context, { category_name, is_income = false, sort = 1 }) => {
      const prefix = `b_${context.rootState.selectedBudgetId}${ID_NAME.masterCategory}`
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
      const categoriesGroup = context.getters.categoriesByMaster[payload.master_category_id]

      const sort_length = categoriesGroup ? categoriesGroup.length : 0

      const prefix = `b_${context.rootState.selectedBudgetId}${ID_NAME.category}`
      const id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      const category = {
        _id: `b_${context.rootState.selectedBudgetId}${ID_NAME.category}${id}`,
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
    updateMonthCategory(context, { current, previous }) {
      return context
        .dispatch('commitDocToPouchAndVuex', { current, previous })
        .then((result) => {
          return result
        })
        .catch((error) => {
          console.log('updateMonthCategory error:', error)
        })
    },
    commitMonthCategoryToVuex(context, { current, previous }) {
      context
        .dispatch('calculateMonthCategoryBalanceUpdate', { current, previous })
        .then((category_balances_update) => {
          console.log('commitMonthCategoryToVuex')
          return this.commit('UPDATE_CATEGORY_BALANCES', category_balances_update)
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
        ...context.getters.categoriesByMaster[from_master_category_id][old_index],
        sort: new_index > old_index ? new_index + 0.5 : new_index - 0.5,
        masterCategory: to_master_category_id
      }

      //First, we update the subcategory to it's correct mastercategory
      context.dispatch('commitDocToPouchAndVuex', { current: item, previous: null }).then((result) => {
        let categoriesByMaster = JSON.parse(JSON.stringify(context.getters.categoriesByMaster))
        // Then iterate through them and re-set all their sort values
        for (const [key, masterArray] of Object.entries(categoriesByMaster)) {
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

    async calculateAllValues({ commit, dispatch, getters }) {
      console.log('CALCULATE ALL VALUES')

      let b_balances = {}
      return Promise.all([
        dispatch('fetchCategories'),
        dispatch('fetchMasterCategories'),
        dispatch('fetchMonthCategories')
      ])
        .then((results) => {
          const month_categories = results[2]
          month_categories.map((month_category) => {
            const month = extractMonthCategoryMonth(month_category._id)
            const category_id = month_category._id.slice(-ID_LENGTH.category)
            const master_id = getters.categoriesById[category_id]['masterCategory']

            if (b_balances[month] === undefined) {
              b_balances[month] = initCategoryBalancesMonth(
                b_balances,
                month,
                getters.categories,
                getters.monthCategories
              )
            }

            // TODO make it so that monthCategories come from one location
            // In fact, make it so that all derived categories aren't stored (or as much as possible)
            // Take heed from how accounts are done

            b_balances[month] = updateSingleCategory(b_balances[month], master_id, category_id, { doc: month_category })
          })
        })
        .then(() => {
          return dispatch('fetchAllTransactions')
        })
        .then((result) => {
          const t1 = performance.now()
          let a_balances = {}

          // console.log(result)
          result.rows.map((row) => {
            const account_id = row.doc.account
            const working = row.doc.value
            const month = row.doc.date.slice(0, 7)
            const category_id = row.doc.category
            const master_id = _.get(getters.categoriesById, [category_id, 'masterCategory'], 'null')
            const cleared = row.doc.cleared ? working : 0
            const uncleared = row.doc.cleared ? 0 : working

            _.defaultsDeep(a_balances, this._vm.defaultAccountBalance(account_id))
            this._vm.updateAccountBalances(a_balances, account_id, cleared, uncleared, working)

            if (b_balances[month] === undefined) {
              b_balances[month] = initCategoryBalancesMonth(
                b_balances,
                month,
                getters.categories,
                getters.monthCategoryBudgets
              )
            }

            b_balances[month] = updateSingleCategory(b_balances[month], master_id, category_id, { spent: working })
          })
          logPerformanceTime('calculateAllValues', t1)
          commit('SET_ALL_ACCOUNT_BALANCES', a_balances)
          commit('SET_ALL_CATEGORY_BALANCES', b_balances)
          console.log(a_balances)
          console.log(b_balances)
          return b_balances
        })
    },

    calculateCategoryBalanceUpdate({ commit, getters }, { current, previous }) {
      if (!current && !previous) {
        console.warn('calculateCategoryBalanceUpdate called with no current or previous data')
        return
      }
      const current_month = current ? current.date.slice(0, 7) : null
      const previous_month = previous ? previous.date.slice(0, 7) : null
      const current_master_id = current ? getters.categoriesById[current.category]['masterCategory'] : null
      const previous_master_id = previous ? getters.categoriesById[previous.category]['masterCategory'] : null
      const current_value = current ? current.value : 0
      const previous_value = previous ? previous.value : 0
      const value_difference = current_value - previous_value
      let isSameMonthCategory = true
      if (current && previous && (current_month !== previous_month || current_master_id !== previous_master_id)) {
        isSameMonthCategory = false
      }

      if (getters.allCategoryBalances[current_month] === undefined) {
        commit('INIT_CATEGORY_BALANCES_MONTH', {
          month: current_month,
          categories: getters.categories,
          monthCategories: getters.monthCategories,
          getters: getters
        })
      }

      if (getters.allCategoryBalances[current_month] === undefined) {
        console.warn(`Unable to init category balances month with: ${current_month}`)
        return
      }

      const transaction_payload = {
        month: current ? current_month : previous_month,
        master_id: current ? current_master_id : previous_master_id,
        category_id: current ? current.category : previous.category,
        spent: 0
      }

      let result = []

      if (isSameMonthCategory) {
        result.push({
          ...transaction_payload,
          spent: value_difference
        })
      } else {
        result.push({
          ...transaction_payload,
          spent: current_value
        })
        result.push({
          ...transaction_payload,
          month: previous_month,
          master_id: previous_master_id,
          category_id: previous.category,
          spent: -current.value
        })
      }
      return result
    },

    calculateMonthCategoryBalanceUpdate({ getters }, { current, previous }) {
      const month = current ? extractMonthCategoryMonth(current._id) : extractMonthCategoryMonth(previous._id)
      const category_id = current ? current._id.slice(-ID_LENGTH.category) : previous._id.slice(-ID_LENGTH.categroy)
      const master_id = getters.categoriesById[category_id]['masterCategory']

      return {
        month: month,
        master_id: master_id,
        category_id: category_id,
        spent: 0,
        doc: current ? current : null
      }
    }
  }
}

const initCategoryBalancesMonth = (current_balances, month, categories, monthCategoryBudgets) => {
  const used_months = Object.keys(current_balances).filter((used_month) => {
    return compareAscii(used_month, month) < 0
  })
  const num_months = used_months.length
  const prev_month = num_months > 0 ? used_months[num_months - 1] : null
  return categories.reduce((partial, category) => {
    const category_id = category._id !== null ? category._id.slice(-ID_LENGTH.category) : null
    const master_id = category.masterCategory
    // const category_budget = _.get(monthCategoryBudgets, [month, category_id, 'budget'], 0)
    let prev_balance = 0
    if (prev_month) {
      prev_balance = getCategoryBalance(current_balances, prev_month, master_id, category_id)
    }
    return updateSingleCategory(partial, master_id, category_id, {carryover: prev_balance})
  }, {})
}

const getCategoryBalance = (current_balances, month, master_id, category_id, default_carryover = 0) => {
  return (
    _.get(current_balances, [month, master_id, category_id, 'doc', 'budget'], 0) +
    _.get(current_balances, [month, master_id, category_id, 'spent'], 0) +
    _.get(current_balances, [month, master_id, category_id, 'carryover'], default_carryover)
  )
}

/**
 *
 * @param {Object} month_balances The existing month category object to update
 * @param {string} month The month
 * @param {string} master_id Truncated Master Category ID
 * @param {string} category_id Truncated Category ID
 * @param {number} spent The value in cents to update the category spent amount with
 * @param {number|null} carryover The value to overwrite the category carryover value with.
 * @param {object|null} doc The monthCategory document. Null if this is not being updated
 * Note: Use null for carryover if not intending to update this value
 */
const updateSingleCategory = (prev_month_balances, master_id, category_id, {spent, carryover, doc}) => {
  prev_month_balances = prev_month_balances === undefined ? {} : prev_month_balances

  const default_balance = defaultCategoryBalance(master_id, category_id)
  let month_balances = _.defaultsDeep(prev_month_balances, default_balance)

  let carryover_difference = 0
  if (carryover !== undefined) {
    carryover_difference = carryover - month_balances[master_id][category_id].carryover
  }

  if (typeof(doc) === 'object') {
    month_balances[master_id][category_id].doc = doc
  }

  month_balances[master_id][category_id].spent += spent === undefined ? 0 : spent
  month_balances[master_id][category_id].carryover += carryover_difference

  return month_balances
}

const defaultCategoryBalance = (master_id, category_id) => {
  return {
      [master_id]: {
        [category_id]: {
          doc: null,
          spent: 0,
          carryover: 0
        }
      }
  }
}

export { updateSingleCategory, defaultCategoryBalance, getCategoryBalance }
