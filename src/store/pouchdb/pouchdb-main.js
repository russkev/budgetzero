import {
  schema_budget,
  // schema_budgetOpened,
  schema_account,
  schema_transaction,
  schema_category,
  schema_monthCategory,
  schema_masterCategory,
  schema_payee,
  validateSchema
} from '../validation'
import _ from 'lodash'
import { ID_NAME, } from '../../constants'
import { databaseExists, docTypeFromId } from '../../helper'
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

        return Promise.all(
          valid_documents.map((valid_document) => {
            const id = valid_document.current ? valid_document.current._id : valid_document.previous._id
            if (results_by_id[id] !== undefined && results_by_id[id].ok) {
              valid_document._rev = results_by_id[id].rev
              return context.dispatch('commitDocToVuex', valid_document)
            }
          })
        )
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
        return context.dispatch('commitDocToPouch', { current, previous, doc_type }).then((result) => {
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
      } else {
        Promise.reject('Invalid document type')
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

    commitDocsToPouch(context, docs) {
      const db = this._vm.$pouch
      return db.bulkDocs(docs)
    },

    commitDocToVuex(context, { current, previous, doc_type }) {
      switch (doc_type) {
        case ID_NAME.transaction:
          return context.dispatch('commitTransactionToVuex', { current, previous })
        case ID_NAME.category:
          return
        case ID_NAME.masterCategory:
          return
        case ID_NAME.account:
          return context.dispatch('fetchAccounts')
        case ID_NAME.monthCategory:
          return context.dispatch('commitMonthCategoryToVuex', { current, previous })
        case ID_NAME.payee:
          return
        case ID_NAME.budget:
          return context.dispatch('commitBudgetToVuex', { current, previous })
        // case ID_NAME.budgetOpened:
        //   return context.dispatch('commitBudgetOpened', { current, previous })
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

    resetAllCurrentBudgetData(context) {
      context.commit('RESET_ACCOUNT_STATE')
      context.commit('RESET_CATEGORY_STATE')
      context.commit('RESET_PAYEES_STATE')
    },

    getAllDocsFromPouchDB(context) {
      return Promise.all([context.dispatch('fetchAccounts'), context.dispatch('fetchPayees')]).then(() => {
        return context.dispatch('calculateAllValues')
      })
    },

    async loadLocalBudget(context) {
      try {
        await context.dispatch('resetAllCurrentBudgetData')
        context.commit('GET_REMOTE_SYNC_URL')
        const budgets = await context.dispatch('fetchAllBudgets')
        await context.dispatch('updateSelectedBudgetId', budgets)
        context.dispatch('getAllDocsFromPouchDB')
        // context.dispatch('fetchBudgetOpened')
      } catch (error) {
        console.log(error)
        message = error.msg ? error.msg : error
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: message,
          snackbarColor: 'error'
        })
      }
    }
  }
}

const validateDocument = (current, previous) => {
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
  }
  else if (current && current._id) {
    doc_type = docTypeFromId(current._id)
  } else if (!current && previous && previous._id) {
    doc_type = docTypeFromId(previous._id)
    doc = previous
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
    // case ID_NAME.budgetOpened:
    //   validation_result = validateSchema.validate(doc, schema_budgetOpened)
    //   break
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
