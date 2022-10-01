import { logPerformanceTime, extractMonthCategoryMonth } from '../../helper'
import { DEFAULT_MONTH_BALANCE, ID_LENGTH, ID_NAME, NONE, HIDDEN } from '../../constants'
import { compareAscii } from './id-module'
import _, { isArray, split } from 'lodash'
import Vue from 'vue'

const DEFAULT_CATEGORY_STATE = {
  allCategoryBalances: {},
  // monthCategoryBudgets: [],
  masterCategories: [],
  masterHiddenCategory: JSON.parse(JSON.stringify(HIDDEN)),
  categories: [],
  monthBalances: {},

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
    masterCategories: (state) => {
      return [...state.masterCategories, state.masterHiddenCategory, {...NONE}]
    },
    masterCategoriesById: (state, getters) => {
      return getters.masterCategories.reduce((partial, masterCategory) => {
        partial[masterCategory._id.slice(-ID_LENGTH.category)] = masterCategory
        return partial
      }, {})
    },
    categories: (state) => {
      return [...state.categories, { ...NONE }]
    },
    categoriesById: (state, getters) => {
      return getters.categories.reduce((partial, category) => {
        partial[category._id.slice(-ID_LENGTH.category)] = category
        return partial
      }, {})
    },
    categoriesByMaster: (state, getters) => {
      let initial = getters.masterCategories.reduce((partial, master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category)
        partial[master_id] = []
        return partial
      }, {})
      initial[NONE._id] = [{ ...NONE }]

      const result = getters.categories.reduce((partial, category) => {
        if (category._id.slice(-ID_LENGTH.category) === NONE._id) {
          return partial
        }
        if (category.hidden || [HIDDEN._id, NONE._id].includes(category.masterCategory)) {
          _.defaults(partial, { [HIDDEN._id]: [] })
          partial[HIDDEN._id].push(category)
        } else {
          _.defaults(partial, { [category.masterCategory]: [] })
          partial[category.masterCategory].push(category)
        }
        return partial
      }, initial)
      return result
    },
    masterCategoriesByCategoryId: (state, getters) => {
      return Object.entries(getters.categoriesByMaster).reduce((partial, [master_id, categories]) => {
        categories.forEach((category) => {
          partial[category._id.slice(-ID_LENGTH.category)] = getters.masterCategoriesById[master_id]
        })
        return partial
      }, {})
    },
    monthBalances: (state) => {
      let monthBalances = JSON.parse(JSON.stringify(state.monthBalances))

      if (Object.keys(monthBalances).length < 1) {
        return {}
      }

      const sortedMonths = Object.keys(monthBalances).sort((a, b) => {
        return compareAscii(a, b)
      })

      const previousMonthBalance = monthBalances[sortedMonths[0]]
      let previousMonthAvailable = previousMonthBalance.income - previousMonthBalance.budgeted

      monthBalances[sortedMonths[0]].available = previousMonthAvailable

      for (let month of sortedMonths.slice(1, sortedMonths.length)) {
        const currentMonthAvailable =
          previousMonthAvailable + monthBalances[month].income - monthBalances[month].budgeted
        monthBalances[month].available = currentMonthAvailable
        previousMonthAvailable = currentMonthAvailable
      }
      return monthBalances
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
    SET_HIDDEN_COLLAPSED(state, value) {
      Vue.set(state.masterHiddenCategory, 'collapsed', value)
    },
    SET_CATEGORIES(state, categories) {
      Vue.set(state, 'categories', categories)
    },
    UPDATE_CATEGORY_BALANCES(state, { account, month, category_id, spent, doc }) {
      let month_balances = initCategoryBalancesMonth(state.allCategoryBalances, month, state.categories)
      month_balances = updateSingleCategory(month_balances, category_id, {
        account: account,
        spent: spent,
        doc: doc
      })
      Vue.set(state.allCategoryBalances, month, month_balances)

      // If month is not the latest month, all subsequent months need to have their carryover updated
      let prev_balance = getCategoryBalance(state.allCategoryBalances, month, category_id)
      Object.keys(state.allCategoryBalances).forEach((current_month) => {
        if (this._vm.compareAscii(current_month, month) > 0) {
          const current_month_balances = updateSingleCategory(state.allCategoryBalances[current_month], category_id, {
            carryover: prev_balance
          })
          Vue.set(state.allCategoryBalances, current_month, current_month_balances)
          prev_balance = getCategoryBalance(state.allCategoryBalances, current_month, category_id)
        }
      })
    },
    RESET_CATEGORY_STATE(state) {
      Object.entries(DEFAULT_CATEGORY_STATE).forEach(([key, value]) => {
        Vue.set(state, key, value)
      })
    },
    SET_MONTH_BALANCES(state, monthBalances) {
      Vue.set(state, 'monthBalances', monthBalances)
    },
    SET_MONTH_BALANCES_ATTRIBUTE(state, monthBalancesItem) {
      const existing = _.defaultsDeep(state.monthBalances[monthBalancesItem.month], DEFAULT_MONTH_BALANCE)
      Vue.set(state.monthBalances, monthBalancesItem.month, {
        income: _.get(monthBalancesItem, 'income', existing.income),
        expense: _.get(monthBalancesItem, 'expense', existing.expense),
        budgeted: _.get(monthBalancesItem, 'budgeted', existing.budgeted)
      })
    },
    UPDATE_MONTH_BALANCES(state, monthBalancesItem) {
      const existing = _.defaultsDeep(state.monthBalances[monthBalancesItem.month], DEFAULT_MONTH_BALANCE)
      Vue.set(state.monthBalances, monthBalancesItem.month, {
        income: existing.income + _.get(monthBalancesItem, 'income', 0),
        expense: existing.expense + _.get(monthBalancesItem, 'expense', 0),
        budgeted: existing.budgeted + _.get(monthBalancesItem, 'budgeted', 0)
      })
    }
  },
  actions: {
    createMasterCategory: async (context, { name, is_income, sort }) => {
      const master_category = await context.dispatch('masterCategoryDocument', { name, is_income, sort })
      try {
        return context.dispatch('commitDocToPouchAndVuex', { current: master_category, previous: null }).then(() => {
          return master_category._id.slice(-ID_LENGTH.category)
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
      return category._id.slice(-ID_LENGTH.category)
    },

    masterCategoryDocument: async (context, { name, sort }) => {
      const prefix = `b_${context.rootState.selectedBudgetId}${ID_NAME.masterCategory}`
      const id = await context.dispatch('generateUniqueShortId', { prefix, sort })
      return {
        _id: prefix + id,
        name: name,
        sort: sort,
        collapsed: false
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
          return this.commit('UPDATE_CATEGORY_BALANCES', category_balances_update)
        })
      context.dispatch('updateMonthBalancesBudgeted', { current, previous })
    },

    deleteMasterCategory(context, master_id) {
      const categories = context.getters.categoriesByMaster[master_id]
      if (categories !== undefined) {
        const bulk_categories = categories.map((category) => {
          return {
            current: {
              ...category,
              masterCategory: NONE.masterCategory
            },
            previous: category
          }
        })
        context.dispatch('commitBulkDocsToPouchAndVuex', bulk_categories)
        const master_category = context.getters.masterCategoriesById[master_id]
        context.dispatch('commitDocToPouchAndVuex', { current: null, previous: master_category })
      }
    },
    setMasterCategoriesExpanded({ getters, dispatch }, expanded_indices) {
      const docs = getters.masterCategories.reduce((partial, master_category, i) => {
        if (expanded_indices.includes(i)) {
          if (master_category.collapsed) {
            partial.push({ current: { ...master_category, collapsed: false }, previous: master_category })
          }
        } else {
          if (!master_category.collapsed) {
            partial.push({ current: { ...master_category, collapsed: true }, previous: master_category })
          }
        }
        return partial
      }, [])
      dispatch('commitBulkDocsToPouchAndVuex', docs)
    },
    toggleMasterCategoryCollapsed({ getters, dispatch, commit }, master_id) {
      const master_category = getters.masterCategoriesById[master_id]
      if (!master_category) {
        return
      }
      if (master_id === HIDDEN._id) {
        commit('SET_HIDDEN_COLLAPSED', !master_category.collapsed)
      } else {
        dispatch('commitDocToPouchAndVuex', {
          current: { ...master_category, collapsed: !master_category.collapsed },
          previous: master_category
        })
      }
    },

    reorderCategory(context, payload) {
      //Get the category that was moved
      const old_index = payload.oldIndex
      const new_index = payload.newIndex
      const master_id_from = payload.from.id.slice(-ID_LENGTH.category)
      const master_id_to = payload.to.id.slice(-ID_LENGTH.category)

      let updated_by_master = {}
      // TOTO: Old index won't be relevant if different master id
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

    // calculateMonthBalancesUpdate({ commit, getters}, {current, previous}) {

    // },

    updateCategoryBalance({ commit, getters }, { current, previous }) {
      if (!current && !previous) {
        console.warn('calculateCategoryBalanceUpdate called with no current or previous data')
        return
      }
      const account_id = current
        ? current.account.slice(-ID_LENGTH.account)
        : previous.account.slice(-ID_LENGTH.account)
      const current_month = current ? current.date.slice(0, 7) : null
      const previous_month = previous ? previous.date.slice(0, 7) : null
      const account = getters.accountsById[account_id]
      const current_value = current ? current.value : 0
      const previous_value = previous ? previous.value : 0

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

      let category_balances = []
      if (current) {
        if (current.splits && isArray(current.splits) && current.splits.length > 0) {
          const this_result = current.splits.map((split) => {
            return {
              account: account,
              month: current_month,
              category_id: split.category,
              spent: split.value,
              income: split.value > 0 ? split.value : 0,
              expense: split.value < 0 ? split.value : 0
            }
          })
          category_balances = category_balances.concat(this_result)
        } else {
          category_balances.push({
            account: account,
            month: current_month,
            category_id: current.category,
            spent: current_value,
            income: current_value > 0 ? current_value : 0,
            expense: current_value < 0 ? current_value : 0
          })
        }
      }
      if (previous) {
        if (previous.splits && isArray(previous.splits) && previous.splits.length > 0) {
          const this_result = previous.splits.map((split) => {
            return {
              account: account,
              month: previous_month,
              category_id: split.category,
              spent: -split.value,
              income: split.value > 0 ? -split.value : 0,
              expense: split.value < 0 ? -split.value : 0
            }
          })
          category_balances = category_balances.concat(this_result)
        } else {
          category_balances.push({
            account: account,
            month: previous_month,
            category_id: previous.category,
            spent: -previous_value,
            income: previous_value > 0 ? -previous_value : 0,
            expense: previous_value < 0 ? -previous_value : 0
          })
        }
      }
      category_balances.map((category_balance) => {
        this.commit('UPDATE_CATEGORY_BALANCES', category_balance)
        this.commit('UPDATE_MONTH_BALANCES', category_balance)
      })
      return category_balances
    },

    updateMonthBalancesBudgeted({ commit }, { current, previous }) {
      console.log('updateMonthBalancesBudgeted', current, previous)
      const month = current ? extractMonthCategoryMonth(current._id) : extractMonthCategoryMonth(previous._id)
      let monthBalanceUpdates = []
      if (current) {
        monthBalanceUpdates.push({
          month: month,
          budgeted: current.budget
        })
      }
      if (previous) {
        monthBalanceUpdates.push({
          month: month,
          budgeted: -previous.budget
        })
      }
      monthBalanceUpdates.map((monthBalanceUpdate) => {
        commit('UPDATE_MONTH_BALANCES', monthBalanceUpdate)
      })
    },

    calculateMonthCategoryBalanceUpdate({ getters }, { current, previous }) {
      const month = current ? extractMonthCategoryMonth(current._id) : extractMonthCategoryMonth(previous._id)
      const category_id = current ? current._id.slice(-ID_LENGTH.category) : previous._id.slice(-ID_LENGTH.category)
      const master_id = getters.categoriesById[category_id]['masterCategory']

      return {
        month: month,
        master_id: master_id,
        category_id: category_id,
        spent: 0,
        doc: current ? current : null
      }
    },
    setMonthBudgetedBalances({ commit }, monthCategoryBalances) {
      // monthBalances = JSON.parse(JSON.stringify(getters.monthBalances))
      Object.entries(monthCategoryBalances).forEach(([month, categoryBalances]) => {
        const budgeted = Object.values(categoryBalances).reduce((total, categoryBalance) => {
          return total + categoryBalance.doc.budget
        }, 0)
        commit('SET_MONTH_BALANCES_ATTRIBUTE', { month: month, budgeted: budgeted })
      })
    },
    setMonthIncomeExpenseBalances({ commit }, monthCategoryBalances) {
      // monthBalances = JSON.parse(JSON.stringify(getters.monthBalances))
      Object.entries(monthCategoryBalances).forEach(([month, categoryBalances]) => {
        commit('SET_MONTH_BALANCES_ATTRIBUTE', {
          month: month,
          income: categoryBalances.income,
          expense: categoryBalances.expense
        })
      })
    }
  }
}

const parseAllMonthCategories = (results, getters) => {
  let month_category_balances = {}
  const month_categories = results[2]
  month_categories.map((month_category) => {
    const month = extractMonthCategoryMonth(month_category._id)
    const category_id = month_category._id.slice(-ID_LENGTH.category)
    // const master_id = getters.categoriesById[category_id]['masterCategory']

    month_category_balances[month] = updateSingleCategory(month_category_balances[month], category_id, {
      doc: month_category
    })
  })
  return month_category_balances
}

const initCategoryBalancesMonth = (current_balances, month, categories) => {
  if (current_balances[month] !== undefined) {
    return current_balances[month]
  }

  const prev_month = prevUsedMonth(current_balances, month)
  return categories.reduce((partial, category) => {
    const category_id = category._id !== null ? category._id.slice(-ID_LENGTH.category) : null
    let prev_balance = 0
    if (prev_month) {
      prev_balance = getCategoryBalance(current_balances, prev_month, category_id)
    }
    return updateSingleCategory(partial, category_id, { carryover: prev_balance })
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

const getCarryover = (current_balances, month, category_id) => {
  const carryover = _.get(current_balances, [month, category_id, ['carryover']], null)
  if (carryover !== null) {
    return carryover
  }
  const prev_month = prevUsedMonth(current_balances, month)
  return getCategoryBalance(current_balances, prev_month, category_id)
}

const getCategoryBalance = (current_balances, month, category_id, default_carryover = 0) => {
  return (
    _.get(current_balances, [month, category_id, 'doc', 'budget'], 0) +
    _.get(current_balances, [month, category_id, 'spent'], 0) +
    _.get(current_balances, [month, category_id, 'carryover'], default_carryover)
  )
}

/**
 *
 * @param {Object} month_balances The existing month category object to update
 * @param {string} month The month
 * @param {string} category_id Truncated Category ID
 * @param {number} spent The value in cents to update the category spent amount with
 * @param {number|null} carryover The value to overwrite the category carryover value with.
 * @param {object|null} doc The monthCategory document. Null if this is not being updated
 * Note: Use null for carryover if not intending to update this value
 */
const updateSingleCategory = (existing_month_balances, category_id, { spent, carryover, doc, account }) => {
  let month_balances = existing_month_balances === undefined ? {} : existing_month_balances
  const sign = account ? account.sign : 1
  // const sign = 1
  // spent *= sign

  const default_balance = defaultCategoryBalance(category_id)
  month_balances = _.defaultsDeep(month_balances, default_balance)

  let carryover_difference = 0
  if (carryover !== undefined) {
    carryover_difference = carryover - month_balances[category_id].carryover
  }

  if (typeof doc === 'object') {
    month_balances[category_id].doc = doc
  }

  month_balances[category_id].spent += spent === undefined ? 0 : spent * sign
  month_balances[category_id].carryover += carryover_difference

  return month_balances
}

const defaultCategoryBalance = (category_id) => {
  return {
    [category_id]: {
      doc: null,
      spent: 0,
      carryover: 0
    }
  }
}

const updateMonthBalances = (month_balances, account, month, amount) => {
  let updated_balances = { ...month_balances[month] }
  const final_amount = (amount *= account.sign)
  if (final_amount > 0) {
    updated_balances.income += final_amount
  } else {
    updated_balances.expense += final_amount * -1
  }
  Vue.set(month_balances, month, updated_balances)
}

export {
  initCategoryBalancesMonth,
  updateSingleCategory,
  defaultCategoryBalance,
  getCategoryBalance,
  prevUsedMonth,
  getCarryover,
  parseAllMonthCategories,
  updateMonthBalances
}
