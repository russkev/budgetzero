import _ from 'lodash'
import moment from 'moment'

import { ID_LENGTH, ID_NAME } from '../../constants.js'

const DEFAULT_BUDGET_STATE = {
  allBudgets: [],
  budgetBalances: {},
  budgetOpened: {},
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
          partial[budget._id] = budget
        }
        return budget
      }, {})
    },
    budgetRootsMap: (state, getters) => {
      return getters.allBudgets.reduce((map, budget_root) => {
        if (budget_root._id) {
          map[budget_root._id.slice(-ID_LENGTH.budget)] = budget_root
          return map
        }
      }, {})
    },
    budgetOpened: (state) => state.budgetOpened,
      // state.budgetOpened.map((row) => {
      //   var obj = row.doc
      //   return obj
      // }),
    // budgetOpenedMap: (state, getters) =>
    //   getters.budgetOpened.reduce((map, obj) => {
    //     const id = obj._id ? obj._id.slice(-ID_LENGTH.budget) : null
    //     map[id] = obj
    //     return map
    //   }, {}),
    budgetExists: (state) => state.budgetExists,
    budgetBalances: (state, getters) => {
      return state.budgetBalances
    }
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
      state.allBudgets = budgets.map((budget) => {
        return budget.doc
      })
    },
    SET_BUDGET_OPENED(state, payload) {
      state.budgetOpened = payload
    }
  },
  actions: {
    /**
     * Creates new budget and commits to pouchdb
     * @param {*} context
     * @param {string} budgetName The name of the budget to be created
     */

    commitBudgetOpened(context, {current, previous}) {
      let payload = current
      if (!current) {
        payload = DEFAULT_BUDGET_STATE.budgetOpened
      }
      context.commit('SET_BUDGET_OPENED', payload)
    },

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

      var budgetOpened = {
        opened: moment(new Date()).format('YYYY-MM-DD'),
        _id: ID_NAME.budgetOpened + budget_id
      }

      return context
        .dispatch('commitDocToPouchAndVuex', { current: budget, previous: null })
        .then((result) => {
          return context.dispatch('setSelectedBudgetID', result.id.slice(-ID_LENGTH.budget))
        })
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
        .then(() => {
          return context.dispatch('commitDocToPouchAndVuex', { current: budgetOpened, previous: null })
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

    getBudgetOpened(context) {
      return this._vm.$pouch
        .allDocs({
          include_docs: true,
          attachments: true,
          startkey: ID_NAME.budgetOpened,
          endkey: ID_NAME.budgetOpened + '\ufff0'
        })
        .then((result) => {
          context.commit('GET_BUDGET_OPENED', result.rows)
        })
        .catch((err) => {
          console.log(err)
          context.commit('API_FAILURE', err)
        })
    },

    updateSelectedBudgetId(context, budgets) {
      let selected_budget_id = null
      if (localStorage.budgetID && budgets.map((budget) => budget._id).contains(localStorage.BudgetID)) {
        selected_budget_id = localStorage.budgetID
      } else if (budgets.length > 0) {
        selected_budget_id = budgets[0]._id.slice(-ID_LENGTH.budget)
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
      db.put({
        ...budget,
        accessed: Math.floor(Date.now() / 1000)
      })
      dispatch('fetchAllBudgets')
    },

    /**
     * Deletes entire budget
     * @param {*} context
     * @param {*} payload budget_ document
     */
    deleteEntireBudget(context, payload) {
      const budget_id = payload._id.slice(-ID_LENGTH.budget)

      return new Promise((resolve, reject) => {
        this._vm.$pouch
          .allDocs({
            include_docs: true,
            attachments: true,
            startkey: `b_${budget_id}_`,
            endkey: `b_${budget_id}_\ufff0`
          })
          .then((result) => {
            //Add deleted key to each
            const rowsToDelete = {}
            rowsToDelete.docs = result.rows.map((v) => ({ ...v.doc, _deleted: true }))
            console.log('going to delete..', rowsToDelete)
            //Bulk delete
            context.dispatch('commitBulkDocsToPouchAndVuex', rowsToDelete).then(
              (response) => {
                this._vm.$pouch
                  .get(ID_NAME.budgetOpened + budget_id)
                  .then(function (doc) {
                    context.dispatch('deleteDocFromPouchAndVuex', doc)
                  })
                  .catch(function (err) {
                    console.log(err)
                  })

                // Finally, delete the budget_ doc
                //TODO: Put this inside .then() above?
                context.dispatch('deleteDocFromPouchAndVuex', payload)

                resolve(response)
              },
              (error) => {
                reject(error)
                context.commit('API_FAILURE', error)
              }
            )
          })
      })
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
