import Vue from 'vue'
import _, { isArray } from 'lodash'
import { extractMonthCategoryMonth, hslToHex } from '../../helper'
import {
  DEFAULT_MONTH_BALANCE,
  ID_LENGTH,
  ID_NAME,
  NONE,
  INCOME,
  HIDDEN,
  DEFAULT_CATEGORY_BALANCE
} from '../../constants'
import { compareAscii } from './id-module'

const DEFAULT_CATEGORY_STATE = {
  allCategoryBalances: {},
  masterCategories: [],
  masterHiddenCategory: JSON.parse(JSON.stringify(HIDDEN)),
  masterIncomeCategory: JSON.parse(JSON.stringify(INCOME)),
  categories: [],
  monthBalances: {}
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
      return [state.masterIncomeCategory, ...state.masterCategories, state.masterHiddenCategory, { ...NONE }]
    },
    masterCategoriesById: (state, getters) => {
      return getters.masterCategories.reduce((partial, masterCategory) => {
        partial[masterCategory._id.slice(-ID_LENGTH.category)] = masterCategory
        return partial
      }, {})
    },
    masterHiddenCategory: (state) => state.masterHiddenCategory,
    masterIncomeCategory: (state) => state.masterIncomeCategory,
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
      Object.keys(result).forEach((master_id) => {
        result[master_id].sort((a, b) => a.sort - b.sort)
      })
      return result
    },
    categoryColors: (state, getters) => {
      const income_base_category = getters.categoriesById[INCOME._id]
      const color_categories = income_base_category
        ? getters.masterCategories.concat(income_base_category)
        : getters.masterCategories
      return color_categories.reduce((partial, color_category) => {
        const master_id = color_category._id.slice(-ID_LENGTH.category)
        const categories = getters.categoriesByMaster[master_id]
        if (categories.length === 0 || color_category.color === undefined) {
          return partial
        }
        const h = color_category.color.hsla.h
        const s = color_category.color.hsla.s
        const l = color_category.color.hsla.l
        const l_min = 0.2
        const l_max = 0.6
        const l_step = (l_max - l_min) / categories.length
        let l_current = l_max
        categories.forEach((category) => {
          const category_id = category._id.slice(-ID_LENGTH.category)
          const color = hslToHex(h, s * 100, l_current * 100)
          partial[category_id] = color
          l_current -= l_step
        })
        return partial
      }, {})
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
    },
    colorSwatches: () => {
      const rows = 4
      const cols = 6
      const saturation = 0.7
      const lightness = 0.5
      const step = 360 / (rows * cols)
      let colors = []
      for (const i of Array(rows).keys()) {
        let color_row = []
        for (const j of Array(cols).keys()) {
          const index = i * cols + j
          const hue = index * step
          const hex = hslToHex(hue, saturation * 100, lightness * 100)
          color_row.push({
            alpha: 1,
            hex,
            hexa: hex + 'ff',
            hsla: {
              h: hue,
              s: saturation,
              l: lightness,
              a: 1
            },
            hue
          })
        }
        colors.push(color_row)
      }
      return colors
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
    SET_MASTER_CATEGORY_COLOR(state, { masterId, colorObject }) {
      const index = state.masterCategories.findIndex((master) => master._id === masterId)
      if (index > -1) {
        Vue.set(state.masterCategories[index], 'color', colorObject)
      }
    },
    SET_HIDDEN_COLLAPSED(state, value) {
      Vue.set(state.masterHiddenCategory, 'collapsed', value)
    },
    SET_INCOME_COLLAPSED(state, value) {
      Vue.set(state.masterIncomeCategory, 'collapsed', value)
    },
    SET_CATEGORIES(state, categories) {
      Vue.set(state, 'categories', categories)
    },
    UPDATE_CATEGORY_BALANCES(state, { account, month, category_id, amount, doc }) {
      if (account && !account.onBudget) {
        return
      }
      let month_balances = initCategoryBalancesMonth(state.allCategoryBalances, month, state.categories)
      month_balances = updateSingleCategory(month_balances, category_id, {
        account: account,
        amount: amount,
        doc: doc
      })
      Vue.set(state.allCategoryBalances, month, {}) // Trigger reactive update
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
      let expense = _.get(monthBalancesItem, 'expense', 0)
      let income = _.get(monthBalancesItem, 'income', 0)

      if (monthBalancesItem.category_id && monthBalancesItem.amount) {
        if (monthBalancesItem.master_id === INCOME._id) {
          income = monthBalancesItem.amount
        } else {
          expense = monthBalancesItem.amount
        }
      }

      const previous = _.defaultsDeep(state.monthBalances[monthBalancesItem.month], DEFAULT_MONTH_BALANCE)
      const current = {
        income: previous.income + income,
        expense: previous.expense + expense,
        budgeted: previous.budgeted + _.get(monthBalancesItem, 'budgeted', 0)
      }
      Vue.set(state.monthBalances, monthBalancesItem.month, current)
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

    initMasterCategories: async ({ state, getters, dispatch }) => {
      await dispatch('fetchMasterCategories')
      const docs = state.masterCategories.reduce((partial, master_category) => {
        if (master_category.color === undefined || typeof master_category.color !== 'object') {
          const color = getRandomColor(getters.colorSwatches)
          partial.push({
            current: { ...master_category, color: color },
            previous: master_category
          })
        }
        return partial
      }, [])
      if (docs.length > 0) {
        dispatch('commitBulkDocsToPouchAndVuex', docs)
      }
    },
    initCategories: async ({ dispatch, rootState, getters }) => {
      const categories = await dispatch('fetchCategories')
      if (categories.length === 0) {
        return
      }
      const baseIncomeIndex = categories.findIndex((category) => category._id.slice(-ID_LENGTH.category) === INCOME._id)
      if (baseIncomeIndex === -1) {
        const color = getRandomColor(getters.colorSwatches)
        const baseIncomeCategory = {
          _id: `b_${rootState.selectedBudgetId}${ID_NAME.category}${INCOME._id}`,
          name: INCOME.name,
          sort: 0,
          hidden: false,
          masterCategory: INCOME._id,
          color: color
        }
        dispatch('commitDocToPouchAndVuex', { current: baseIncomeCategory, previous: null })
      } else if (
        categories[baseIncomeIndex].color === undefined ||
        typeof categories[baseIncomeIndex].color !== 'object'
      ) {
        const color = getRandomColor(getters.colorSwatches)
        dispatch('commitDocToPouchAndVuex', {
          current: { ...categories[baseIncomeIndex], color: color },
          previous: categories[baseIncomeIndex]
        })
      }
    },
    updateMasterColor({ getters, dispatch }, { masterId, colorObject }) {
      const master_category = getters.masterCategoriesById[masterId]
      if (
        (master_category && !master_category.color) ||
        !master_category.color.hex ||
        master_category.color.hex !== colorObject.hex
      ) {
        const new_master_category = {
          ...master_category,
          color: colorObject
        }
        dispatch('commitDocToPouchAndVuex', { current: new_master_category, previous: master_category })
      }
    },
    updateIncomeColor({ getters, dispatch }, colorObject) {
      const previous = getters.categoriesById[INCOME._id]
      if (previous && previous.color && previous.color.hex !== colorObject.hex) {
        const new_category = {
          ...getters.categoriesById[INCOME._id],
          color: colorObject
        }
        dispatch('commitDocToPouchAndVuex', { current: new_category, previous })
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
      // return category._id.slice(-ID_LENGTH.category)
      return category
    },

    masterCategoryDocument: async ({ rootState, getters, dispatch }, { name, sort }) => {
      const prefix = `b_${rootState.selectedBudgetId}${ID_NAME.masterCategory}`
      const id = await dispatch('generateUniqueShortId', { prefix, sort })
      const color = getRandomColor(getters.colorSwatches)
      return {
        _id: prefix + id,
        name,
        sort,
        color,
        collapsed: false
      }
    },

    categoryDocument: async (context, { name, master_id, sort, input_id }) => {
      const prefix = `b_${context.rootState.selectedBudgetId}${ID_NAME.category}`
      // const id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      const id = input_id
        ? input_id.slice(-ID_LENGTH.category)
        : await context.dispatch('generateUniqueShortId', { prefix: prefix })

      // if (!id) {
      //   id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      // }
      return {
        _id: `b_${context.rootState.selectedBudgetId}${ID_NAME.category}${id}`,
        name: name,
        sort: sort,
        hidden: false,
        masterCategory: master_id
      }
    },
    reorderMasterCategories({ getters, dispatch, commit }, master_categories) {
      let tempUpdatedMasterCategories = []
      const docs = master_categories.reduce((partial, master_category, i) => {
        const previous = _.get(getters.masterCategoriesById, [master_category._id], null)
        if (previous) {
          const current = { ...previous, sort: i }
          partial.push({ current, previous })
          tempUpdatedMasterCategories.push(current)
        }
        return partial
      }, [])

      // Temporarily set the master categories state for faster feedback while documents are sent
      // and retrieved from database
      commit('SET_MASTER_CATEGORIES', tempUpdatedMasterCategories)

      return dispatch('commitBulkDocsToPouchAndVuex', docs)
    },

    updateCategory(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', { current: payload, previous: null })
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
              masterCategory: HIDDEN.masterCategory
            },
            previous: category
          }
        })
        context.dispatch('commitBulkDocsToPouchAndVuex', bulk_categories)
        const master_category = context.getters.masterCategoriesById[master_id]
        context.dispatch('commitDocToPouchAndVuex', { current: null, previous: master_category })
      }
    },
    setMasterCategoriesCollapsed({ getters, dispatch }, expanded_indices) {
      // Set hidden category
      if (expanded_indices.includes(getters.masterCategories.length)) {
        if (getters.masterHiddenCategory.collapsed) {
          commit('SET_HIDDEN_COLLAPSED', false)
        }
      } else {
        if (!getters.masterHiddenCategory.collapsed) {
          commit('SET_HIDDEN_COLLAPSED', true)
        }
      }

      // Set income category
      if (expanded_indices.includes(0)) {
        if (getters.masterIncomeCategory.collapsed) {
          commit('SET_INCOME_COLLAPSED', false)
        }
      } else {
        if (!getters.masterIncomeCategory.collapsed) {
          commit('SET_INCOME_COLLAPSED', true)
        }
      }
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
    setHiddenCollapsed({ commit }, expanded_indices) {
      commit('SET_HIDDEN_COLLAPSED', expanded_indices.length == 0)
    },
    toggleMasterCategoryCollapsed({ getters, dispatch, commit }, master_id) {
      const master_category = getters.masterCategoriesById[master_id]
      if (!master_category) {
        return
      }
      if (master_id === HIDDEN._id) {
        commit('SET_HIDDEN_COLLAPSED', !master_category.collapsed)
      } else if (master_id === INCOME._id) {
        commit('SET_INCOME_COLLAPSED', !master_category.collapsed)
      } else {
        dispatch('commitDocToPouchAndVuex', {
          current: { ...master_category, collapsed: !master_category.collapsed },
          previous: master_category
        })
      }
    },

    /**
     * Initialize categories in a new budget
     */
    async initializeBudgetCategories(context, { masterCategories, categories }) {
      const master_category_docs = await Promise.all(
        masterCategories.map((category_name, i) => {
          return context.dispatch('masterCategoryDocument', {
            name: category_name,
            is_income: false,
            sort: i
          })
        })
      )
      const category_docs = await Promise.all(
        master_category_docs.reduce((partial, master_category) => {
          const category_names = categories[master_category.name]
          const master_id = master_category._id.slice(-ID_LENGTH.category)
          const resultCategories = Promise.all(
            category_names.map((category_name, i) => {
              return context.dispatch('categoryDocument', {
                name: category_name,
                master_id: master_id,
                sort: i
              })
            })
          )
          partial = partial.concat(resultCategories)
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

      if (current_month !== null) {
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
      }

      let category_balances = []
      if (current) {
        if (current.splits && isArray(current.splits) && current.splits.length > 0) {
          const this_result = current.splits.map((split) => {
            const master = getters.masterCategoriesByCategoryId[split.category]
            const master_id = master._id.slice(-ID_LENGTH.category)
            return {
              account: account,
              month: current_month,
              category_id: split.category,
              master_id: master_id,
              amount: split.value
            }
          })
          category_balances = category_balances.concat(this_result)
        } else {
          const master = getters.masterCategoriesByCategoryId[current.category]
          const master_id = master._id.slice(-ID_LENGTH.category)
          category_balances.push({
            account: account,
            month: current_month,
            category_id: current.category,
            master_id: master_id,
            amount: current_value
          })
        }
      }
      if (previous) {
        if (previous.splits && isArray(previous.splits) && previous.splits.length > 0) {
          const this_result = previous.splits.map((split) => {
            const master = getters.masterCategoriesByCategoryId[split.category]
            const master_id = master._id.slice(-ID_LENGTH.category)
            return {
              account: account,
              month: previous_month,
              category_id: split.category,
              master_id: master_id,
              amount: -split.value
            }
          })
          category_balances = category_balances.concat(this_result)
        } else {
          const master = getters.masterCategoriesByCategoryId[previous.category]
          const master_id = master._id.slice(-ID_LENGTH.category)
          category_balances.push({
            account: account,
            month: previous_month,
            category_id: previous.category,
            master_id: master_id,
            amount: -previous_value
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
        amount: 0,
        doc: current ? current : null
      }
    },
    setMonthBudgetedBalances({ commit, getters }, monthCategoryBalances) {
      Object.entries(monthCategoryBalances).forEach(([month, categoryBalances]) => {
        const budgeted = Object.values(categoryBalances).reduce((total, categoryBalance) => {
          const category_id = categoryBalance.doc._id.slice(-ID_LENGTH.category)
          const master_id = _.get(getters.categoriesById, [category_id, 'masterCategory'], null)
          if (master_id !== null && master_id !== INCOME._id) {
            return total + categoryBalance.doc.budget
          } else {
            return total
          }
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
    const category_id = month_category._id.slice(-ID_LENGTH.category)
    const month = extractMonthCategoryMonth(month_category._id)
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
    _.get(current_balances, [month, category_id, 'income'], 0) -
    _.get(current_balances, [month, category_id, 'expense'], 0) +
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
const updateSingleCategory = (existing_month_balances, category_id, { amount, carryover, doc, account }) => {
  if (account && !account.onBudget) {
    return existing_month_balances
  }
  let month_balances = existing_month_balances === undefined ? {} : existing_month_balances
  const sign = account ? account.sign : 1

  month_balances = _.defaultsDeep(month_balances, { [category_id]: DEFAULT_CATEGORY_BALANCE })

  let carryover_difference = 0
  if (carryover !== undefined) {
    carryover_difference = carryover - month_balances[category_id].carryover
  }

  if (typeof doc === 'object') {
    month_balances[category_id].doc = doc
  }

  if (typeof amount === 'number') {
    amount *= sign
    if (amount < 0) {
      month_balances[category_id].expense += -1 * amount
    } else {
      month_balances[category_id].income += amount
    }
  }

  month_balances[category_id].carryover += carryover_difference
  return month_balances
}

const updateMonthBalances = (month_balances, master_id, account, month, amount) => {
  if (!account.onBudget) {
    return
  }
  let updated_balances = { ...month_balances[month] }
  const final_amount = (amount *= account.sign)
  if (master_id === INCOME._id) {
    updated_balances.income += final_amount
  } else {
    updated_balances.expense += final_amount * -1
  }
  Vue.set(month_balances, month, updated_balances)
}
const getRandomColor = (colorSwatches) => {
  if (!Array.isArray(colorSwatches)) {
    throw new Error(`Color swatches must be an array, got: ${colorSwatches}`)
  }
  const colors = colorSwatches.flat()
  // generate random integer
  const random_index = Math.floor(Math.random() * colors.length)
  return colors[random_index]
}

export {
  initCategoryBalancesMonth,
  updateSingleCategory,
  getCategoryBalance,
  prevUsedMonth,
  getCarryover,
  parseAllMonthCategories,
  updateMonthBalances
}
