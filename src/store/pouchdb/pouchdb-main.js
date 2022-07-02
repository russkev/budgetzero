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
import _ from 'lodash'
import { ID_LENGTH, ID_NAME, DEFAULT_STATE, DEFAULT_ACCOUNT_BALANCE, UNCATEGORIZED } from '../../constants'
import { databaseExists, docTypeFromId, extractMonthCategoryMonth } from '../../helper'
import Vue from 'vue'
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
    accountsById: (state) => {
      return state.accounts.reduce((partial, account) => {
        partial[account._id.slice(-ID_LENGTH.account)] = account
        return partial
      }, {})
    },
    // masterCategories: (state) => state.masterCategories,
    masterCategories: (state) => [...state.masterCategories].sort((a, b) => (a.sort > b.sort ? 1 : -1)),
    monthCategoryBudgets: (state) => state.monthCategoryBudgets,
    payees: (state) => {
      return [
        {
          id: null,
          name: 'Payee not selected.'
        }
      ].concat(state.payees)
    },
    categories: (state) => {
      return [UNCATEGORIZED, ...state.categories]
    },
    categoriesById: (state, getters) => {
      return getters.categories.reduce((partial, category) => {
        partial[category._id.slice(-ID_LENGTH.category)] = category
        return partial
      }, {})
    },
    masterCategoriesById: (state, getters) => {
      return getters.masterCategories.reduce((partial, masterCategory) => {
        partial[masterCategory._id.slice(-ID_LENGTH.category)] = masterCategory
        return partial
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
      state.monthCategoryBudgets = month_category_budgets.reduce((partial, row) => {
        const row_id = row._id
        const category_id = row_id.slice(-ID_LENGTH.category)
        const month = extractMonthCategoryMonth(row_id)

        if (partial[month] === undefined) {
          partial[month] = {}
        }
        partial[month][category_id] = row
        return partial
      }, {})
    },
    UPDATE_MONTH_CATEGORY(state, doc) {
      const month = extractMonthCategoryMonth(doc._id)
      const category_id = doc._id.slice(-ID_LENGTH.category)

      if (state.monthCategoryBudgets[month] === undefined) {
        Vue.set(state.monthCategoryBudgets, month, {})
      }
      Vue.set(state.monthCategoryBudgets[month], category_id, doc)
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
        balances[account._id.slice(-ID_LENGTH.account)] = DEFAULT_ACCOUNT_BALANCE
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
          partial[key[1]] = { ...DEFAULT_ACCOUNT_BALANCE }
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
    },
  },
  actions: {
    /**
     * Bulk commits list of documents to pouchdb.
     * The calling component is responsible for updating current list to be in sync with store.
     * @param {array} payload [{current, previous}] The  documents to commit to pouchdb
     */
    async commitBulkDocsToPouchAndVuex(context, payload) {
      const database_exists = await databaseExists(this._vm.$pouch)
      if (!database_exists) {
        await context.dispatch('createLocalPouchDB', context)
      }

      const valid_documents = payload.map((doc) => {
        if (doc.current !== undefined && doc.previous !== undefined) {
          const doc_type = validateDocument(doc.current, doc.previous)

          if (doc_type) {
            doc['doc_type'] = doc_type
            return doc
          }
        } else {
          console.warm('Invalid document provided to commitBulkDocsToPouchAndVuex', doc)
        }
      })

      const db_payload = valid_documents.map((doc) => {
        return doc.current ? doc.current : doc.previous
      })

      try {
        const results = await context.dispatch('commitDocsToPouch', db_payload)
        const results_by_id = results.reduce((partial, result) => {
          partial[result.id] = result
          return partial
        }, {})

        return Promise.all(valid_documents.map((valid_document) => {
          const id = valid_document.current ? valid_document.current._id : valid_document.previous._id
          if (results_by_id[id] !== undefined && results_by_id[id].ok){
            valid_document._rev = results_by_id[id].rev
            return context.dispatch('commitDocToVuex', valid_document)
          }
        }))
      } catch (error) {
        console.log('ACTION: commitBulkDocsToPouchAndVuex failed')
        return context.commit('API_FAILURE', error)
      }
    },

    /**
     * Commits single document to pouchdb and then calls UPDATE_VUE_DOCUMENT to update current document list.
     * @param {doc} document The document to commit to pouchdb
     */
    commitDocToPouchAndVuex(context, { current, previous }) {
      console.log('commitDocToPouchAndVuex')
      if (!current && !previous) {
        console.warn(`commitDocToPouchAndVuex called with invalid 'current' and 'previous'`)
        return
      }
      const doc_type = validateDocument(current, previous)
      if (doc_type) {
        return context
          .dispatch('commitDocToPouch', { current, previous, doc_type })
          .then((result) => {
            if (result.ok) {
              if (current) {
                current._rev = result.rev
              } 
              return context.dispatch('commitDocToVuex', { current, previous, doc_type })
            } else {
              console.log(result)
              Promise.reject(`Pouch update failed`)
            }
          })
      }
      else {
        Promise.reject("Invalid document type")
      }
    },

    commitDocToPouch(context, { current, previous, doc_type }) {
      const db = this._vm.$pouch
      if (current) {
        if (doc_type === ID_NAME.transaction && previous && current.date !== previous.date) {
          // New transaction date requires a new ID which means the old transaction has to be deleted
          const transaction_id = this._vm.generateId(current.date)
          const for_db_previous = {
            ...current, 
            _deleted: true
          }
          const for_db_current = {
            ...current, 
            _id: `b_${context.getters.selectedBudgetId}${ID_NAME.transaction}${transaction_id}`
          }
          delete for_db_current._rev
          return db.bulkDocs([for_db_current, for_db_previous]).then((results) => {
            const all_successful = results
              .reduce((partial, result) => {
                if (!result.ok) {
                  return false
                } else {
                  return partial
                }
              }, true)
            if (all_successful) {
              // Return first result because it is the one with the correct _rev
              return results[0]
            } else {
              Promise.reject(`Pouch update failed`)
              console.log(results)
            }
          })
        } else {
          return db.put(current)
        }
      } else {
        return db.remove(previous)
      }
    },

    commitDocsToPouch(context, docs) {
      const db = this._vm.$pouch
      return db.bulkDocs(docs)
    },

    commitDocToVuex(context, { current, previous, doc_type }) {
      switch (doc_type) {
        case ID_NAME.transaction:
          return context.dispatch('commitTransactionToVuex', {current, previous})
        case ID_NAME.category:
          return
        case ID_NAME.masterCategory:
          return
        case ID_NAME.account:
          return
        case ID_NAME.monthCategory:
          return context.dispatch('commitMonthCategoryToVuex', {current, previous})
        case ID_NAME.payee:
          return
        case ID_NAME.budget:
          return
        case ID_NAME.budgetOpened:
          return
        default:
          console.error("doesn't recognize doc type ", doc_type)
          return
      }
    },

    async commitDocToDb(context, { current, previous }) {
      const db = this._vm.$pouch
      const result = current ? db.put(current) : db.remove(previous)
      return result
    },

    async commitTransactionToVuex(context, { current, previous }) {
      const transaction_payload = this._vm.calculateTransactionBalanceUpdate(current, previous)
      this.commit('UPDATE_ACCOUNT_BALANCES', transaction_payload)

      const category_balances = await context.dispatch('calculateCategoryBalanceUpdate', { current, previous })
      category_balances.map((result) => {
        this.commit('UPDATE_CATEGORY_BALANCES', result)
      })
    },

    updateBalances(context) {
      return Promise.all([context.dispatch('fetchAccountBalances'), context.dispatch('fetchBudgetBalances')])
        .then((response) => {
          return response
          // return context.dispatch('calculateMonthlyCategoryData')
        })
        .catch((error) => {
          context.commit('API_FAILURE', error)
        })
    },

    getAllDocsFromPouchDB(context) {
      return (
        Promise.all([
          context.dispatch('fetchAccounts'),
          context.dispatch('fetchPayees')
          // context.dispatch('fetchMasterCategories'),
          // context.dispatch('fetchCategories'),
          // context.dispatch('fetchMonthCategories'),
          // context.dispatch('fetchBudgetBalances')
          // TODO: Use web worker to do the expensive lookups
          // Maybe this: https://github.com/pouchdb-community/worker-pouch
        ])
          // .then(() => {
          //   context.dispatch('calculateMonthlyCategoryData')
          // })
          .then(() => {
            return context.dispatch('calculateAllValues')
          })
          .catch((err) => {
            console.log(err)
          })
      )
    },

    loadLocalBudgetRoot(context) {
      context.commit('GET_REMOTE_SYNC_URL')
      const db = this._vm.$pouch
      context.dispatch('fetchAllBudgetRoots').then(() => {
        context.dispatch('getAllDocsFromPouchDB')
        context.dispatch('fetchBudgetOpened')
        return
      })
    }
  }
}

const validateDocument = (current, previous) => {
  let doc_type = null
  let validation_result = {
    errors: 'Validation schema not found.'
  }

  if (current && current._id) {
    doc_type = docTypeFromId(current._id)
  } else if (!current && previous && previous._id) {
    doc_type = docTypeFromId(previous._id)
  } else if (current && current._id && previous && previous._id) {
    const current_doc_type = docTypeFromId(current._id)
    const previous_doc_type = docTypeFromId(previous._id)
    if (current_doc_type === previous_doc_type) {
      doc_type = current_doc_type
    } else {
      validation_result.errors = 'Current and previous are not of same type'
      doc_type = null
    }
  }

  switch (doc_type) {
    case ID_NAME.transaction:
      validation_result = validateSchema.validate(current, schema_transaction)
      break
    case ID_NAME.category:
      validation_result = validateSchema.validate(current, schema_category)
      break
    case ID_NAME.masterCategory:
      validation_result = validateSchema.validate(current, schema_masterCategory)
      break
    case ID_NAME.account:
      validation_result = validateSchema.validate(current, schema_account)
      break
    case ID_NAME.monthCategory:
      validation_result = validateSchema.validate(current, schema_monthCategory)
      break
    case ID_NAME.payee:
      validation_result = validateSchema.validate(current, schema_payee)
      break
    case ID_NAME.budget:
      validation_result = validateSchema.validate(current, schema_budget)
      break
    case ID_NAME.budgetOpened:
      validation_result = validateSchema.validate(current, schema_budgetOpened)
      break
    default:
      console.error("doesn't recognize doc type ", doc_type)
  }

  if (validation_result.errors.length > 0) {
    this.commit('SET_SNACKBAR_MESSAGE', {
      snackbarMessage: 'Validation failed: ' + validation_result.errors.toString(),
      snackbarColor: 'error'
    })
    console.log('failed validation:', current)
    return false
  } else {
    return doc_type
  }
}
