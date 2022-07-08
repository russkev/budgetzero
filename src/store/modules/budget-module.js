import _ from 'lodash'
import moment from 'moment'

import { ID_LENGTH, ID_NAME } from '../../constants.js'

const DEFAULT_BUDGET_STATE = {
  allBudgets: [],
  budgetBalances: {},
  budgetExists: true // This opens the create budget modal when 'false'
}

export default {
  state: {
    ...DEFAULT_BUDGET_STATE
  },
  getters: {
    allBudgets: (state) => state.allBudgets,
    budgetsById: (state) => {
      return state.allBudgets.reduce((partial, budget) => {
        if (budget._id !== undefined) {
          partial[budget._id.slice(-ID_LENGTH.budget)] = budget
        }
        return partial
      }, {})
    },
    budgetExists: (state) => state.budgetExists,
    budgetBalances: (state) => state.budgetBalances
  },
  mutations: {
    RESET_BUDGET_STATE(state) {
      Object.entries(DEFAULT_BUDGET_STATE).forEach(([key, value]) => {
        state[key] = value
      })
    },
    SET_ALL_BUDGETS(state, budgets) {
      if (budgets.length == 0) {
        state.budgetExists = false
      } else {
        state.budgetExists = true
      }
      // Get budget ids
      state.allBudgets = budgets
    },
  },
  actions: {

    /**
     * Creates new budget and commits to pouchdb
     * @param {*} context
     * @param {string} budgetName The name of the budget to be created
     */
    createBudget: async (context, { name, use_default }) => {
      if (!name) {
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Invalid budget name',
          snackbarColor: 'error'
        })
        Promise.reject(`Invalid budget name: ${name}`)
      }
      const budget_id = await context.dispatch('generateUniqueShortId', { prefix: ID_NAME.budget })

      const budget = {
        name: name,
        currency: 'USD',
        created: moment(new Date()).format('YYYY-MM-DD'),
        accessed: Math.floor(Date.now() / 1000),
        checkNumber: false,
        _id: `${ID_NAME.budget}${budget_id}`
      }

      return context
        .dispatch('commitDocToPouchAndVuex', { current: budget, previous: null })
        .then(() => {
          return context.dispatch('loadLocalBudget')
        })
        .then(() => {
          let initialize_budget_promises = [context.dispatch('initializeIncomeCategory')]
          if (use_default) {
            initialize_budget_promises.push(context.dispatch('initializeBudgetCategories'))
          }
          return Promise.all(initialize_budget_promises)
        })
        .catch((err) => {
          console.log(err)
        })
    },

    commitBudgetToVuex(context, {current, previous}) {
      if ((current && !current._id) || (previous && !previous._id)) {
        console.error(`commitBudgetToVuex called with invalid arguments, current: ${current}, previous: ${previous}`)
        return
      }
      const new_budget_id = current 
        ? current._id.slice(-ID_LENGTH.budget)
        : previous._id.slice(-ID_LENGTH.budget)
      
      return context.dispatch('setSelectedBudgetID', new_budget_id)
    },

    updateSelectedBudgetId(context, budgets) {
      let selected_budget_id = context.getters.selectedBudgetId

      if (selected_budget_id === null || context.getters.budgetsById[selected_budget_id] === undefined) {
        const local_storage_budget_id = localStorage.getItem('budgetID')
        if (local_storage_budget_id && budgets.map((budget) => budget._id).indexOf(local_storage_budget_id) > -1) {
          selected_budget_id = local_storage_budget_id
        } else if (budgets.length > 0) {
          selected_budget_id = budgets[0]._id.slice(-ID_LENGTH.budget)
        }
      }

      if (selected_budget_id !== null) {
        context.commit('UPDATE_SELECTED_BUDGET_ID', selected_budget_id)
      }
      return selected_budget_id
    },

    async updateBudgetAccessed({getters, dispatch}, budget_id) {
      const db = this._vm.$pouch
      let budget = getters.budgetsById[budget_id]
      if (budget === undefined) {
        return
      }
      return db
        .put({
          ...budget,
          accessed: Math.floor(Date.now() / 1000)
        })
        .then(() => {
          return dispatch('fetchAllBudgets')
        })
      
    },

    /**
     * Deletes entire budget
     * @param {*} context
     * @param {*} payload budget_ document
     */
    deleteEntireBudget(context, budget_document) {
      const budget_id = budget_document._id.slice(-ID_LENGTH.budget)
      const budget_name = budget_document.name

      if(!budget_id || !budget_document) {
        return
      }

      return Promise
        .all([
          context.dispatch('deleteDocFromPouch', budget_document),
          context.dispatch('deleteAllBudgetDocuments', budget_id),
        ])
        .then((results) => {
          if(results[0].ok) {
            context.commit('SET_SNACKBAR_MESSAGE', `${budget_name} has been deleted`)
            return true
          }
          return false
        })
        .catch((error) => {
          context.commit('API_FAILURE', error)
        })
    },

    resetBudget(context) {
      context.commit('RESET_BUDGET_STATE')
    },

    /**
     * Turn the right-red-arrow on/off
     */
    flipOverspending(context, item) {
      var payload = {
        budget: 0,
        overspending: true,
        note: '',
        _id: `b_${context.getters.selectedBudgetId}${ID_NAME.monthCategory}${
          context.getters.month_selected
        }_${item._id.slice(-ID_LENGTH.category)}`,
        date: context.getters.month_selected + '-01'
      }

      //Check if already exists
      if (
        context.getters.monthCategoryBudgets[context.getters.month_selected] &&
        context.getters.monthCategoryBudgets[context.getters.month_selected][item._id.slice(-ID_LENGTH.category)]
      ) {
        payload = JSON.parse(
          JSON.stringify(
            context.getters.monthCategoryBudgets[context.getters.month_selected][item._id.slice(-ID_LENGTH.category)]
          )
        )

        payload.overspending = !payload.overspending
      }
      context.dispatch('updateMonthCategory', payload)
    }
  }
}
