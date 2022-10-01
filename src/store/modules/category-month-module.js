import Vue from 'vue'
import { DEFAULT_MONTH_CATEGORY, ID_LENGTH, ID_NAME, NONE, HIDDEN } from '../../constants'
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
      // console.log('categoriesByMaster', rootGetters.categoriesByMaster)
      let index = 0
      // Remove the 'None' category
      const masterCategories = rootGetters.masterCategories.filter((masterCategory) => masterCategory._id !== NONE._id)
      return masterCategories.reduce((partial, master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category)

        if (!Array.isArray(rootGetters.categoriesByMaster[master_id])) {
          return partial
        }

        partial[master_id] = rootGetters.categoriesByMaster[master_id]
          .sort((a, b) => a.sort - b.sort)
          .map((category) => {
            const category_id = category._id.slice(-ID_LENGTH.category)
            const budget = _.get(
              rootGetters.allCategoryBalances,
              [getters.selectedMonth, category_id, 'doc', 'budget'],
              0
            )
            const spent = _.get(rootGetters.allCategoryBalances, [getters.selectedMonth, category_id, 'spent'], 0)
            const carryover = getCarryover(rootGetters.allCategoryBalances, getters.selectedMonth, category_id)
            const name = _.get(rootGetters.categoriesById, [category_id, 'name'], '')
            const budget_display = (budget / 100).toFixed(2)
            const result = {
              id: category_id,
              name: name,
              budget: budget,
              budgetDisplay: budget_display,
              spent: spent,
              carryover: carryover,
              balance: budget + spent + carryover,
              index: index
            }
            index += 1
            return result
          })
        return partial
      }, {})
    },
    masterCategoriesStats: (state, getters) => {
      return Object.entries(getters.categoriesData).reduce((partial, [master_id, category_docs]) => {
        partial[master_id] = category_docs.reduce(
          (sum_partial, category) => {
            sum_partial.budget += category.budget
            sum_partial.spent += category.spent
            sum_partial.balance += category.balance
            return sum_partial
          },
          { budget: 0, spent: 0, carryover: 0, balance: 0 }
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

      let budget_value = parseInt(parseFloat(target_value) * 100)
      let current = null
      if (isNaN(budget_value)) {
        console.warn('Budget value is NaN')
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
      return dispatch('createCategory', { name: 'Name', master_id: master_category.id }, { root: true }).then((id) => {
        commit('SET_EDITED_CATEGORY_NAME_ID', id)
        return id
      })
    },
    onDeleteMasterCategory({ dispatch }, master_category) {
      dispatch('deleteMasterCategory', master_category.id, { root: true })
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
      const doc = rootGetters.categoriesById[category_id]
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
          if (![NONE._id, HIDDEN._id].includes(masterCategory._id)) {
            master_id = masterCategory._id.slice(-ID_LENGTH.category)
            break
          }
        }
      }

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