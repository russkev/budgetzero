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
import { ID_NAME } from '../../constants'
import { databaseExists, docTypeFromId, logPerformanceTime } from '../../helper'
import { parseAllMonthCategories } from '../modules/category-module'
import { parseAllTransactions } from '../modules/transaction-module'
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
        console.log('ACTION: commitBulkDocsToPouchAndVuex failed')
        return context.commit('API_FAILURE', error)
      }
    },

    async validBulkDocs(context, bulk_docs) {
      const database_exists = await databaseExists(this._vm.$pouch)
      if (!database_exists) {
        await context.dispatch('createLocalPouchDB', context)
      }

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
          partial.push({ current, previous, doc_type })
        }
        return partial
      }, [])
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
      const doc_type = validateDocument(context, current, previous)
      if (doc_type) {
        return context.dispatch('commitDocToPouch', { current, previous, doc_type }).then((result) => {
          if (result.ok) {
            if (current) {
              current._rev = result.rev
            }
            return context.dispatch('commitDocToVuex', { current, previous, doc_type }).then(() => result)
          } else {
            console.log(result)
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
          return db.bulkDocs([for_db_current, for_db_previous]).then((results) => {
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

    commitBulkDocsToPouch(context, docs) {
      const db = this._vm.$pouch
      const db_documents = docs.reduce((partial, doc) => {
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

    commitDocToVuex(context, { current, previous, doc_type }) {
      switch (doc_type) {
        case ID_NAME.transaction:
          return context.dispatch('commitTransactionToVuex', { current, previous })
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
      const result = current ? db.put(current) : db.remove(previous)
      return result
    },

    async commitTransactionToVuex(context, { current, previous }) {
      const account = context.getters.accountsById[current.account]
      const transaction_payload = this._vm.calculateTransactionBalanceUpdate(current, previous, account)
      this.commit('UPDATE_ACCOUNT_BALANCES', transaction_payload)

      await context.dispatch('updateCategoryBalance', { current, previous })
      return true
    },

    // updateBalances(context) {
    //   return Promise.all([context.dispatch('fetchAccountBalances'), context.dispatch('fetchBudgetBalances')])
    //     .then((response) => {
    //       return response
    //       // return context.dispatch('calculateMonthlyCategoryData')
    //     })
    //     .catch((error) => {
    //       context.commit('API_FAILURE', error)
    //     })
    // },

    resetAllCurrentBudgetData(context) {
      context.commit('RESET_ACCOUNT_STATE')
      context.commit('RESET_CATEGORY_STATE')
      context.commit('RESET_PAYEES_STATE')
    },

    async loadLocalBudget(context) {
      try {
        await context.dispatch('resetAllCurrentBudgetData')
        context.commit('GET_REMOTE_SYNC_URL')
        const budgets = await context.dispatch('fetchAllBudgets')
        await context.dispatch('updateSelectedBudgetId', budgets)
        context.dispatch('getAllDocsFromPouchDB')
      } catch (error) {
        console.log(error)
        message = error.msg ? error.msg : error
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: message,
          snackbarColor: 'error'
        })
      }
    },

    getAllDocsFromPouchDB(context) {
      return Promise.all([context.dispatch('fetchAccounts'), context.dispatch('fetchPayees')]).then(() => {
        return context.dispatch('calculateAllValues')
      })
    },

    async calculateAllValues({ commit, dispatch, getters }) {
      let month_category_balances = {} // Month Category Balances
      return Promise.all([
        dispatch('fetchCategories'),
        dispatch('fetchMasterCategories'),
        dispatch('fetchMonthCategories')
      ])
        .then((results) => {
          month_category_balances = parseAllMonthCategories(results, getters)
          // console.log('month_category_balances', month_category_balances)
          dispatch('setMonthBudgetedBalances', month_category_balances)
        })
        .then(() => {
          return dispatch('fetchAllTransactions')
        })
        .then((result) => {
          const t1 = performance.now()
          const balances = parseAllTransactions(result.rows, month_category_balances, getters, dispatch)

          logPerformanceTime('calculateAllValues', t1)
          // commit('SET_MONTH_BALANCES', balances.month)
          dispatch('setMonthIncomeExpenseBalances', balances.month)
          commit('SET_ALL_ACCOUNT_BALANCES', balances.account)
          commit('SET_ALL_CATEGORY_BALANCES', balances.category)
          return balances.category
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
    context.commit('SET_SNACKBAR_MESSAGE', {
      snackbarMessage: 'Validation failed: ' + validation_result.errors.toString(),
      snackbarColor: 'error'
    })
    return false
  } else {
    return doc_type
  }
}
