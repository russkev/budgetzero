import Vue from 'vue'
import {
  DEFAULT_MONTH_CATEGORY,
  ID_LENGTH,
  ID_NAME,
  NONE,
  HIDDEN,
  INCOME,
  DEFAULT_MASTER_CATEGORY_BALANCE
} from '../../constants'
import { getCarryover } from '@/store/modules/category-module'
import _ from 'lodash'
import moment from 'moment'
import { prevMonth, nextMonth } from '../../helper'
import { compareAscii } from '../../store/modules/id-module'

const DEFAULT_MONTH_CATEGORIES_STATE = {
  editedMasterCategoryId: '',
  editedCategoryBudgetId: '',
  editedCategoryBudgetLoading: false,
  editedCategoryNameId: '',
  editedCategoryNameLoading: false,

  selectedMonth: moment(new Date()).format('YYYY-MM'),
  selectedCategory: null,
  monthTransactions: []
}

export default {
  namespaced: true,
  state: {
    ...DEFAULT_MONTH_CATEGORIES_STATE
  },
  mutations: {
    SET_EDITED_MASTER_CATEGORY_ID(state, id) {
      Vue.set(state, 'editedMasterCategoryId', id)
    },
    CLEAR_EDITED_MASTER_CATEGORY_ID(state) {
      Vue.set(state, 'editedMasterCategoryId', DEFAULT_MONTH_CATEGORIES_STATE.editedMasterCategoryId)
    },
    SET_EDITED_CATEGORY_BUDGET_ID(state, id) {
      Vue.set(state, 'editedCategoryBudgetId', id)
    },
    CLEAR_EDITED_CATEGORY_BUDGET_ID(state) {
      Vue.set(state, 'editedCategoryBudgetId', DEFAULT_MONTH_CATEGORIES_STATE.editedCategoryBudgetId)
    },
    SET_EDITED_CATEGORY_BUDGET_LOADING(state, loading) {
      Vue.set(state, 'editedCategoryBudgetLoading', loading)
    },
    SET_EDITED_CATEGORY_NAME_ID(state, id) {
      Vue.set(state, 'editedCategoryNameId', id)
    },
    SET_EDITED_CATEGORY_NAME_LOADING(state, loading) {
      Vue.set(state, 'editedCategoryNameLoading', loading)
    },
    CLEAR_EDITED_CATEGORY_NAME_ID(state) {
      Vue.set(state, 'editedCategoryNameId', DEFAULT_MONTH_CATEGORIES_STATE.editedCategoryNameId)
    },
    UPDATE_SELECTED_MONTH(state, year_month) {
      Vue.set(state, 'selectedMonth', year_month)
    },
    SET_MONTH_TRANSACTIONS(state, transactions) {
      Vue.set(state, 'monthTransactions', transactions)
    },
    SET_SELECTED_CATEGORY(state, category) {
      Vue.set(state, 'selectedCategory', category)
    },
    SET_SELECTED_CATEGORY_ATTRIBUTE(state, { attribute, value }) {
      Vue.set(state.selectedCategory, attribute, value)
    },
    RESET_SELECTED_CATEGORY(state) {
      Vue.set(state, 'selectedCategory', null)
    }
    // SET_SELECTED_MOVING_TO_CLICKED(state, value) {
    //   Vue.set(state.selectedCategory, 'isMovingTo', value)
    // }
  },
  getters: {
    editedMasterCategoryId: (state) => state.editedMasterCategoryId,
    editedCategoryBudgetId: (state) => state.editedCategoryBudgetId,
    editedCategoryBudgetLoading: (state) => state.editedCategoryBudgetLoading,
    editedCategoryNameId: (state) => state.editedCategoryNameId,
    editedCategoryNameLoading: (state) => state.editedCategoryNameLoading,
    selectedMonth: (state) => state.selectedMonth,
    prevMonth: (state, getters) => {
      return prevMonth(getters.selectedMonth)
    },
    nextMonth: (state, getters) => {
      return nextMonth(getters.selectedMonth)
    },
    thisMonth: (state) => {
      return moment(new Date()).format('YYYY-MM')
    },
    categoriesData: (state, getters, rootState, rootGetters) => {
      const masterCategories = rootGetters.masterCategories
      return masterCategories.reduce((partial, master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category)

        if (!Array.isArray(rootGetters.categoriesByMaster[master_id])) {
          return partial
        }

        let categories_data = rootGetters.categoriesByMaster[master_id].map((category) => {
          const category_id = category._id.slice(-ID_LENGTH.category)
          const budget = _.get(
            rootGetters.allCategoryBalances,
            [getters.selectedMonth, category_id, 'doc', 'budget'],
            0
          )
          const expense = _.get(rootGetters.allCategoryBalances, [getters.selectedMonth, category_id, 'expense'], 0)
          const income = _.get(rootGetters.allCategoryBalances, [getters.selectedMonth, category_id, 'income'], 0)
          const carryover = getCarryover(rootGetters.allCategoryBalances, getters.selectedMonth, category_id)
          const name = _.get(rootGetters.categoriesById, [category_id, 'name'], '')
          const budget_display = (budget / 100).toFixed(2)
          const sort = category.sort
          const balance = budget + income - expense + carryover
          const isIncome = category.masterCategory === INCOME._id
          const result = {
            _id: category_id,
            name: name,
            budget: budget,
            budgetDisplay: budget_display,
            income: income,
            isIncome: isIncome,
            expense: expense,
            carryover: carryover,
            balance: balance,
            sort: sort
          }
          return result
        })
        partial[master_id] = categories_data
        return partial
      }, {})
    },
    categoriesDataById: (state, getters) => {
      return Object.entries(getters.categoriesData).reduce((partial, [master_id, category_docs]) => {
        category_docs.forEach((category) => {
          partial[category._id] = category
        })
        return partial
      }, {})
    },
    categoriesDataSortedByBalance: (state, getters) => {
      return Object.values(getters.categoriesDataById)
        .filter((category) => {
          if ([NONE._id, HIDDEN._id, INCOME._id].includes(category._id) || category.isIncome) return false
          return true
        })
        .sort((a, b) => {
          return b.balance - a.balance
        })
    },
    masterCategoriesStats: (state, getters) => {
      return Object.entries(getters.categoriesData).reduce((partial, [master_id, category_docs]) => {
        partial[master_id] = category_docs.reduce(
          (sum_partial, category) => {
            sum_partial.budget += category.budget
            sum_partial.income += category.income
            sum_partial.expense += category.expense
            sum_partial.balance += category.balance
            return sum_partial
          },
          { ...DEFAULT_MASTER_CATEGORY_BALANCE }
        )
        return partial
      }, {})
    },
    monthStats: (state, getters, rootState, rootGetters) => {
      let stats = {
        available_last_month: 0,
        income_this_month: 0,
        budgeted_this_month: 0,
        available_this_month: 0
      }

      const sortedMonths = Object.keys(rootGetters.monthBalances).sort((a, b) => compareAscii(a, b))
      if (sortedMonths.length > 0) {
        let previous_month = sortedMonths[0]
        if (compareAscii(previous_month, getters.selectedMonth) < 0) {
          for (let i = 1; i < sortedMonths.length; i++) {
            if (compareAscii(sortedMonths[i], getters.selectedMonth) >= 0) {
              break
            }
            previous_month = sortedMonths[i]
          }
          stats.available_last_month = rootGetters.monthBalances[previous_month].available
        }
      }

      if (rootGetters.monthBalances[getters.selectedMonth]) {
        stats.income_this_month = rootGetters.monthBalances[getters.selectedMonth].income
        stats.budgeted_this_month = rootGetters.monthBalances[getters.selectedMonth].budgeted
        stats.available_this_month = rootGetters.monthBalances[getters.selectedMonth].available
      } else {
        stats.income_this_month = 0
        stats.budgeted_this_month = 0
        stats.available_this_month = stats.available_last_month
      }

      return stats
    },
    transactionHeaders: () => transactionHeaders,
    monthTransactions: (state) => state.monthTransactions,
    selectedCategory: (state) => state.selectedCategory
  },
  actions: {
    onCategoryBudgetChanged({ dispatch }, { category_id, event }) {
      if (!event.target) {
        return
      }
      let amount = parseInt(Math.round(parseFloat(event.target.value) * 100))
      return dispatch('updateBudget', { category_id, amount: amount })
    },
    updateBudget({ commit, getters, dispatch, rootGetters }, { category_id, amount }) {
      commit('SET_EDITED_CATEGORY_BUDGET_LOADING', true)
      if (isNaN(amount)) {
        console.warn(`Budget value: ${amount} is NaN`)
        return
      }
      const month = getters.selectedMonth
      let current = null
      const previous = _.get(rootGetters.allCategoryBalances, [month, category_id, 'doc'], null)

      if (previous === null) {
        current = {
          ...DEFAULT_MONTH_CATEGORY,
          _id: `b_${rootGetters.selectedBudgetId}${ID_NAME.monthCategory}${month}_${category_id}`,
          budget: amount
        }
      } else {
        current = {
          ...previous,
          budget: amount
        }
      }

      dispatch('updateMonthCategory', { current, previous }, { root: true })
        .then(() => {
          if (getters.selectedCategory._id === category_id) {
            dispatch('syncSelectedCategory')
          }
        })
        .finally(() => {
          commit('SET_EDITED_CATEGORY_BUDGET_LOADING', false)
        })
      commit('CLEAR_EDITED_CATEGORY_BUDGET_ID')
    },
    async doBudgetMove({ getters, dispatch }) {
      const negative = getters.selectedCategory.isMovingTo ? -1 : 1
      const selectedBudget = getters.selectedCategory.budget
      const destinationBudget = getters.categoriesDataById[getters.selectedCategory.moveDestination].budget
      await Promise.all([
        dispatch('updateBudget', {
          category_id: getters.selectedCategory._id,
          amount: selectedBudget + negative * getters.selectedCategory.moveAmount
        }),
        dispatch('updateBudget', {
          category_id: getters.selectedCategory.moveDestination,
          amount: destinationBudget - negative * getters.selectedCategory.moveAmount
        })
      ])
      return dispatch('syncSelectedCategory')
    },
    selectCategory({ commit, getters }, category) {
      const move_amount = Math.abs(category.balance)
      const is_moving_to = category.balance > 0
      let destination = ''
      const sortedData = getters.categoriesDataSortedByBalance
      if (sortedData.length > 0) {
        let index = 0
        if (is_moving_to) {
          index = sortedData.length - 1
          if (sortedData[index]._id === category._id && sortedData.length > 1) {
            index = sortedData.length - 2
          }
        } else {
          index = 0
          if (sortedData[0]._id === category._id && sortedData.length > 1) {
            index = 1
          }
        }
        destination = sortedData[index]._id
      }
      commit('SET_SELECTED_CATEGORY', {
        ...category,
        moveAmount: move_amount,
        isMovingTo: is_moving_to,
        moveDestination: destination
      })
    },
    syncSelectedCategory({ getters, dispatch }) {
      if (getters.selectedCategory === null) {
        return
      }
      const category_id = getters.selectedCategory._id
      dispatch('selectCategory', getters.categoriesDataById[category_id])
    },
    onCategoryNameChange({ getters, commit, dispatch, rootGetters }, event) {
      let name = ''
      if (typeof event === 'string' || event instanceof String) {
        name = event
      } else if (event.target) {
        name = event.target.value
      } else {
        return
      }
      commit('SET_EDITED_CATEGORY_NAME_LOADING', true)
      const doc = rootGetters.categoriesById[getters.editedCategoryNameId]
      commit('CLEAR_EDITED_CATEGORY_NAME_ID')
      if (doc !== undefined) {
        dispatch(
          'commitDocToPouchAndVuex',
          {
            current: { ...doc, name: name },
            previous: doc
          },
          { root: true }
        )
          .then(() => {
            dispatch('syncSelectedCategory')
          })
          .finally(() => {
            commit('SET_EDITED_CATEGORY_NAME_LOADING', false)
          })
      }
    },
    onMovingToClicked({ commit }) {
      commit('SET_SELECTED_CATEGORY_ATTRIBUTE', { attribute: 'isMovingTo', value: true })
    },
    onMovingFromClicked({ commit }) {
      commit('SET_SELECTED_CATEGORY_ATTRIBUTE', { attribute: 'isMovingTo', value: false })
    },
    onMoveDestinationChanged({ commit }, new_destination) {
      commit('SET_SELECTED_CATEGORY_ATTRIBUTE', { attribute: 'moveDestination', value: new_destination })
    },
    onSelectedMoveAmountChanged({ commit }, new_amount) {
      commit('SET_SELECTED_CATEGORY_ATTRIBUTE', { attribute: 'moveAmount', value: new_amount })
    },
    onMasterCategoryNameChange({ getters, commit, dispatch, rootGetters }, event) {
      let name = ''
      if (typeof event === 'string' || event instanceof String) {
        name = event
      } else if (event.target) {
        name = event.target.value
      } else {
        return
      }
      commit('SET_EDITED_CATEGORY_NAME_LOADING', true)
      const doc = rootGetters.masterCategoriesById[getters.editedMasterCategoryId]
      commit('CLEAR_EDITED_MASTER_CATEGORY_ID')
      if (doc !== undefined) {
        dispatch(
          'commitDocToPouchAndVuex',
          {
            current: { ...doc, name: name },
            previous: doc
          },
          { root: true }
        )
          .then(() => {
            dispatch('syncSelectedCategory')
          })
          .finally(() => {
            commit('SET_EDITED_CATEGORY_NAME_LOADING', false)
          })
      }
    },
    // onMasterCategoryNameChange({ dispatch, commit, getters, rootGetters }, event) {
    //   let name = ''
    //   if (typeof event === 'string' || event instanceof String) {
    //     name = event
    //   } else if (event.target) {
    //     name = event.target.value
    //   } else {
    //     return
    //   }
    //   const doc = rootGetters.masterCategoriesById[getters.editedMasterCategoryId]
    //   commit('CLEAR_EDITED_MASTER_CATEGORY_ID')
    //   if (doc !== undefined) {
    //     dispatch(
    //       'commitDocToPouchAndVuex',
    //       {
    //         current: { ...doc, name: name },
    //         previous: doc
    //       },
    //       { root: true }
    //     )
    //   }
    // },
    getMonthTransactions({ commit, dispatch, getters, rootGetters }) {
      console.log('Get momth transactions')
      if (rootGetters.accounts.length < 1 || !rootGetters.selectedBudgetId) {
        return
      }
      dispatch('fetchTransactionsForMonth', getters.selectedMonth, { root: true }).then((transactions) => {
        let group = 0
        let currentDate = null
        const monthTransactions = transactions.reduce((partial, transaction) => {
          const account = rootGetters.accountsById[transaction.account]
          if (account === undefined) {
            return partial
          }
          if (transaction.date !== currentDate) {
            currentDate = transaction.date
            group += 1
          }
          const base_data = {
            date: transaction.date,
            memo: transaction.memo,
            account: account.name,
            group: group
          }
          if (transaction.splits && transaction.splits.length > 1) {
            transaction.splits.forEach((split) => {
              const data = {
                ...base_data,
                amount: split.value * account.sign,
                category: split.category
              }
              partial.push(data)
            })
            return partial
          } else {
            const data = {
              ...base_data,
              amount: transaction.value * account.sign,
              category: transaction.category
            }
            partial.push(data)
          }
          return partial
        }, [])
        commit('SET_MONTH_TRANSACTIONS', monthTransactions)
        dispatch('syncSelectedCategory')
      })
    },
    newMasterCategory({ commit, dispatch, rootGetters }) {
      const index = rootGetters.masterCategories.length
      return dispatch(
        'createMasterCategory',
        { name: 'Name', is_income: false, sort: index - 0.5 },
        { root: true }
      ).then((id) => {
        commit('SET_EDITED_MASTER_CATEGORY_ID', id)
        return id
      })
    },
    newCategory({ commit, dispatch, getters }, master_category) {
      return dispatch('createCategory', { name: 'Name', master_id: master_category._id }, { root: true })
      .then((new_category) => {
        const id = new_category._id.slice(-ID_LENGTH.category)
        console.log('newCategory', getters.categoriesDataById[id])
        commit('SET_EDITED_CATEGORY_NAME_ID', id)
        dispatch('selectCategory',  getters.categoriesDataById[id])
        return id
      })
    },
    onDeleteMasterCategory({ dispatch }, master_category) {
      dispatch('deleteMasterCategory', master_category._id, { root: true })
    },

    onHideCategory({ dispatch, rootGetters }, category_id) {
      console.log('onHideCategory', category_id)
      const doc = rootGetters.categoriesById[category_id]
      if (doc !== undefined) {
        dispatch(
          'commitDocToPouchAndVuex',
          {
            current: { ...doc, hidden: true },
            previous: doc
          },
          { root: true }
        )
      }
    },
    onUnhideCategory({ dispatch, rootGetters }, category_id) {
      console.log('onUnhideCategory', category_id)
      const doc = rootGetters.categoriesById[category_id]
      console.log('onUnhideCategory', doc)
      if (doc === undefined) {
        return
      }
      if (rootGetters.masterCategories.length < 1) {
        return
      }

      let master_id = doc.masterCategory
      if (
        [NONE._id, HIDDEN._id].includes(doc.masterCategory) ||
        !Object.keys(rootGetters.masterCategoriesById).includes(master_id)
      ) {
        for (let masterCategory of rootGetters.masterCategories) {
          console.log('ID', masterCategory._id)
          console.log('BAD IDS', [NONE._id, HIDDEN._id, INCOME._id])
          if (![NONE._id, HIDDEN._id, INCOME._id].includes(masterCategory._id.slice(-ID_LENGTH.category))) {
            master_id = masterCategory._id.slice(-ID_LENGTH.category)
            break
          }
        }
      }
      console.log('master_id', master_id)

      let sort = 0
      const destination_categories = rootGetters.categoriesByMaster[master_id]
      if (destination_categories !== undefined) {
        sort = destination_categories.length
      }
      dispatch(
        'commitDocToPouchAndVuex',
        {
          current: { ...doc, masterCategory: master_id, hidden: false, sort: sort },
          previous: doc
        },
        { root: true }
      )
    },
    onCategoryOrderChanged({ dispatch }, event) {
      dispatch('reorderCategory', event, { root: true })
    },
    onEditMasterCategoryName({ commit }, id) {
      commit('SET_EDITED_MASTER_CATEGORY_ID', id)
    },
    onEditCategoryName({ commit }, id) {
      commit('SET_EDITED_CATEGORY_NAME_ID', id)
    },
    onEditCategoryBudget({ commit }, id) {
      commit('SET_EDITED_CATEGORY_BUDGET_ID', id)
    }
  }
}

const transactionHeaders = [
  {
    text: 'Group',
    value: 'group'
  },
  {
    text: 'Memo',
    value: 'memo'
  },
  {
    text: 'Account',
    value: 'account'
  },
  {
    text: 'Amount',
    value: 'amount'
  },
  {
    text: 'Balance',
    value: 'balance'
  }
  // {
  //   text: "ID",
  //   value: "_id",
  // }
]
