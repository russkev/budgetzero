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
import { ID_LENGTH, ID_NAME, DEFAULT_ACCOUNT_BALANCE,  } from '../../constants'
import { databaseExists, docTypeFromId, extractMonthCategoryMonth } from '../../helper'
import Vue from 'vue'
/**
 * This pouchdb vuex module contains code that interacts with the pouchdb database.
 */

// const DEFAULT_STATE = {
//   // accountBalances: {},

// }

export default {
  // state: {
  //   ...DEFAULT_STATE
  // },
  // getters: {
  //   //Plain getters for main doc types

  //   // masterCategories: (state) => state.masterCategories,


  //   // listOfImportIds: (state) => state.transactions.map((transaction) => _.get(transaction, 'importID', '')),


  //   // category_map: (state, getters) =>
  //   //   getters.categories.reduce((map, obj) => {
  //   //     const id = obj._id ? obj._id.slice(-ID_LENGTH.category) : null
  //   //     map[id] = obj.name
  //   //     return map
  //   //   }, {}),



  // },
  // mutations: {




    // DELETE_LOCAL_DB(state) {
    //   const default_state = JSON.parse(JSON.stringify(DEFAULT_STATE))
    //   Object.keys(default_state).forEach((key) => {
    //     state[key] = default_state[key]
    //   })
    // },


  //   UPDATE_VUE_DOCUMENT(state, { payload, index, docType }) {
  //     switch (docType) {
  //       case ID_NAME.transaction:
  //         if (isNaN(index)) {
  //           state.transactions = [...state.transactions, payload]
  //         } else {
  //           Object.assign(state.transactions[index], payload)
  //         }
  //         break
  //       case ID_NAME.category:
  //         if (isNaN(index)) {
  //           state.categories.push(payload)
  //         } else {
  //           Object.assign(state.categories[index], payload)
  //         }
  //         break
  //       case ID_NAME.masterCategory:
  //         if (isNaN(index)) {
  //           state.masterCategories.push(payload)
  //           console.log('masterCategory no index...', payload)
  //         } else {
  //           Object.assign(state.masterCategories[index], payload)
  //         }
  //         break
  //       case ID_NAME.account:
  //         if (isNaN(index)) {
  //           this.commit('SET_ACCOUNTS', state.accounts.concat(payload))
  //           // state.accounts.push(payload)
  //           console.log('account no index...', payload)
  //         } else {
  //           Object.assign(state.accounts[index], payload)
  //         }
  //         break
  //       case ID_NAME.monthCategory:
  //         if (isNaN(index)) {
  //           state.monthCategoryBudgets.push(payload)
  //         } else {
  //           Object.assign(state.monthCategoryBudgets[index], payload)
  //         }
  //         break
  //       case ID_NAME.payee:
  //         if (isNaN(index)) {
  //           state.payees.push(payload)
  //         } else {
  //           Object.assign(state.payees[index], payload)
  //         }
  //         break
  //       case ID_NAME.budget:
  //         //TODO: validate
  //         if (isNaN(index)) {
  //           state.budgetRoots.push(payload)
  //         } else {
  //           Object.assign(state.budgetRoots[index], payload)
  //         }
  //         break
  //       case ID_NAME.budgetOpened:
  //         //TODO: validate
  //         if (isNaN(index)) {
  //         } else {
  //         }
  //         break
  //       default:
  //         console.error("doesn't recognize doc type ", docType)
  //     }
  //   },
  // },
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
          return context.dispatch('fetchAccounts')
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
    case ID_NAME.budgetOpened:
      validation_result = validateSchema.validate(doc, schema_budgetOpened)
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
