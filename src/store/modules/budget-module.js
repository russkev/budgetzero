import _ from 'lodash'
import moment from 'moment'

import { ID_LENGTH, ID_NAME } from '../../constants.js'

export default {
  state: {},
  getters: {},
  mutations: {},
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
        checkNumber: false,
        _id: `${ID_NAME.budget}${budget_id}`
      }

      var budgetOpened = {
        opened: moment(new Date()).format('YYYY-MM-DD'),
        _id: ID_NAME.budgetOpened + budget_id
      }

      return context
        .dispatch('commitDocToPouchAndVuex', {current: budget, previous: null})
        .then((result) => {
          console.log("CREATE BUDGET")
          console.log(result)
          return context.dispatch('setSelectedBudgetID', result.id.slice(-ID_LENGTH.budget))
        })
        .then(() => {
          let initialize_budget_promises = [context.dispatch('initializeIncomeCategory')]
          if (use_default) {
            return initialize_budget_promises.push(context.dispatch('initializeBudgetCategories'))
          }
          return Promise.all(initialize_budget_promises)
        })
        .then(() => {
          return context.dispatch('commitDocToPouchAndVuex', {current: budgetOpened, previous: null})
        })
        .then(() => {
          console.log('Created new budget')
          return
        })
        .catch((err) => {
          console.log(err)
        })
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
        _id: `b_${context.getters.selectedBudgetID}${ID_NAME.monthCategory}${
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
    },
  }
}
