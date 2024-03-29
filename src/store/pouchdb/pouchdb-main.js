import {
  schema_budget,
  schema_account,
  schema_transaction,
  schema_category,
  schema_monthCategory,
  schema_masterCategory,
  schema_payee,
  validateSchema
} from '../validation'
import _ from 'lodash'
import { ID_NAME, LOCAL_DB_NAME } from '../../constants'
import { databaseExists, docTypeFromId, logPerformanceTime } from '../../helper'
import { parseAllMonthCategories } from '../modules/category-module'
import { parseAllTransactions } from '../modules/transaction-module'
import PouchDB from 'pouchdb'
/**
 * This pouchdb vuex module contains code that interacts with the pouchdb database.
 */

export default {
  actions: {
    /**
     * Bulk commits list of documents to pouchdb.
     * The calling component is responsible for updating current list to be in sync with store.
     * @param {array} payload [{current, previous}] The  documents to commit to pouchdb
     */
    async commitBulkDocsToPouchAndVuex(context, bulk_docs) {
      const valid_documents = await context.dispatch('validBulkDocs', bulk_docs)
      try {
        const results = await context.dispatch('commitBulkDocsToPouch', valid_documents)
        const results_by_id = results.reduce((partial, result) => {
          partial[result.id] = result
          return partial
        }, {})

        const vuex_documents = valid_documents.reduce((partial, doc) => {
          const id = doc.current ? doc.current._id : doc.previous ? doc.previous._id : null
          if (id && results_by_id[id] !== undefined && results_by_id[id].ok) {
            const rev = results_by_id[id].rev
            if (doc.current) {
              doc.current._rev = rev
            }
            partial.push(doc)
          }
          return partial
        }, [])
        context.dispatch('commitDocsToVuex', vuex_documents)
      } catch (error) {
        return console.error('API_FAILURE', error)
      }
    },

    /**
     * Commit bulk docs to pouchdb only.
     * Useful for cases where you want to update vuex manually
     * @param {array} payload [{current, previous}] The  documents to commit to pouchdb
     */
    commitBulkDocsToPouchOnly({ dispatch }, bulk_docs) {
      return dispatch('validBulkDocs', bulk_docs).then((valid_docs) => {
        return dispatch('commitBulkDocsToPouch', valid_docs)
      })
    },

    databaseExists() {
      const db = this._vm.$pouch
      // const db = new PouchDB(LOCAL_DB_NAME, { skip_setup: true })
      return db
        .info()
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    },

    async ensureDatabaseExists({ dispatch }) {
      const databaseExists = await dispatch('databaseExists')
      if (!databaseExists) {
        await dispatch('createLocalPouchDB')
        await dispatch('resetAndFetchAllDocsFromPouchDB')
      }
      return
    },

    async validBulkDocs(context, bulk_docs) {
      await context.dispatch('ensureDatabaseExists')

      return bulk_docs.reduce((partial, doc) => {
        let doc_type = ''

        if (doc.current !== undefined && doc.previous !== undefined) {
          doc_type = validateDocument(context, doc.current, doc.previous)
        } else {
          console.warn('commitBulkDocsToPouchAndVuex requires payload of type [{current, previous}]')
        }
        if (!doc_type) {
          console.warn('Invalid document provided to commitBulkDocsToPouchAndVuex', doc)
        } else {
          const current = doc.current ? { ...doc.current } : null
          const previous = doc.previous ? { ...doc.previous } : null
          partial.push({ current, previous, doc_type, is_multiple: true })
        }
        return partial
      }, [])
    },

    /**
     * Commits single document to pouchdb and then calls UPDATE_VUE_DOCUMENT to update current document list.
     * @param {doc} document The document to commit to pouchdb
     */
    commitDocToPouchAndVuex(context, { current, previous }) {
      if (!current && !previous) {
        console.warn(`commitDocToPouchAndVuex called with invalid 'current' and 'previous'`)
        return
      }
      const doc_type = validateDocument(context, current, previous)
      if (doc_type) {
        return context
          .dispatch('commitDocToPouch', { current, previous, doc_type, is_multiple: false })
          .then((result) => {
            if (result && result.ok) {
              if (current) {
                current._rev = result.rev
              }
              return context
                .dispatch('commitDocToVuex', { current, previous, doc_type, is_multiple: false })
                .then(() => result)
            } else {
              Promise.reject(`Pouch update failed`)
            }
          })
      } else {
        Promise.reject(`Invalid document type: ${doc_type}`)
      }
    },

    commitDocToPouch(context, { current, previous, doc_type }) {
      const db = this._vm.$pouch
      if (current) {
        const current_account = context.getters.accountsById[current.account]
        if (doc_type === ID_NAME.transaction && current_account) {
          current = { ...current, value: current.value * current_account.sign }
        }
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
          return db
            .bulkDocs([for_db_current, for_db_previous])
            .then((results) => {
              const all_successful = results.reduce((partial, result) => {
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
              }
            })
            .catch((error) => {
              console.error('Unable to commit doc to pouchdb', for_db_current)
              console.error(error)
            })
        } else {
          return db.put(current).catch((error) => {
            console.error('Unable to commit doc to pouchdb', current)
            console.error(error)
          })
        }
      } else {
        return db.remove(previous).catch((error) => {
          console.error('Unable to remove doc form pouchdb', previous)
          console.error(error)
        })
      }
    },

    /**
     * Internal method for committing multiple docs to pouch only
     * @param {array} valid_docs [{current, previous}] Validated documents to commit to pouchdb
     */
    commitBulkDocsToPouch(context, valid_docs) {
      const db = this._vm.$pouch
      const db_documents = valid_docs.reduce((partial, doc) => {
        if (doc.doc_type === ID_NAME.none) {
          return partial
        }
        if (doc.current) {
          partial.push(doc.current)
        } else if (doc.previous) {
          partial.push({ ...doc.previous, _deleted: true })
        }
        return partial
      }, [])
      return db.bulkDocs(db_documents)
    },
    commitRestoreBulkDocsToPouch({}, docs) {
      const db = this._vm.$pouch
      return db.bulkDocs(docs).catch((error) => {
        console.log('Unable to commit bulk docs to pouch')
        console.log(error)
      })
    },

    commitBulkNewDocsToPouch(context, docs) {
      const db = this._vm.$pouch
      return db.bulkDocs(docs)
    },

    commitDocsToVuex(context, documents) {
      const commitIndividuallyTypes = new Set([ID_NAME.transaction, ID_NAME.monthCategory, ID_NAME.budget])

      const documentsByType = documents.reduce((partial, payload) => {
        _.defaults(partial, { [payload.doc_type]: [] })
        partial[payload.doc_type].push(payload)
        return partial
      }, {})

      Object.entries(documentsByType).map(([doc_type, docs]) => {
        if (commitIndividuallyTypes.has(doc_type)) {
          return Promise.all(
            docs.map((doc) => {
              context.dispatch('commitDocToVuex', doc)
            })
          )
        } else {
          // Data will be refreshed from database
          return context.dispatch('commitDocToVuex', { current: null, previous: null, doc_type: doc_type })
        }
      })
    },

    commitDocToVuex(context, { current, previous, doc_type, is_multiple }) {
      switch (doc_type) {
        case ID_NAME.transaction:
          return context.dispatch('commitTransactionToVuex', { current, previous, is_multiple })
        case ID_NAME.category:
          return context.dispatch('fetchCategories')
        case ID_NAME.masterCategory:
          return context.dispatch('fetchMasterCategories')
        case ID_NAME.account:
          return context.dispatch('fetchAccounts')
        case ID_NAME.monthCategory:
          return context.dispatch('commitMonthCategoryToVuex', { current, previous })
        case ID_NAME.payee:
          return
        case ID_NAME.budget:
          return context.dispatch('commitBudgetToVuex', { current, previous })
        case ID_NAME.none:
          return
        default:
          console.error("doesn't recognize doc type ", doc_type)
          return
      }
    },

    async commitDocToDb(context, { current, previous }) {
      const db = this._vm.$pouch
      try {
        const result = current ? db.put(current) : db.remove(previous)
        return result
      } catch (error) {
        console.error(error)
      }
    },

    async commitTransactionToVuex({ getters, dispatch, commit }, { current, previous, is_multiple }) {
      let account = null
      if (current) {
        account = getters.accountsById[current.account]
      } else if (previous) {
        account = getters.accountsById[previous.account]
      }

      if (current && !previous) {
        commit('INCREMENT_ACCOUNT_TRANSACTION_COUNTS_BY', { account_id: current.account, increment: 1 })
        commit('ADD_IMPORT_ID', {
          account_id: current.account,
          transaction_id: current._id,
          import_id: current.importId
        })
      } else if ((!current && previous) || (current && _.get(current, '_deleted', false))) {
        commit('INCREMENT_ACCOUNT_TRANSACTION_COUNTS_BY', { account_id: previous.account, increment: -1 })
        commit('REMOVE_IMPORT_ID', { account_id: previous.account, import_id: previous.importId })
      }

      if (!account) {
        console.error('account not found from either current or previous', current, previous)
        return
      }
      const transaction_payload = this._vm.calculateTransactionBalanceUpdate(current, previous, account)
      commit('UPDATE_ACCOUNT_BALANCES', transaction_payload)

      dispatch('updateCategoryBalance', { current, previous })
      return true
    },

    resetAllCurrentBudgetData(context) {
      context.commit('RESET_ACCOUNT_STATE')
      context.commit('RESET_CATEGORY_STATE')
      context.commit('RESET_PAYEES_STATE')
    },

    async resetAndFetchAllDocsFromPouchDB({ commit, dispatch }) {
      commit('SET_LOADING_FULLSCREEN', true)
      try {
        await dispatch('resetAllCurrentBudgetData')
        commit('GET_REMOTE_SYNC_URL')
        await dispatch('fetchSelectedBudgetId')
        dispatch('getAllDocsFromPouchDB')
      } catch (error) {
        console.log(error)
        const message = error.msg ? error.msg : error
        commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: message,
          snackbarColor: 'error'
        })
      } finally {
        commit('SET_LOADING_FULLSCREEN', false)
      }
    },

    async fetchSelectedBudgetId({ dispatch }) {
      const budgets = await dispatch('fetchAllBudgets')
      return await dispatch('updateSelectedBudgetId', budgets)
    },

    /* Get and recalculate all budget data */
    getAllDocsFromPouchDB({ dispatch, getters, commit }) {
      let loadingFullScreenSet = false
      if (!getters.isLoadingFullscreen) {
        commit('SET_LOADING_FULLSCREEN', true)
        loadingFullScreenSet = true
      }
      return Promise.all([dispatch('fetchAccounts'), dispatch('fetchPayees')])
        .then(() => {
          return dispatch('calculateAllValues')
        })
        .finally(() => {
          if (loadingFullScreenSet) {
            commit('SET_LOADING_FULLSCREEN', false)
          }
        })
    },

    async calculateAllValues({ commit, dispatch, getters }) {
      let month_category_balances = {} // Month Category Balances
      return Promise.all([
        dispatch('initCategories'),
        dispatch('initMasterCategories'),
        dispatch('fetchMonthCategories')
      ])
        .then((results) => {
          month_category_balances = parseAllMonthCategories(results[2], getters)
          dispatch('setMonthBudgetedBalances', month_category_balances)
        })
        .then(() => {
          return dispatch('fetchAllTransactions')
        })
        .then((result) => {
          const t1 = performance.now()
          const balances = parseAllTransactions(result.rows, month_category_balances, getters, dispatch, commit)
          logPerformanceTime('calculateAllValues', t1)
          dispatch('setMonthIncomeExpenseBalances', balances.month)
          commit('SET_ALL_ACCOUNT_BALANCES', balances.account)
          commit('SET_ALL_CATEGORY_BALANCES', balances.category)
          return balances.category
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}

const validateDocument = (context, current, previous) => {
  let doc_type = null
  let validation_result = {
    errors: 'Validation schema not found.'
  }
  let doc = current
  if (current && current._id && previous && previous._id) {
    const current_doc_type = docTypeFromId(current._id)
    const previous_doc_type = docTypeFromId(previous._id)
    if (current_doc_type === previous_doc_type) {
      doc_type = current_doc_type
    } else {
      validation_result.errors = 'Current and previous are not of same type'
      doc_type = null
    }
  } else if (current && current._id) {
    doc_type = docTypeFromId(current._id)
  } else if (!current && previous && previous._id) {
    doc_type = docTypeFromId(previous._id)
    doc = previous
  }
  if (doc_type === ID_NAME.none) {
    return doc_type
  }

  switch (doc_type) {
    case ID_NAME.transaction:
      validation_result = validateSchema.validate(doc, schema_transaction)
      break
    case ID_NAME.category:
      validation_result = validateSchema.validate(doc, schema_category)
      break
    case ID_NAME.masterCategory:
      validation_result = validateSchema.validate(doc, schema_masterCategory)
      break
    case ID_NAME.account:
      validation_result = validateSchema.validate(doc, schema_account)
      break
    case ID_NAME.monthCategory:
      validation_result = validateSchema.validate(doc, schema_monthCategory)
      break
    case ID_NAME.payee:
      validation_result = validateSchema.validate(doc, schema_payee)
      break
    case ID_NAME.budget:
      validation_result = validateSchema.validate(doc, schema_budget)
      break
    default:
      console.error("doesn't recognize doc type ", doc_type)
  }

  if (validation_result.errors.length > 0) {
    console.error('Validation failed', validation_result.errors.toString())
    context.commit('SET_SNACKBAR_MESSAGE', {
      snackbarMessage: 'Validation failed: ' + validation_result.errors.toString(),
      snackbarColor: 'error'
    })
    return false
  } else {
    return doc_type
  }
}
