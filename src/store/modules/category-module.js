import { logPerformanceTime, extractMonthCategoryMonth } from '../../helper'
import { ID_LENGTH, ID_NAME, NONE } from '../../constants'
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
    //   return [NONE, ...state.categories]
    // },
    categoriesById: (state) => {
      return state.categories.reduce((partial, category) => {
        partial[category._id.slice(-ID_LENGTH.category)] = category
        return partial
      }, {})
    },
    categoriesByMaster: (state) => {
      let groups = _.groupBy(state.categories, 'masterCategory')
      state.masterCategories.forEach((master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category)
        if(groups[master_id] === undefined) {
          groups[master_id] = [] 
        }
      })
      return groups
    }
  },
  mutations: {
    SET_ALL_CATEGORY_BALANCES(state, payload) {
      Vue.set(state, 'allCategoryBalances', payload)
    },
    INIT_CATEGORY_BALANCES_MONTH(state, { month, categories, monthCategories }) {
      const month_balances = initCategoryBalancesMonth(state.allCategoryBalances, month, categories, monthCategories)
      Vue.set(state.allCategoryBalances, month, month_balances)
    },
    SET_MASTER_CATEGORIES(state, master_categories) {
      const sorted_categories = master_categories.sort((a, b) => a.sort - b.sort)
      Vue.set(state, 'masterCategories', sorted_categories)
    },
    SET_CATEGORIES(state, categories) {
      Vue.set(state, categories, [NONE, ...categories])
    },
    UPDATE_CATEGORY_BALANCES(state, { account, month, master_id, category_id, spent, doc }) {
      let month_balances = initCategoryBalancesMonth(state.allCategoryBalances, month, state.categories)
      month_balances = updateSingleCategory(month_balances, master_id, category_id, {
        account: account,
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
        Vue.set(state, key, value)
      })
    }
  },
  actions: {
    createMasterCategory: async (context, { name, is_income, sort }) => {
      const payload = await context.dispatch('masterCategoryDocument', { name, is_income, sort })
      try {
        return context.dispatch('commitDocToPouchAndVuex', { current: payload, previous: null }).then(() => {
          return payload
        })
      } catch (error) {
        console.log(error)
        return null
      }
    },

    createCategory: async (context, { name, master_id }) => {
      const categoriesGroup = context.getters.categoriesByMaster[master_id]

      const sort_length = categoriesGroup ? categoriesGroup.length : 0
      const category = await context.dispatch('categoryDocument', {
        name: name,
        master_id: master_id,
        sort: sort_length
      })
      await context.dispatch('commitDocToPouchAndVuex', { current: category, previous: null })
      return category._id
    },

    masterCategoryDocument: async (context, { name, is_income, sort }) => {
      const prefix = `b_${context.rootState.selectedBudgetId}${ID_NAME.masterCategory}`
      const id = await context.dispatch('generateUniqueShortId', { prefix, sort })
      return {
        _id: prefix + id,
        name: name,
        sort: sort,
        collapsed: false,
        isIncome: is_income
      }
    },

    categoryDocument: async (context, { name, master_id, sort }) => {
      const prefix = `b_${context.rootState.selectedBudgetId}${ID_NAME.category}`
      const id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      return {
        _id: `b_${context.rootState.selectedBudgetId}${ID_NAME.category}${id}`,
        name: name,
        sort: sort,
        hidden: false,
        masterCategory: master_id
      }
    },
    reorderMasterCategories(context, master_categories) {
      const docs = master_categories.reduce((partial, master_category, i) => {
        const previous = _.get(context.getters.masterCategoriesById, [master_category.id], null)
        if (previous) {
          const current = { ...previous, sort: i }
          partial.push({ current, previous })
        }
        return partial
      }, [])

      // Temporarily set the master categories state for faster feedback while documents are sent
      // and retrieved from database
      console.log('DOCS', docs)
      context.commit(
        'SET_MASTER_CATEGORIES',
        docs.map((doc) => doc.current)
      )
      return context.dispatch('commitBulkDocsToPouchAndVuex', docs)
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

    reorderCategory(context, payload) {
      //Get the category that was moved
      const old_index = payload.oldIndex
      const new_index = payload.newIndex
      const master_id_from = payload.from.className
      const master_id_to = payload.to.className

      let updated_by_master = {}

      const temp_index = new_index > old_index ? new_index + 0.5 : new_index - 0.5
      updated_by_master[master_id_from] = context.getters.categoriesByMaster[master_id_from].map((category, i) => {
        const sort = i === old_index ? temp_index : i
        const master_id = sort === temp_index ? master_id_to : category.masterCategory
        return {
          ...category,
          masterCategory: master_id,
          sort: sort
        }
      })
      if (master_id_to !== master_id_from) {
        updated_by_master[master_id_to] = context.getters.categoriesByMaster[master_id_to].map((category, i) => {
          return {
            ...category,
            sort: i
          }
        })
        updated_by_master[master_id_to].push(updated_by_master[master_id_from][old_index])
        updated_by_master[master_id_from].splice(old_index, 1)
      }

      const updated_payload = Object.values(updated_by_master).reduce((partial, categories) => {
        categories.sort((a, b) => a.sort - b.sort)
        const updated_categories = categories.map((category, i) => {
          return {
            previous: context.getters.categoriesById[category._id.slice(-ID_LENGTH.category)],
            current: {
              ...category,
              sort: i
            }
          }
        })
        partial = partial.concat(updated_categories)
        return partial
      }, [])
      context.dispatch('commitBulkDocsToPouchAndVuex', updated_payload)
    },

    async initializeIncomeCategory(context) {
      console.log('Init base budget categories')
      const master_category_payload = {
        name: 'Income',
        is_income: true,
        sort: 0
      }
      return context.dispatch('createMasterCategory', master_category_payload).then((response) => {
        const payload = {
          name: 'Paycheck 1',
          master_id: response._id.slice(-ID_LENGTH.category)
        }
        return context.dispatch('createCategory', payload)
      })
    },

    /**
     * Initialize categories in a new budget
     */
    async initializeBudgetCategories(context) {
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
      const master_category_docs = await Promise.all(
        Object.keys(starter_categories).map((category_name, i) => {
          return context.dispatch('masterCategoryDocument', {
            name: category_name,
            is_income: false,
            sort: i
          })
        })
      )
      const category_docs = await Promise.all(
        master_category_docs.reduce((partial, master_category) => {
          const category_names = starter_categories[master_category.name]
          const master_id = master_category._id.slice(-ID_LENGTH.category)
          const categories = Promise.all(
            category_names.map((category_name, i) => {
              return context.dispatch('categoryDocument', {
                name: category_name,
                master_id: master_id,
                sort: i
              })
            })
          )
          partial = partial.concat(categories)
          return partial
        }, [])
      )
      return Promise.all([
        context.dispatch(
          'commitBulkDocsToPouchAndVuex',
          master_category_docs.map((doc) => {
            return { current: doc, previous: null }
          })
        ),
        context.dispatch(
          'commitBulkDocsToPouchAndVuex',
          category_docs.flat().map((doc) => {
            return { current: doc, previous: null }
          })
        )
      ])
    },

    calculateCategoryBalanceUpdate({ commit, getters }, { current, previous }) {
      if (!current && !previous) {
        console.warn('calculateCategoryBalanceUpdate called with no current or previous data')
        return
      }
      const account_id = current 
        ? current.account.slice(-ID_LENGTH.account) 
        : previous.account.slice(-ID_LENGTH.account)
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
        account: getters.accountsById[account_id],
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

const parseAllMonthCategories = (results, getters) => {
  let month_category_balances = {}
  const month_categories = results[2]
  month_categories.map((month_category) => {
    const month = extractMonthCategoryMonth(month_category._id)
    const category_id = month_category._id.slice(-ID_LENGTH.category)
    const master_id = getters.categoriesById[category_id]['masterCategory']

    month_category_balances[month] = updateSingleCategory(
      month_category_balances[month], master_id, category_id, { doc: month_category},
    )
  })
  return month_category_balances
}

const initCategoryBalancesMonth = (current_balances, month, categories) => {
  if(current_balances[month] !== undefined) {
    return current_balances[month]
  }

  const prev_month = prevUsedMonth(current_balances, month)
  return categories.reduce((partial, category) => {
    const category_id = category._id !== null ? category._id.slice(-ID_LENGTH.category) : null
    const master_id = category.masterCategory
    // const category_budget = _.get(monthCategoryBudgets, [month, category_id, 'budget'], 0)
    let prev_balance = 0
    if (prev_month) {
      prev_balance = getCategoryBalance(current_balances, prev_month, master_id, category_id)
    }
    return updateSingleCategory(partial, master_id, category_id, { carryover: prev_balance })
  }, {})
}

const prevUsedMonth = (current_balances, month) => {
  let prev_month = '0000-00'
  Object.keys(current_balances).forEach((current_month) => {
    if (compareAscii(current_month, month) < 0 && compareAscii(prev_month, current_month) < 0) {
      prev_month = current_month
    }
  })
  if (prev_month !== '0000-00') {
    return prev_month
  } else {
    return null
  }
}

const getCarryover = (current_balances, month, master_id, category_id) => {
  const carryover = _.get(current_balances, [month, master_id, category_id, ['carryover']], null)
  if (carryover !== null) {
    return carryover
  }
  const prev_month = prevUsedMonth(current_balances, month)
  return getCategoryBalance(current_balances, prev_month, master_id, category_id)
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
const updateSingleCategory = (
  existing_month_balances, master_id, category_id, { spent, carryover, doc, account }
) => {
  let month_balances = existing_month_balances === undefined ? {} : existing_month_balances
  const sign = account ? account.sign : 1
  // const sign = 1
  // spent *= sign

  const default_balance = defaultCategoryBalance(master_id, category_id)
  month_balances = _.defaultsDeep(month_balances, default_balance)

  let carryover_difference = 0
  if (carryover !== undefined) {
    carryover_difference = carryover - month_balances[master_id][category_id].carryover
  }

  if (typeof doc === 'object') {
    month_balances[master_id][category_id].doc = doc
  }

  month_balances[master_id][category_id].spent += spent === undefined ? 0 : spent * sign
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

export {
  initCategoryBalancesMonth,
  updateSingleCategory,
  defaultCategoryBalance,
  getCategoryBalance,
  prevUsedMonth,
  getCarryover,
  parseAllMonthCategories
}
