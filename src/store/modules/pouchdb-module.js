import {
  schema_budget,
  schema_budgetOpened,
  schema_account,
  schema_transaction,
  schema_category,
  schema_monthCategory,
  schema_masterCategory,
  schema_payee,
  validateSchema
} from '../validation'
import _, { reject } from 'lodash'
import { ID_LENGTH, ID_NAME, DEFAULT_STATE, DEFAULT_BALANCE, INITIAL_MONTH_CATEGORIES } from '../../constants'
import { databaseExists, docTypeFromId, getMonthCategoryDate } from '../../helper'

/**
 * This pouchdb vuex module contains code that interacts with the pouchdb database.
 */

export default {
  state: {
    ...DEFAULT_STATE
  },
  getters: {
    //Plain getters for main doc types
    transactions: (state) => state.transactions,
    accounts: (state) => state.accounts,
    // masterCategories: (state) => state.masterCategories,
    masterCategories: (state) => [...state.masterCategories].sort((a, b) => (a.sort > b.sort ? 1 : -1)),
    monthCategoryBudgets: (state) => {
      const result = state.monthCategoryBudgets.reduce((partial, row) => {
        // Extract date from the id and add it as a separate property
        const row_id = row._id
        const month_category_id = row_id.slice(-ID_LENGTH.monthCategory)
        const date = getMonthCategoryDate(row_id)
        return {
          ...partial,
          [date]: {
            ...partial[date],
            [month_category_id]: row
          }
        }
      }, {})
      return result
    },
    payees: (state) => {
      return [
        {
          id: null,
          name: 'Payee not selected.'
        }
      ].concat(state.payees)
    },
    categories: (state) => {
      return [...INITIAL_MONTH_CATEGORIES, ...state.categories]
    },
    categoriesByTruncatedId: (state) => {
      return state.categories.reduce((partial, category) => {
        partial[category._id.slice(-ID_LENGTH.category)] = category
        return partial
      }, {})
    },
    masterCategoriesByTruncatedId: (state, getters) => {
      return getters.masterCategories.reduce((partial, masterCategory) => {
        partial[masterCategory._id.slice(-ID_LENGTH.category)] = masterCategory
        return partial
      }, {})
    },

    //Lookups for main doc types
    budgetRootIndexById: (state, getters) => {
      return getters.budgetRoots.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    monthCategoryBudgetIndexById: (state, getters) => {
      return state.monthCategoryBudgets.reduce((map, monthCategoryBudget, i) => {
        map[monthCategoryBudget._id] = i
        return map
      }, {})
    },
    transactionsIndexById: (state, getters) => {
      return getters.transactions.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    masterCategoriesIndexById: (state, getters) => {
      return state.masterCategories.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    categoriesIndexById: (state, getters) => {
      return state.categories.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },

    payeesIndexById: (state, getters) => {
      return getters.payees.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    accountsIndexById: (state, getters) => {
      return getters.accounts.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },

    listOfImportIds: (state) => state.transactions.map((transaction) => _.get(transaction, 'importID', '')),
    budgetRoots: (state) => state.budgetRoots,
    budgetRootsMap: (state, getters) => {
      return getters.budgetRoots.reduce((map, budget_root) => {
        if (budget_root._id) {
          map[budget_root._id.slice(-ID_LENGTH.budget)] = budget_root
          return map
        }
      }, {})
    },
    budgetOpened: (state) =>
      state.budgetOpened.map((row) => {
        var obj = row.doc
        return obj
      }),
    budgetOpenedMap: (state, getters) =>
      getters.budgetOpened.reduce((map, obj) => {
        const id = obj._id ? obj._id.slice(-ID_LENGTH.budget) : null
        map[id] = obj
        return map
      }, {}),
    budgetExists: (state) => state.budgetExists,

    transactions_by_account: (state, getters) => _.groupBy(getters.transactions, 'account'),
    category_map: (state, getters) =>
      getters.categories.reduce((map, obj) => {
        const id = obj._id ? obj._id.slice(-ID_LENGTH.category) : null
        map[id] = obj.name
        return map
      }, {}),
    categoriesGroupedByMaster: (state, getters) => _.groupBy(getters.categories, 'masterCategory'),
    account_map: (getters) =>
      getters.accounts.reduce((map, obj) => {
        map[obj._id.slice(-ID_LENGTH.account)] = obj.name
        return map
      }, {}),
    accountsOnBudget: (state, getters) => {
      return getters.accounts.filter((account) => account.onBudget)
    },
    accountsOffBudget: (state, getters) => {
      return getters.accounts.filter((account) => !account.onBudget)
    },
    accountBalances: (state, getters) => {
      return state.accountBalances
    },
    budgetBalances: (state, getters) => {
      return state.budgetBalances
    },
    payee_map: (state, getters) => {
      let payees = getters.payees.reduce((map, obj) => {
        const id = obj._id ? obj._id.slice(-ID_LENGTH.payee) : null
        map[id] = obj.name
        return map
      }, {})
      payees['---------------------initial-balance'] = 'Initial Balance'
      return payees
    },
    payee_array: (state, getters) =>
      getters.payees.map((obj) => {
        const rObj = {}
        rObj.id = obj.id ? obj.id.slice(-ID_LENGTH.payee) : null
        rObj.name = obj.name
        return rObj
      }),
    payee_names: (state, getters) => getters.payees.map((obj) => obj.name)
  },
  mutations: {
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions
    },
    SET_MONTH_CATEGORY_BUDGETS(state, month_category_budgets) {
      state.monthCategoryBudgets = month_category_budgets
    },
    SET_PAYEES(state, payees) {
      state.payees = payees
    },
    SET_MASTER_CATEGORIES(state, master_categories) {
      state.masterCategories = master_categories
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories
    },
    SET_ACCOUNTS(state, accounts) {
      state.accounts = accounts

      const initial_account_balances = accounts.reduce((balances, account) => {
        balances[account._id.slice(-ID_LENGTH.account)] = DEFAULT_BALANCE
        return balances
      }, {})

      state.accountBalances = { ...initial_account_balances, ...state.accountBalances }
    },
    UPDATE_ACCOUNT(state, { index, value }) {
      state.accounts[index] = value
    },
    SET_ACCOUNT_BALANCES(state, balances) {
      const new_balances = balances.reduce((partial, account_data) => {
        const key = account_data.key
        const value = account_data.value
        if (partial[key[1]] === undefined) {
          partial[key[1]] = { ...DEFAULT_BALANCE }
        }
        if (key[2]) {
          partial[key[1]].cleared = value
        } else {
          partial[key[1]].uncleared = value
        }
        partial[key[1]].working = partial[key[1]].working + value
        return partial
      }, {})

      state.accountBalances = { ...state.accountBalances, ...new_balances }
    },
    SET_BUDGET_BALANCES(state, balances) {
      state.budgetBalances = balances.reduce((partial, budget_data) => {
        const date = budget_data.key[1]
        const category_id = budget_data.key[2]
        const value = budget_data.value

        if (!partial[date]) {
          partial[date] = {}
        }
        partial[date][category_id] = value
        return partial
      }, {})
    },
    // DELETE_DOCUMENT(state, payload) {
    //   // Only works for deleting transactions. In the future may need to delete other types of docs.
    //   const index = state.transactions.findIndex((row) => row._id == payload.id)
    //   state.transactions.splice(index, 1)
    // },
    DELETE_LOCAL_DB(state) {
      const default_state = JSON.parse(JSON.stringify(DEFAULT_STATE))
      Object.keys(default_state).forEach((key) => {
        state[key] = default_state[key]
      })
    },
    SET_BUDGET_ROOTS(state, budgets) {
      if (budgets.length == 0) {
        state.budgetExists = false
      } else {
        state.budgetExists = true
      }
      // Get budget ids
      state.budgetRoots = budgets.map((budget) => {
        return budget.doc
      })
    },
    SET_BUDGET_OPENED(state, payload) {
      state.budgetOpened = payload
    },
    UPDATE_VUE_DOCUMENT(state, { payload, index, docType }) {
      switch (docType) {
        case ID_NAME.transaction:
          if (isNaN(index)) {
            state.transactions = [...state.transactions, payload]
          } else {
            Object.assign(state.transactions[index], payload)
          }
          break
        case ID_NAME.category:
          if (isNaN(index)) {
            state.categories.push(payload)
          } else {
            Object.assign(state.categories[index], payload)
          }
          break
        case ID_NAME.masterCategory:
          if (isNaN(index)) {
            state.masterCategories.push(payload)
            console.log('masterCategory no index...', payload)
          } else {
            Object.assign(state.masterCategories[index], payload)
          }
          break
        case ID_NAME.account:
          if (isNaN(index)) {
            this.commit('SET_ACCOUNTS', state.accounts.concat(payload))
            // state.accounts.push(payload)
            console.log('account no index...', payload)
          } else {
            Object.assign(state.accounts[index], payload)
          }
          break
        case ID_NAME.monthCategory:
          if (isNaN(index)) {
            state.monthCategoryBudgets.push(payload)
          } else {
            Object.assign(state.monthCategoryBudgets[index], payload)
          }
          break
        case ID_NAME.payee:
          if (isNaN(index)) {
            state.payees.push(payload)
          } else {
            Object.assign(state.payees[index], payload)
          }
          break
        case ID_NAME.budget:
          //TODO: validate
          if (isNaN(index)) {
            state.budgetRoots.push(payload)
          } else {
            Object.assign(state.budgetRoots[index], payload)
          }
          break
        case ID_NAME.budgetOpened:
          //TODO: validate
          if (isNaN(index)) {
          } else {
          }
          break
        default:
          console.error("doesn't recognize doc type ", docType)
      }
    }
  },
  actions: {
    /**
     * Commits single document to pouchdb and then calls UPDATE_VUE_DOCUMENT to update current document list.
     * @param {doc} document The document to commit to pouchdb
     */
    commitDocToPouchAndVuex(context, document) {
      console.log('commitDocToPouchAndVuex')
      console.log(document)
      var docType = null
      var index = null

      if (document && document._id) {
        docType = docTypeFromId(document._id)
      }

      var validationResult = {
        errors: 'Validation schema not found.'
      }

      switch (docType) {
        case ID_NAME.transaction:
          validationResult = validateSchema.validate(document, schema_transaction)
          index = context.getters.transactionsIndexById[document._id]
          break
        case ID_NAME.category:
          validationResult = validateSchema.validate(document, schema_category)
          index = context.getters.categoriesIndexById[document._id]
          break
        case ID_NAME.masterCategory:
          validationResult = validateSchema.validate(document, schema_masterCategory)
          index = context.getters.masterCategoriesIndexById[document._id]
          break
        case ID_NAME.account:
          validationResult = validateSchema.validate(document, schema_account)
          index = context.getters.accountsIndexById[document._id]
          break
        case ID_NAME.monthCategory:
          validationResult = validateSchema.validate(document, schema_monthCategory)
          index = context.getters.monthCategoryBudgetIndexById[document._id]
          break
        case ID_NAME.payee:
          validationResult = validateSchema.validate(document, schema_payee)
          index = context.getters.payeesIndexById[document._id]
          break
        case ID_NAME.budget:
          validationResult = validateSchema.validate(document, schema_budget)
          index = context.getters.budgetRootIndexById[document._id]
          break
        case ID_NAME.budgetOpened:
          //TODO: validate
          validationResult = validateSchema.validate(document, schema_budgetOpened)
          break
        default:
          console.error("doesn't recognize doc type ", docType)
      }

      if (validationResult.errors.length > 0) {
        this.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Validation failed: ' + validationResult.errors.toString(),
          snackbarColor: 'error'
        })
        console.log('failed validation:', document)
        return
      }

      //Commit to Pouchdb
      const db = this._vm.$pouch
      return db.put(document).then((result) => {
        console.log('PUT RESULT')
        console.log(result)
        return result
      })

      // return new Promise((resolve, reject) => {
      //   db.put(document)
      //     .then((response) => {
      //       // document._rev = response.rev
      //       context.commit('UPDATE_VUE_DOCUMENT', {
      //         payload: { ...document, _rev: response.rev },
      //         index,
      //         docType
      //       })
      //       return Promise.all([context.dispatch('fetchAccountBalances'), context.dispatch('fetchBudgetBalances')])
      //     })
      //     .then((response) => {
      //       context.dispatch('calculateMonthlyCategoryData')
      //       resolve(response)
      //     })
      //     .catch((error) => {
      //       reject(error)
      //       context.commit('API_FAILURE', error)
      //     })
      // })
    },


    updateBalances(context) {
      return Promise
        .all([
          context.dispatch('fetchAccountBalances'),
          context.dispatch('fetchBudgetBalances')
        ])
        .then((response) => {
          return context.dispatch('calculateMonthlyCategoryData')
        })
        .catch((error) => {
          context.commit('API_FAILURE', error)
        })
    },

    /**
     * Bulk commits list of documents to pouchdb.
     * The calling component is responsible for updating current list to be in sync with store.
     * @param {array} payload The documents to commit to pouchdb
     */
    commitBulkDocsToPouchAndVuex(context, payload) {
      databaseExists(this._vm.$pouch)
        .then((database_exists) => {
          if (database_exists) {
            return
          } else {
            return context.dispatch('createLocalPouchDB', context)
          }
        })
        .then(() => {
          return this._vm.$pouch.bulkDocs(payload)
        })
        // .then((response) => {
        //   console.log('ACTION: commitBulkDocsToPouchAndVuex succeeded', response)
        //   return context.dispatch('loadLocalBudgetRoot')
        // })
        .catch((err) => {
          console.log('ACTION: commitBulkDocsToPouchAndVuex failed')
          return context.commit('API_FAILURE', err)
        })
    },

    getAllDocsFromPouchDB(context) {
      return Promise.all([
        context.dispatch('fetchAccounts'),
        context.dispatch('fetchPayees'),
        context.dispatch('fetchMasterCategories'),
        context.dispatch('fetchCategories'),
        context.dispatch('fetchMonthCategories'),
        context.dispatch('fetchBudgetBalances')
        // TODO: Use web worker to do the expensive lookups
        // Maybe this: https://github.com/pouchdb-community/worker-pouch
      ])
        .then(() => {
          context.dispatch('calculateMonthlyCategoryData')
        })
        .then(() => {
          context.dispatch('fetchAccountBalances')
        })
        .catch((err) => {
          console.log(err)
        })
    },

    loadLocalBudgetRoot(context) {
      context.commit('GET_REMOTE_SYNC_URL')
      const db = this._vm.$pouch
      context.dispatch('fetchAllBudgetRoots').then(() => {
        context.dispatch('getAllDocsFromPouchDB')
        context.dispatch('fetchBudgetOpened')
        return
      })
    },
  }
}
