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

const DEFAULT_MONTH_CATEGORIES_STATE = {
  editedMasterCategoryId: '',
  editedCategoryBudgetId: '',
  editedCategoryNameId: '',
  selectedMonth: moment(new Date()).format('YYYY-MM')
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
    SET_EDITED_CATEGORY_NAME_ID(state, id) {
      Vue.set(state, 'editedCategoryNameId', id)
    },
    CLEAR_EDITED_CATEGORY_NAME_ID(state) {
      Vue.set(state, 'editedCategoryNameId', DEFAULT_MONTH_CATEGORIES_STATE.editedCategoryNameId)
    },
    UPDATE_SELECTED_MONTH(state, year_month) {
      Vue.set(state, 'selectedMonth', year_month)
    }
  },
  getters: {
    editedMasterCategoryId: (state) => state.editedMasterCategoryId,
    editedCategoryBudgetId: (state) => state.editedCategoryBudgetId,
    editedCategoryNameId: (state) => state.editedCategoryNameId,
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

        let categories_data = rootGetters.categoriesByMaster[master_id]
          .map((category) => {
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
            const result = {
              _id: category_id,
              name: name,
              budget: budget,
              budgetDisplay: budget_display,
              income: income,
              expense: expense,
              carryover: carryover,
              balance: budget + income - expense + carryover,
              sort: sort,
            }
            return result
          })
        partial[master_id] = categories_data
        return partial
      }, {})
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
    }
  },
  actions: {
    onCategoryBudgetChanged({ commit, getters, dispatch, rootGetters }, { category_id, event }) {
      if (!event.target) {
        return
      }
      const target_value = event.target.value
      const month = getters.selectedMonth
      let budget_value = parseInt(Math.round(parseFloat(target_value) * 100))
      let current = null
      if (isNaN(budget_value)) {
        console.warn(`Budget value: ${target_value} is NaN`)
        return
      }
      const previous = _.get(rootGetters.allCategoryBalances, [month, category_id, 'doc'], null)

      if (previous === null) {
        current = {
          ...DEFAULT_MONTH_CATEGORY,
          _id: `b_${rootGetters.selectedBudgetId}${ID_NAME.monthCategory}${month}_${category_id}`,
          budget: budget_value
        }
      } else {
        current = {
          ...previous,
          budget: budget_value
        }
      }
      dispatch('updateMonthCategory', { current, previous }, { root: true })
      commit('CLEAR_EDITED_CATEGORY_BUDGET_ID')
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
      }
    },
    onMasterCategoryNameChange({ dispatch, commit, getters, rootGetters }, event) {
      let name = ''
      if (typeof event === 'string' || event instanceof String) {
        name = event
      } else if (event.target) {
        name = event.target.value
      } else {
        return
      }
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
      }
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
    newCategory({ commit, dispatch }, master_category) {
      return dispatch('createCategory', { name: 'Name', master_id: master_category._id }, { root: true }).then((id) => {
        commit('SET_EDITED_CATEGORY_NAME_ID', id)
        return id
      })
    },
    onDeleteMasterCategory({ dispatch }, master_category) {
      dispatch('deleteMasterCategory', master_category._id, { root: true })
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
      }
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
      console.log("onUnhideCategory", category_id)
      const doc = rootGetters.categoriesById[category_id]
      console.log("onUnhideCategory", doc)
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
          console.log("ID", masterCategory._id)
          console.log("BAD IDS", [NONE._id, HIDDEN._id, INCOME._id])
          if (![NONE._id, HIDDEN._id, INCOME._id].includes(masterCategory._id.slice(-ID_LENGTH.category))) {
            master_id = masterCategory._id.slice(-ID_LENGTH.category)
            break
          }
        }
      }
      console.log("master_id", master_id)

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
