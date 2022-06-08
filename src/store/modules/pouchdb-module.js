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
import _ from 'lodash'
import moment from 'moment'
import PouchDB from 'pouchdb'
import mock_budget from '@/../tests/__mockdata__/mock_budget2.json'
import { ID_LENGTH, DEFAULT_STATE } from '../../constants'

var FileSaver = require('file-saver')

/**
 * This pouchdb vuex module contains code that interacts with the pouchdb database.
 */

export default {
  state: JSON.parse(JSON.stringify(DEFAULT_STATE)),
  getters: {
    remoteSyncURL: (state) => state.remoteSyncURL,
    //Plain getters for main doc types
    transactions: (state) => state.transactions,
    accounts: (state) => state.accounts,
    // masterCategories: (state) => state.masterCategories,
    masterCategories: (state) => [...state.masterCategories].sort((a, b) => (a.sort > b.sort ? 1 : -1)),
    monthCategoryBudgets: (state) =>
      state.monthCategoryBudgets.map((row) => {

        // Extract date from the id and add it as a separate property
        const date_regex = /(?<=\_)[0-9]{4}\-[0-9]{2}\-[0-9]{2}(?=\_)/
        const date = row._id.match(date_regex)
        if (date.length > 0) {
          row.date = date[0] 
        } else {
          row.date = ''
        }
        return row
      }),
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
        {
          _id: null,
          name: 'Uncategorized'
        },
        {
          _id: 'income',
          name: 'Income This Month'
        },
        {
          _id: 'incomeNextMonth',
          name: 'Income Next Month'
        }
      ].concat(state.categories)
    },

    //Lookups for main doc types
    budgetRootLookupByID: (state, getters) => {
      return getters.budgetRoots.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    monthCategoryBudgetLookupByID: (state, getters) => {
      return getters.monthCategoryBudgets.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    transactionsLookupByID: (state, getters) => {
      return getters.transactions.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    masterCategoriesLookupByID: (state, getters) => {
      return state.masterCategories.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    categoriesLookupByID: (state, getters) => {
      return state.categories.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    payeesLookupByID: (state, getters) => {
      return getters.payees.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },
    accountsLookupByID: (state, getters) => {
      return getters.accounts.reduce((map, obj, i) => {
        map[obj._id] = i
        return map
      }, {})
    },

    listOfImportIDs: (state) => state.transactions.map((trn) => _.get(trn, 'importID', '')),
    budgetRoots: (state) => state.budgetRoots,
    budgetRootsMap: (state, getters) =>
      getters.budgetRoots.reduce((map, obj) => {
        const id = obj._id ? obj._id.slice(-ID_LENGTH.budget) : null
        obj.short_id = obj._id.slice(-ID_LENGTH.budget)
        map[id] = obj
        return map
      }, {}),
    budgetOpened: (state) =>
      state.budgetOpened.map((row) => {
        var obj = row.doc
        obj.short_id = obj._id.slice(-ID_LENGTH.budget)
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
      return getters.accounts.filter((acc) => acc.onBudget)
    },
    accountsOffBudget: (state, getters) => {
      return getters.accounts.filter((acc) => !acc.onBudget)
    },

    // Used for lookups with cleared/uncleared account info. Used for sidebar and transaciton view header?
    account_balances: (state, getters) => {
      const accountBalances = getters.transactions.reduce((map, obj) => {
        const amt = obj.value ? obj.value : 0

        if (!(obj.account in map)) {
          map[obj.account] = { cleared: 0, uncleared: 0, working: 0 }
        }

        if (obj.cleared) {
          map[obj.account].cleared += amt
        } else {
          map[obj.account].uncleared += amt
        }

        map[obj.account].working += amt

        return map
      }, {})

      getters.accounts.forEach((account) => {
        // Add in missing account keys
        if (!(account._id.slice(-ID_LENGTH.account) in accountBalances)) {
          accountBalances[account._id.slice(-ID_LENGTH.account)] = { cleared: 0, uncleared: 0 }
        }
      })
      return accountBalances
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
    SET_POUCHDB_DOCS(state, response) {
      const data = response.map((row) => row.doc)
      state.transactions = data.filter((row) => row._id.includes('_transaction_'))
      state.monthCategoryBudgets = data.filter((row) => row._id.includes('_monthCategory_'))
      state.payees = data.filter((row) => row._id.includes('_payee_'))
      state.masterCategories = data.filter((row) => row._id.includes('_master-category_'))
      state.accounts = data.filter((row) => row._id.includes('_account_'))
      state.categories = data
        .filter((row) => row._id.includes('_category_'))
        .filter((row) => !row._id.includes('monthCategory')) //Don't include budget docs
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
    UPDATE_DOCUMENT(state, { payload, index, docType }) {
      switch (docType) {
        case 'transaction':
          if (isNaN(index)) {
            state.transactions.push(payload)
          } else {
            Object.assign(state.transactions[index], payload)
          }
          break
        case 'category':
          if (isNaN(index)) {
            state.categories.push(payload)
          } else {
            Object.assign(state.categories[index], payload)
          }
          break
        case 'master-category':
          if (isNaN(index)) {
            state.masterCategories.push(payload)
            console.log('accounts no index...', payload)
          } else {
            Object.assign(state.masterCategories[index], payload)
          }
          break
        case 'account':
          if (isNaN(index)) {
            state.accounts.push(payload)
            console.log('accounts no index...', payload)
          } else {
            Object.assign(state.accounts[index], payload)
          }
          break
        case 'monthCategory':
          if (isNaN(index)) {
            state.monthCategoryBudgets.push(payload)
          } else {
            Object.assign(state.monthCategoryBudgets[index], payload)
          }
          break
        case 'payee':
          if (isNaN(index)) {
            state.payees.push(payload)
          } else {
            Object.assign(state.payees[index], payload)
          }
          break
        case 'budget':
          //TODO: validate
          if (isNaN(index)) {
            state.budgetRoots.push(payload)
          } else {
            Object.assign(state.budgetRoots[index], payload)
          }
          break
        case 'budget-opened':
          //TODO: validate
          if (isNaN(index)) {
          } else {
          }
          break
        default:
          console.error('doesnt recognize doc type ', docType)
      }
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
    GET_BUDGET_ROOTS(state, payload) {
      if (payload.length == 0) {
        state.budgetExists = false
      } else {
        state.budgetExists = true
      }
      // Get budget ids
      state.budgetRoots = payload.map((budget) => {
        return budget.doc
      })
    },
    SET_BUDGET_OPENED(state, payload) {
      state.budgetOpened = payload
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
          console.log('You connected', info)
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
          context.dispatch('getAllDocsFromPouchDB')
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
      console.log('getAllDocsFromPouchDB')
      const t1 = performance.now()
      return this._vm.$pouch
        .allDocs({
          include_docs: true,
          attachments: true
          // startkey: `b_${context.rootState.selectedBudgetID}`,
          // endkey: `b_${context.rootState.selectedBudgetID}\ufff0`
        })
        .then((result) => {
          const t2 = performance.now()
          console.log(
            `DB PERFORMANCE: getAllDocsFromPouchDB TIME: ${t2 - t1} milliseconds, (${((t2 - t1) / 1000.0)
              .toFixed(4)
              .toString()}) seconds)`
          )
          console.log(result)
          context.commit('SET_POUCHDB_DOCS', result.rows)
          context.dispatch('calculateMonthlyData')
        })
        .catch((err) => {
          context.commit('API_FAILURE', err)
        })
    },

    /**
     * Commits single document to pouchdb and then calls UPDATE_DOCUMENT to update current document list.
     * @param {doc} payload The document to commit to pouchdb
     */
    commitDocToPouchAndVuex(context, payload) {
      var docType = null
      var _id = null
      var index = null

      //Validation
      if (payload && payload._id) {
        if (payload._id.startsWith('budget_')) {
          docType = 'budget'
          _id = payload._id.substring(7)
        } else if (payload._id.startsWith('budget-opened_')) {
          docType = 'budget-opened'
        } else {
          const type_regex = /(?<=b_[0-9a-zA-Z_\-\.]{3}_)[0-9a-zA-Z\-]+(?=_[0-9a-zA-Z_\-\.]+)/
          const regex_result = payload._id.match(type_regex)
          docType = regex_result ? regex_result[0] : null
        }
      }

      var validationResult = {
        errors: 'Validation schema not found.'
      }

      switch (docType) {
        case 'transaction':
          validationResult = validateSchema.validate(payload, schema_transaction)
          index = context.getters.transactionsLookupByID[payload._id]
          break
        case 'category':
          validationResult = validateSchema.validate(payload, schema_category)
          index = context.getters.categoriesLookupByID[payload._id]
          break
        case 'master-category':
          validationResult = validateSchema.validate(payload, schema_masterCategory)
          index = context.getters.masterCategoriesLookupByID[payload._id]
          break
        case 'account':
          validationResult = validateSchema.validate(payload, schema_account)
          index = context.getters.accountsLookupByID[payload._id]
          break
        case 'monthCategory':
          validationResult = validateSchema.validate(payload, schema_monthCategory)
          index = context.getters.monthCategoryBudgetLookupByID[payload._id]
          break
        case 'payee':
          validationResult = validateSchema.validate(payload, schema_payee)
          index = context.getters.payeesLookupByID[payload._id]
          break
        case 'budget':
          validationResult = validateSchema.validate(payload, schema_budget)
          index = context.getters.budgetRootLookupByID[payload._id]
          break
        case 'budget-opened':
          //TODO: validate
          validationResult = validateSchema.validate(payload, schema_budgetOpened)
          break
        default:
          console.error('doesn\'t recognize doc type ', docType)
      }

      if (validationResult.errors.length > 0) {
        this.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Validation failed: ' + validationResult.errors.toString(),
          snackbarColor: 'error'
        })
        console.log('failed validation:', payload)
        return
      }

      // this.commit("SET_SNACKBAR_MESSAGE", {snackbarMessage: `${docType} updated.`, snackbarColor: "primary"});

      //Commit to Pouchdb
      return new Promise((resolve, reject) => {
        this._vm.$pouch.put(payload).then(
          (response) => {
            payload._rev = response.rev

            context.commit('UPDATE_DOCUMENT', { payload, index, docType })
            context.dispatch('calculateMonthlyData')

            resolve(response)
          },
          (error) => {
            reject(error)
            context.commit('API_FAILURE', error)
          }
        )
      })
    },

    databaseExists(context) {
      return this._vm.$pouch.info()
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    },

    /**
     * Bulk commits list of documents to pouchdb.
     * The calling component is responsible for updating current list to be in sync with store.
     * @param {array} payload The documents to commit to pouchdb
     */
    commitBulkDocsToPouchAndVuex(context, payload) {
      context.dispatch('databaseExists', context)
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

    /**
     * Deletes single document from pouchdb and then calls DELETE_DOCUMENT to remove from current list.
     * @param {doc} payload The document to commit to pouchdb
     */
    deleteDocFromPouchAndVuex(context, payload) {
      console.log('deleteDocFromPouchAndVuex', payload)
      this._vm.$pouch
        .remove(payload)
        .then((result) => {
          context.commit('DELETE_DOCUMENT', result)
        })
        .catch((err) => {
          context.commit('API_FAILURE', err)
        })
    },

    /**
     * Deletes bulk documents from pouchdb.
     * @param {array} payload The documents to delete.
     */
    deleteBulkDocumentsFromPouchAndVuex(context, payload) {
      payload.map((trans) => (trans._deleted = true))
      context.dispatch('commitBulkDocsToPouchAndVuex', payload).then((response) => {
        context.dispatch('getAllDocsFromPouchDB') //TODO: reloads everything after bulk delete...not that efficient?
      })
    },

    /**
     * Delete the entire pouchdb database. If there's a remote, then the database will just re-sync.
     *
     */
    eraseAllDocs(context) {
      this._vm.$pouch.erase().then(function (resp) {
        console.log(resp) //{ok: true}
      })
    },

    deleteTransactions({ getters, dispatch }) {
      return new Promise((resolve, reject) => {
        var db = this._vm.$pouch
        let accounts = getters.transactions_by_account
        let account_ids = Object.keys(accounts)

        account_ids.forEach((account_id) => {
          let account_transactions = accounts[account_id]
          account_transactions.map(function (transaction) {
            return db.remove(transaction._id, transaction._rev)
          })
        })

        dispatch('getAllDocsFromPouchDB')
        db.compact()
          .then(function (info) {
            // compaction complete
            console.log('compact complete')
            resolve(info)
          })
          .catch(function (err) {
            // handle errors
            console.log(`compact failed: ${err}`)
            reject(err)
          })
      })
    },

    /**
     * Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate deletion to remote databases.
     *
     */
    deleteAllDocs(context) {
      var db = this._vm.$pouch

      db.allDocs()
        .then(function (result) {
          // Promise isn't supported by all browsers; you may want to use bluebird
          return Promise.all(
            result.rows.map(function (row) {
              return db.remove(row.id, row.value.rev)
            })
          )
        })
        .then(function (result) {
          console.log('all docs deleted')
          context.dispatch('getAllDocsFromPouchDB')

          db.compact()
            .then(function (info) {
              // compaction complete
              console.log('compact complete')
            })
            .catch(function (err) {
              console.log(`compact failed: ${err}`)
              // handle errors
            })
          // done!
        })
        .catch(function (err) {
          console.log('error', err)
          // error!
        })
    },

    loadMockData(context) {
      context.dispatch('commitBulkDocsToPouchAndVuex', mock_budget).then((result) => {
        context.dispatch('loadLocalBudgetRoot')
      })
    },

    exportBudgetAsJSON(context) {
      return this._vm.$pouch
        .allDocs({
          include_docs: true,
          attachments: true
        })
        .then((result) => {
          console.log('exportBudgetAsJSON', JSON.stringify(result))
          const export_date = new Date()

          const reformattedExport = result.rows
            .map((row) => row.doc)
            .map((row) => {
              delete row['_rev'] //Delete rev field to prevent conflicts on restore
              return row
            })

          var blob = new Blob([JSON.stringify(reformattedExport)], {
            type: 'text/plain;charset=utf-8'
          })
          FileSaver.saveAs(blob, `BudgetZero_Export_${export_date.toISOString()}.txt`)
        })
        .catch((err) => {
          console.log(err)
        })
    },

    exportSelectedBudgetAsJSON(context) {
      return this._vm.$pouch
        .allDocs({
          include_docs: true,
          attachments: true,
          startkey: `b_${context.rootState.selectedBudgetID}`,
          endkey: `b_${context.rootState.selectedBudgetID}\ufff0`
        })
        .then((result) => {
          //Add in the budget object. TODO: add in budgetOpened object?
          var b_object = context.rootGetters.budgetRootsMap[context.rootState.selectedBudgetID]
          delete b_object['_rev']

          var b_opened_object = context.rootGetters.budgetOpenedMap[context.rootState.selectedBudgetID]
          delete b_opened_object['_rev']

          console.log('exportBudgetAsJSON', b_object.name)
          const export_date = new Date()

          const reformattedExport = result.rows
            .map((row) => row.doc)
            .map((row) => {
              delete row['_rev'] //Delete rev field to prevent conflicts on restore
              return row
            })

          reformattedExport.push(b_object)
          reformattedExport.push(b_opened_object)

          var blob = new Blob([JSON.stringify(reformattedExport)], {
            type: 'text/plain;charset=utf-8'
          })
          FileSaver.saveAs(blob, `BudgetZero_Export_${export_date.toISOString()}.txt`)
        })
        .catch((err) => {
          console.log(err)
        })
    },

    deleteLocalDatabase(context) {
      this._vm.$pouch.destroy().catch(function (err) {
        console.log(`Error deleting database: ${err}`)
      })
      context.commit('DELETE_LOCAL_DB')
      context.commit('UPDATE_SELECTED_BUDGET', null)
    },

    loadLocalBudgetRoot(context) {
      console.log('loadLocalBudgetRoot')
      const t1 = performance.now()
      return this._vm.$pouch
        .allDocs({
          include_docs: true,
          attachments: true,
          startkey: 'budget_',
          endkey: 'budget_\ufff0'
        })
        .then((result) => {
          const t2 = performance.now()
          console.log(
            `DB PERFORMANCE: loadLocalBudgetRoot TIME: ${t2 - t1} milliseconds, (${((t2 - t1) / 1000.0)
              .toFixed(4)
              .toString()}) seconds)`
          )
          console.log(result)
          context.commit('GET_BUDGET_ROOTS', result.rows)

          if (localStorage.remoteSyncURL) {
            context.commit('GET_REMOTE_SYNC_URL')
          }

          if (localStorage.budgetID) {
            context.commit('UPDATE_SELECTED_BUDGET', localStorage.budgetID)
          } else if (result.rows.length > 0) {
            // Select first budget ID on initial load if nothing found in localstorage
            context.commit('UPDATE_SELECTED_BUDGET', result.rows[0].id.slice(-ID_LENGTH.budget))
          }
          context.dispatch('getAllDocsFromPouchDB')
          context.dispatch('loadBudgetOpened')
        })
        .catch((err) => {
          console.log(err)
          context.commit('API_FAILURE', err)
        })
    },

    loadBudgetOpened(context) {
      console.log('loadBudgetOpened')
      const t1 = performance.now()
      return this._vm.$pouch
        .allDocs({
          // limit: 100,
          include_docs: true,
          attachments: true,
          startkey: 'budget-opened_',
          endkey: 'budget-opened_\ufff0'
          // descending: true
        })
        .then((result) => {
          const t2 = performance.now()
          console.log(
            `DB PERFORMANCE: loadBudgetOpened TIME: ${t2 - t1} milliseconds, (${((t2 - t1) / 1000.0)
              .toFixed(4)
              .toString()}) seconds)`
          )
          console.log(result)
          context.commit('SET_BUDGET_OPENED', result.rows)
        })
        .catch((err) => {
          console.log(err)
          context.commit('API_FAILURE', err)
        })
    },
    createLocalPouchDB(context) {
      const pouch = new PouchDB('budgetzero_local_db')
      Vue.prototype.$pouch = pouch
      context.dispatch('loadLocalBudgetRoot')
    }
  }
}
