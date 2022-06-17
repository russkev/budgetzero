import Vue from 'vue'
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
import _, { result, sum } from 'lodash'
import moment from 'moment'
import PouchDB from 'pouchdb'
import mock_budget from '@/../tests/__mockdata__/mock_budget2.json'
import { ID_LENGTH, ID_NAME, DEFAULT_STATE, DEFAULT_BALANCE, INITIAL_MONTH_CATEGORIES } from '../../constants'
import {
  fetchAccountBalances,
  fetchBudgetBalances,
  fetchAccounts,
  fetchAllBudgetRoots,
  fetchCategories,
  fetchMasterCategories,
  fetchMonthCategories,
  fetchTransactionsForAccount,
} from '../pouchdb/pouchdb-fetch'
import { initializeDesignDocs, initializeNewLocalDB } from '../pouchdb/pouchdb-init'
import { deleteDatabase } from '../pouchdb/pouchdb-delete'
import { databaseExists, docTypeFromId, getMonthCategoryDate } from '../../helper'
import { doExportBudgetAsJSON, doExportSelectedBudgetAsJSON } from '../pouchdb/pouchdb-export'

var FileSaver = require('file-saver')

/**
 * This pouchdb vuex module contains code that interacts with the pouchdb database.
 */

export default {
  state: {
    ...DEFAULT_STATE
  },
  getters: {
    remoteSyncURL: (state) => state.remoteSyncURL,
    //Plain getters for main doc types
    transactions: (state) => state.transactions,
    accounts: (state) => state.accounts,
    // masterCategories: (state) => state.masterCategories,
    masterCategories: (state) => [...state.masterCategories].sort((a, b) => (a.sort > b.sort ? 1 : -1)),
    monthCategoryBudgets: (state) => {
      // console.log("STATE")
      // console.log(state.monthCategoryBudgets)
      // return state.monthCategoryBudgets.map((row) => {
      //   // Extract date from the id and add it as a separate property
      //   const date_regex = /(?<=\_)[0-9]{4}\-[0-9]{2}(?=\_)/
      //   const date = row._id.match(date_regex)
      //   console.log(date)
      //   if (date.length > 0) {
      //     row.date = date[0]
      //   } else {
      //     row.date = ''
      //   }
      //   return row
      // })
      console.log('monthCategoryBudgets')
      console.log(state.monthCategoryBudgets)
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
      console.log(result)
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
      return [
        ...INITIAL_MONTH_CATEGORIES,
        ...state.categories
      ]
    },
    categoriesByTruncatedId: (state) => {
      return state.categories.reduce((partial, category) => {
        partial[category._id.slice(-ID_LENGTH.category)] = category
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

    listOfImportIds: (state) => state.transactions.map((trn) => _.get(trn, 'importID', '')),
    budgetRoots: (state) => state.budgetRoots,
    budgetRootsMap: (state, getters) => {
      return getters.budgetRoots.reduce((map, budget_root) => {
        if (budget_root._id) {
          map[budget_root._id.slice(-ID_LENGTH.budget)] = budget_root
          return map
        }
      }, {})
      //   budget_root = JSON.parse(JSON.stringify(obj))

      //   if (budget_root.id) {
      //     budget_root.short_id =
      //   }
      //   const id = budget_root._id ? budgetRoot._id.slice(-ID_LENGTH.budget) : null
      //   obj.short_id = obj._id.slice(-ID_LENGTH.budget)
      //   map[id] = obj
      //   return map
      // }, {})
    },

    budgetOpened: (state) =>
      state.budgetOpened.map((row) => {
        var obj = row.doc
        // obj.short_id = obj._id.slice(-ID_LENGTH.budget)
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
      // console.log(getters.accounts)
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
    // // Used for lookups with cleared/uncleared account info. Used for sidebar and transaciton view header?
    // accountBalances: (state, getters) => {
    //   return state.accountBalances
    //   // // console.log('ACCOUNT BALANCES')
    //   // // console.log(state.accountBalances)
    //   // // console.log(state.accounts)
    //   // const result =  state.accounts.reduce((balances, account) => {
    //   //   if (state.accountBalances[account] !== undefined) {
    //   //     balances[account] = {
    //   //       working: state.accountBalances[account].working
    //   //     } + state.accountBalances[account].working
    //   //   } else {
    //   //     return balances + 0
    //   //   }
    //   // }, {})
    //   // console.log(result)
    //   // return result
    // },
    // const accountBalances = getters.transactions.reduce((map, obj) => {
    //   const amt = obj.value ? obj.value : 0

    //   if (!(obj.account in map)) {
    //     map[obj.account] = { cleared: 0, uncleared: 0, working: 0 }
    //   }

    //   if (obj.cleared) {
    //     map[obj.account].cleared += amt
    //   } else {
    //     map[obj.account].uncleared += amt
    //   }

    //   map[obj.account].working += amt

    //   return map
    // }, {})

    // getters.accounts.forEach((account) => {
    //   // Add in missing account keys
    //   if (!(account._id.slice(-ID_LENGTH.account) in accountBalances)) {
    //     accountBalances[account._id.slice(-ID_LENGTH.account)] = { cleared: 0, uncleared: 0 }
    //   }
    // })
    // return accountBalances
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
    // SET_POUCHDB_DOCS(state, response) {
    //   const data = response.map((row) => row.doc)
    //   state.transactions = data.filter((row) => row._id.includes(ID_NAME.transaction))
    //   state.monthCategoryBudgets = data.filter((row) => row._id.includes(ID_NAME.monthCategory))
    //   state.payees = data.filter((row) => row._id.includes(ID_NAME.payee))
    //   state.masterCategories = data.filter((row) => row._id.includes(ID_NAME.masterCategory))
    //   state.accounts = data.filter((row) => row._id.includes(ID_NAME.account))
    //   state.categories = data
    //     .filter((row) => row._id.includes(ID_NAME.category))
    //     .filter((row) => !row._id.includes(ID_NAME.monthCategory)) //Don't include budget docs
    // },
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
      console.log("SET CATEGORIES")
      console.log(categories)
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
    UPDATE_ACCOUNT(state, {index, value}) {
      // Object.assign(state.accounts[index], value)
      // console.log("UPDATE ACCOUNT")
      // console.log(state.accounts)
      // console.log(payload)
      // console.log(value)
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
      console.log(balances)
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
    GET_REMOTE_SYNC_URL(state) {
      if (localStorage.remoteSyncURL) {
        this.state.pouchdb.remoteSyncURL = localStorage.remoteSyncURL
        this.dispatch('startRemoteSyncToCustomURL', localStorage.remoteSyncURL)
      }
    },
    SET_REMOTE_SYNC_URL(state, url) {
      this.state.pouchdb.remoteSyncURL = url
      localStorage.remoteSyncURL = url
    },
    CLEAR_REMOTE_SYNC_URL(state) {
      localStorage.removeItem('remoteSyncURL')
      this.state.pouchdb.remoteSyncURL = ''
    },
    SET_SYNC_HANDLER(state, syncHandler) {
      this.state.pouchdb.syncHandle = syncHandler
    },

    DELETE_DOCUMENT(state, payload) {
      // Only works for deleting transactions. In the future may need to delete other types of docs.
      const index = state.transactions.findIndex((row) => row._id == payload.id)
      state.transactions.splice(index, 1)
    },
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
        // budget.doc.short_id = budget.doc._id.slice(-ID_LENGTH.budget)
        return budget.doc
        // return budget.id
      })
    },
    SET_BUDGET_OPENED(state, payload) {
      // payload.short_id = payload._id.slice(-ID_LENGTH.budget)
      state.budgetOpened = payload
    },
    UPDATE_VUE_DOCUMENT(state, { payload, index, docType }) {
      switch (docType) {
        case ID_NAME.transaction:
          if (isNaN(index)) {
            state.transactions = [...state.transactions, payload]
            // state.transactions.push(payload)
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
          // payload.short_id = payload._id.slice(-ID_LENGTH.budget)
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
    initiateSync(context) {
      context.dispatch('GET_REMOTE_SYNC_URL')
    },
    startRemoteSyncToCustomURL(context, url) {
      var url_expression =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
      var url_regex = new RegExp(url_expression)

      if (!url || !url.match(url_regex)) {
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Invalid URL provided',
          snackbarColor: 'error'
        })
        context.dispatch('cancelRemoteSync')
        return
      }

      var remoteDB = new PouchDB(url)

      context.commit('SET_REMOTE_SYNC_URL', url)

      remoteDB
        .info()
        .then((info) => {
          context.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: 'Connection to remote database success!',
            snackbarColor: 'primary'
          })
        })
        .catch((err) => {
          context.commit('SET_SNACKBAR_MESSAGE', { snackbarMessage: err, snackbarColor: 'error' })
          console.log('Failed to connect')
          console.log(err)
          context.dispatch('cancelRemoteSync')
          return
        })

      const sync = this._vm.$pouch
        .sync(remoteDB, {
          live: true,
          retry: true
        })
        .on('change', function (change) {
          context.commit('SET_STATUS_MESSAGE', `Last sync [change] ${moment().format('MMM D, h:mm a')}`)
          console.log('change detected')
          console.log('!!! NOT GETING NEW CHANGES FROM LOCAL DB !!!')
          // context.dispatch('getAllDocsFromPouchDB')
        })
        .on('complete', function (change) {
          context.commit('SET_STATUS_MESSAGE', `Last sync [complete] ${moment().format('MMM D, h:mm a')}`)
          console.log('pouch sync complete')
        })
        .on('paused', function (info) {
          context.commit('SET_STATUS_MESSAGE', `Last sync ${moment().format('MMM D, h:mm a')}`)
          console.log('paused:', info)
          // replication was paused, usually because of a lost connection
        })
        .on('active', function (info) {
          context.commit('SET_STATUS_MESSAGE', `active`)
          // replication was resumed
        })
        .on('error', function (err) {
          context.commit('SET_STATUS_MESSAGE', err)
          console.error('Sync error', err)
        })

      Vue.prototype.$pouchSyncHandler = sync
    },

    cancelRemoteSync(context) {
      if (Vue.prototype.$pouchSyncHandler) {
        Vue.prototype.$pouchSyncHandler.cancel()
      }
      context.commit('SET_STATUS_MESSAGE', 'Sync disabled')
    },

    clearRemoteSync(context) {
      context.dispatch('cancelRemoteSync')
      context.commit('CLEAR_REMOTE_SYNC_URL')
    },

    getAllDocsFromPouchDB(context) {
      const db = this._vm.$pouch

      fetchAccounts(context, db).then(() => {
        return fetchAccountBalances(context, db)
      })
      fetchTransactionsForAccount(context, db)
      // const category_promises = [
      //   fetchMasterCategories(context, db),
      //   fetchCategories(context, db),
      //   fetchMonthCategories(context, db),
      // ]
      return Promise
        .all([
          fetchMasterCategories(context, db),
          fetchCategories(context, db),
          fetchMonthCategories(context, db)
        ])
        .then((results) => {
          console.log("RESULTS")
          console.log(results)
          return fetchBudgetBalances(context, db)
        })
        .then(() => {
          return context.dispatch('calculateMonthlyData')
        })
    },
    // fetchAccounts(context, db)
    //   // .then((result) => {
    //   //   return context.commit('SET_ACCOUNTS', result)
    //   // })
    //   .then(() => {
    //     return fetchAccountBalances(context, db)
    //   })
    //   // .then((result) => {
    //   //   return context.commit('SET_ACCOUNT_BALANCES', result)
    //   // })
    // fetchTransactionsForAccount(context, db)
    // // .then((result) => {
    // //   context.commit('SET_TRANSACTIONS', result)
    // // })

    // // fetchTransactionsForAccount(context, db)
    // //   .then((result) => {
    // //     context.commit('SET_POUCHDB_TRANSACTIONS', result)
    // //   })

    // getAllDocsFromPouchDB(context) {
    //   console.log('getAllDocsFromPouchDB')
    //   const t1 = performance.now()
    //   return this._vm.$pouch
    //     .allDocs({
    //       limit: 100,
    //       include_docs: true,
    //       attachments: false,
    //       startkey: `b_${context.rootState.selectedBudgetID}`,
    //       endkey: `b_${context.rootState.selectedBudgetID}\ufff0`
    //     })
    //     .then((result) => {
    //       const t2 = performance.now()
    //       console.log(
    //         `DB PERFORMANCE: getAllDocsFromPouchDB TIME: ${t2 - t1} milliseconds, (${((t2 - t1) / 1000.0)
    //           .toFixed(4)
    //           .toString()}) seconds)`
    //       )
    //       console.log(result)
    //       context.commit('SET_POUCHDB_DOCS', result.rows)
    //       context.dispatch('calculateMonthlyData')
    //     })
    //     .catch((err) => {
    //       context.commit('API_FAILURE', err)
    //     })
    // },

    /**
     * Commits single document to pouchdb and then calls UPDATE_VUE_DOCUMENT to update current document list.
     * @param {doc} document The document to commit to pouchdb
     */
    commitDocToPouchAndVuex(context, document) {
      console.log('commitDocToPouchAndVuex')
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

      // this.commit("SET_SNACKBAR_MESSAGE", {snackbarMessage: `${docType} updated.`, snackbarColor: "primary"});

      //Commit to Pouchdb
      const db = this._vm.$pouch
      return new Promise((resolve, reject) => {
        db
          .put(document)
          .then((response) => {
            // document._rev = response.rev
            context.commit('UPDATE_VUE_DOCUMENT', { 
              payload: {... document, _rev: response.rev}, 
              index, docType 
            })
            fetchAccountBalances(context, db)
            context.dispatch('calculateMonthlyData')

            resolve(response)
          })
          .catch((error) => {
            reject(error)
            context.commit('API_FAILURE', error)
          })
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
        .then((response) => {
          console.log('ACTION: commitBulkDocsToPouchAndVuex succeeded', response)
          return context.dispatch('loadLocalBudgetRoot')
        })
        .catch((err) => {
          console.log('ACTION: commitBulkDocsToPouchAndVuex failed')
          return context.commit('API_FAILURE', err)
        })
    },

    // /**
    //  * Deletes single document from pouchdb and then calls DELETE_DOCUMENT to remove from current list.
    //  * @param {doc} payload The document to commit to pouchdb
    //  */
    // deleteDocFromPouchAndVuex(context, payload) {
    //   console.log('deleteDocFromPouchAndVuex', payload)
    //   this._vm.$pouch
    //     .remove(payload)
    //     .then((result) => {
    //       context.commit('DELETE_DOCUMENT', result)
    //     })
    //     .catch((err) => {
    //       context.commit('API_FAILURE', err)
    //     })
    // },

    // /**
    //  * Deletes bulk documents from pouchdb.
    //  * @param {array} payload The documents to delete.
    //  */
    // deleteBulkDocumentsFromPouchAndVuex(context, payload) {
    //   payload.map((trans) => (trans._deleted = true))
    //   context.dispatch('commitBulkDocsToPouchAndVuex', payload).then((response) => {
    //     context.dispatch('getAllDocsFromPouchDB') //TODO: reloads everything after bulk delete...not that efficient?
    //   })
    // },

    // /**
    //  * Delete the entire pouchdb database. If there's a remote, then the database will just re-sync.
    //  *
    //  */
    // eraseAllDocs(context) {
    //   this._vm.$pouch.erase().then(function (resp) {
    //     console.log(resp) //{ok: true}
    //   })
    // },

    // deleteTransactions({ getters, dispatch }) {
    //   return new Promise((resolve, reject) => {
    //     var db = this._vm.$pouch
    //     let accounts = getters.transactions_by_account
    //     let account_ids = Object.keys(accounts)

    //     account_ids.forEach((account_id) => {
    //       let account_transactions = accounts[account_id]
    //       account_transactions.map(function (transaction) {
    //         return db.remove(transaction._id, transaction._rev)
    //       })
    //     })

    //     dispatch('getAllDocsFromPouchDB')
    //     db.compact()
    //       .then(function (info) {
    //         // compaction complete
    //         console.log('compact complete')
    //         resolve(info)
    //       })
    //       .catch(function (err) {
    //         // handle errors
    //         console.log(`compact failed: ${err}`)
    //         reject(err)
    //       })
    //   })
    // },

    // /**
    //  * Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate deletion to remote databases.
    //  *
    //  */
    // deleteAllDocs(context) {
    //   var db = this._vm.$pouch

    //   db.allDocs()
    //     .then(function (result) {
    //       // Promise isn't supported by all browsers; you may want to use bluebird
    //       return Promise.all(
    //         result.rows.map(function (row) {
    //           return db.remove(row.id, row.value.rev)
    //         })
    //       )
    //     })
    //     .then(function (result) {
    //       console.log('all docs deleted')
    //       context.dispatch('getAllDocsFromPouchDB')

    //       db.compact()
    //         .then(function (info) {
    //           // compaction complete
    //           console.log('compact complete')
    //         })
    //         .catch(function (err) {
    //           console.log(`compact failed: ${err}`)
    //           // handle errors
    //         })
    //       // done!
    //     })
    //     .catch(function (err) {
    //       console.log('error', err)
    //       // error!
    //     })
    // },

    // loadMockData(context) {
    //   context.dispatch('commitBulkDocsToPouchAndVuex', mock_budget).then((result) => {
    //     context.dispatch('loadLocalBudgetRoot')
    //   })
    // },

    exportBudgetAsJSON(context) {
      const db = this._vm.$pouch
      return doExportBudgetAsJSON(db)
    },

    exportSelectedBudgetAsJSON(context){
      const db = this._vm.$pouch
      return doExportSelectedBudgetAsJSON(context, db)
    },

    // exportBudgetAsJSON(context) {
    //   return this._vm.$pouch
    //     .allDocs({
    //       include_docs: true,
    //       attachments: true
    //     })
    //     .then((result) => {
    //       console.log('exportBudgetAsJSON', JSON.stringify(result))
    //       const export_date = new Date()

    //       const reformattedExport = result.rows
    //         .map((row) => row.doc)
    //         .map((row) => {
    //           delete row['_rev'] //Delete rev field to prevent conflicts on restore
    //           return row
    //         })

    //       var blob = new Blob([JSON.stringify(reformattedExport)], {
    //         type: 'text/plain;charset=utf-8'
    //       })
    //       FileSaver.saveAs(blob, `BudgetZero_Export_${export_date.toISOString()}.txt`)
    //     })
    //     .catch((err) => {
    //       console.log(err)
    //     })
    // },

    // exportSelectedBudgetAsJSON(context) {
    //   return this._vm.$pouch
    //     .allDocs({
    //       include_docs: true,
    //       attachments: true,
    //       startkey: `b_${context.rootState.selectedBudgetID}`,
    //       endkey: `b_${context.rootState.selectedBudgetID}\ufff0`
    //     })
    //     .then((result) => {
    //       //Add in the budget object. TODO: add in budgetOpened object?
    //       var b_object = context.rootGetters.budgetRootsMap[context.rootState.selectedBudgetID]
    //       delete b_object['_rev']

    //       var b_opened_object = context.rootGetters.budgetOpenedMap[context.rootState.selectedBudgetID]
    //       delete b_opened_object['_rev']

    //       console.log('exportBudgetAsJSON', b_object.name)
    //       const export_date = new Date()

    //       const reformattedExport = result.rows
    //         .map((row) => row.doc)
    //         .map((row) => {
    //           delete row['_rev'] //Delete rev field to prevent conflicts on restore
    //           return row
    //         })

    //       reformattedExport.push(b_object)
    //       reformattedExport.push(b_opened_object)

    //       var blob = new Blob([JSON.stringify(reformattedExport)], {
    //         type: 'text/plain;charset=utf-8'
    //       })
    //       FileSaver.saveAs(blob, `BudgetZero_Export_${export_date.toISOString()}.txt`)
    //     })
    //     .catch((err) => {
    //       console.log(err)
    //     })
    // },

    // deleteLocalDatabase(context) {
    //   this._vm.$pouch.destroy().catch(function (err) {
    //     console.log(`Error deleting database: ${err}`)
    //   })
    //   context.commit('DELETE_LOCAL_DB')
    //   context.commit('UPDATE_SELECTED_BUDGET', null)
    // },

    // getBudget(context) {
    //   console.log('loadLocalBudgetRoot')
    //   const t1 = performance.now()

    //   return this._vm.$pouch
    //     .allDocs({
    //       include_docs: true,
    //       attachments: false,
    //       startkey: ID_NAME.budget,
    //       endKey: ID_NAME.budget + '\ufff0'
    //     })
    //     .then((result) => {
    //       const t2 = performance.now()
    //       console.log(
    //         `DB PERFORMANCE: getBudget TIME: ${t2 - t1} milliseconds, (${((t2 - t1) / 1000.0)
    //           .toFixed(4)
    //           .toString()}) seconds)`
    //       )

    //       console.log(result)

    //       context.commit('SET_BUDGET_ROOTS', result.rows)
    //       if (localStorage.budgetID) {
    //         context.commit('UPDATE_SELECTED_BUDGET', localStorage.budgetID)
    //       } else if (result.rows.length > 0) {
    //         context.commit('UPDATE_SELECTED_BUDGET', result.rows[0].id.slice(-ID_LENGTH.budget))
    //       }
    //       return
    //     })
    //     .catch((err) => {
    //       console.log(err)
    //       context.commit('API_FAILURE', err)
    //     })
    // },

    // getAccounts(context) {
    //   const t1 = performance.now()
    //   // console.log("SELECTED BUDGET ID")
    //   // console.log(context.rootState.selectedBudgetID)
    //   const budget_id = context.rootState.selectedBudgetID
    //   console.log(budget_id)
    //   if (!budget_id) {
    //     return
    //   }
    //   const id_prefix = `b_${budget_id}${ID_NAME.account}`
    //   return this._vm.$pouch.allDocs({
    //     include_docs: true,
    //     attachments: false,
    //     startkey: `${id_prefix}`,
    //     endkey: `${id_prefix}\ufff0`
    //   })
    // },

    async loadLocalBudgetRoot(context) {
      context.commit('GET_REMOTE_SYNC_URL')

      const db = this._vm.$pouch
      // await context.dispatch('getBudget')
      await fetchAllBudgetRoots(context, db)
      // const accounts = await context.dispatch('getAccounts')
      // const accounts = await fetchAccounts(context, db)
      // console.log(accounts)

      await context.dispatch('getAllDocsFromPouchDB')
      // await context.dispatch('loadBudgetOpened')
    },

    //   db.allDocs({
    //     include_docs: true,
    //     attachments: false,
    //     startkey: `b_${context.rootState.selectedBudgetID}${ID_NAME.transaction}`,
    //     endkey: `b_${context.rootState.selectedBudgetID}${ID_NAME.transaction}\ufff0`
    //   }).then((result) => {
    //     console.log('ALL DOCS RESULT')
    //     console.log(result)
    //   })

    //   console.log(accounts)
    //   // var myReduceFunction = {
    //   //   map: function (doc) {
    //   //     // if(doc.value) {
    //   //       // console.log(doc.value)
    //   //       console.log(doc.account)
    //   //       emit(doc.account, doc.value)
    //   //     // }
    //   //   },
    //   //   reduce: '_sum'
    //   // }
    //   // function myMapFunction(doc) {

    //   // }
    //   const prefix = `b_${context.rootState.selectedBudgetID}${ID_NAME.transaction}`
    //   var my_map = function (doc) {
    //     if (doc._id.startsWith(prefix)) {
    //       emit(doc.account, doc.value)
    //     }
    //   }

    //   var ddoc = {
    //     _id: `_design/${context.rootState.selectedBudgetID}`,
    //     views: {
    //       totals: {
    //         map: (doc) => {
    //           // if (doc._id.startsWith(prefix)) {
    //           emit(doc.account, doc.value)
    //           // }
    //         }
    //       }
    //     }
    //   }

    //   db.get('_design/my_index').then((doc) => {
    //     return db.remove(doc)
    //   })

    //   db.query('my_index/by_name', {
    //     group: true,
    //     startkey: [`b_${context.rootState.selectedBudgetID}`, ''],
    //     endkey: [`b_${context.rootState.selectedBudgetID}`, '\ufff0']
    //   })
    //     .then((result) => {
    //       console.log(result)
    //     })
    //     .catch((err) => {
    //       console.log(err)
    //     })

    //   // console.log("map start")
    //   // // db.query(myReduceFunction, {
    //   // db.query({map: my_map, reduce: "_sum"}, {
    //   // // db.query({}, {
    //   //   reduce: true,
    //   //   group: true,
    //   //   // group_level: 1,
    //   //   // include_docs: true,
    //   //   // startkey: `b_${context.rootState.selectedBudgetID}${ID_NAME.transaction}`,
    //   //   // endkey: `b_${context.rootState.selectedBudgetID}${ID_NAME.transaction}\ufff0`,
    //   // })
    //   // .then((result) => {
    //   //   console.log("SUM RESULT")
    //   //   if (result.rows.length > 0) {
    //   //     console.log(`SUM: ${result.rows[0].value}`)
    //   //   }
    //   //   console.log(result)
    //   // })
    //   // .catch((err) => {
    //   //   console.log(err)
    //   // })
    //   // console.log('map end')

    //   // await context.dispatch('getAllDocsFromPouchDB')
    //   // await context.dispatch('loadBudgetOpened')
    // // },

    // // loadBudgetOpened(context) {
    // //   console.log('loadBudgetOpened')
    // //   const t1 = performance.now()
    // //   return this._vm.$pouch
    // //     .allDocs({
    // //       limit: 2,
    // //       include_docs: false,
    // //       attachments: false,
    // //       // startkey: 'bu',
    // //       // endkey: 'bu\ufff0'
    // //       startkey: ID_NAME.budgetOpened,
    // //       endkey: ID_NAME.budgetOpened + '\ufff0'
    // //       // descending: true
    // //     })
    // //     .then((result) => {
    // //       const t2 = performance.now()
    // //       console.log(
    // //         `DB PERFORMANCE: loadBudgetOpened TIME: ${t2 - t1} milliseconds, (${((t2 - t1) / 1000.0)
    // //           .toFixed(4)
    // //           .toString()}) seconds)`
    // //       )
    // //       console.log(result)
    // //       context.commit('SET_BUDGET_OPENED', result.rows)
    // //     })
    // //     .catch((err) => {
    // //       console.log(err)
    // //       context.commit('API_FAILURE', err)
    // //     })
    // // },

    deleteLocalDatabase(context) {
      deleteDatabase(context, this._vm.$pouch)
      context.commit('DELETE_LOCAL_DB')
      context.commit('UPDATE_SELECTED_BUDGET', null)
    },

    async createLocalPouchDB(context) {
      const db = new PouchDB('budgetzero_local_db')
      Vue.prototype.$pouch = db

      await initializeDesignDocs(db)
      context.dispatch('loadLocalBudgetRoot')
    }
  }
}
