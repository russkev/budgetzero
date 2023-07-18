import Vue from 'vue'
import { ID_LENGTH, ID_NAME, SYNC_STATE } from '../../constants'

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    deleteLocalDatabase: ({ dispatch, getters, commit }) => {
      const db = Vue.prototype.$pouch

      db.destroy()
        .then(() => {
          Vue.prototype.$pouch = null

          commit('accountTransactions/RESET_ACCOUNT_TRANSACTIONS', { root: true })
          if (getters.syncState === SYNC_STATE.NOT_CONNECTED || getters.syncState === SYNC_STATE.ERROR) {
            /*
             * If not connected to remote, no budget will be available.
             * Reset budgets to trigger landing page load
             */
            commit('RESET_BUDGETS', { root: true })
          }
          // context.dispatch('resetAllCurrentBudgetData')
          dispatch('loadLocalBudget')
        })
        .catch(function (err) {
          console.log(`Error deleting database: ${err}`)
        })
    },

    // /**
    //  * Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate deletion to remote databases.
    //  *
    //  */
    // deleteAllDocs: (context) => {
    //   const db = Vue.prototype.$pouch
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

    // /**
    //  * Delete the entire pouchdb database. If there's a remote, then the database will just re-sync.
    //  *
    //  */
    // eraseAllDocs: (context) => {
    //   const db = Vue.prototype.$pouch
    //   db.erase().then(function (resp) {
    //     console.log(resp) //{ok: true}
    //   })
    // },

    // /**
    //  * Delete local transactions only
    //  */
    // deleteTransactions: ({ getters, dispatch }) => {
    //   const db = Vue.prototype.$pouch
    //   return new Promise((resolve, reject) => {
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

    /**
     * Deletes single document from pouchdb and then calls DELETE_DOCUMENT to remove from current list.
     * @param {doc} document The document to commit to pouchdb
     */
    deleteDocFromPouch: (context, document) => {
      const db = Vue.prototype.$pouch
      return db.remove(document).catch((err) => {
        context.commit('API_FAILURE', err)
      })
    },

    /**
     * Delete all documents relating to a specific budget, including the budget document itself.
     * @param {string} budget_id The ID od the budget to remove
     */
    deleteAllBudgetDocuments: (context, budget_id) => {
      const db = Vue.prototype.$pouch

      return db
        .allDocs({
          include_docs: false,
          startkey: `b_${budget_id}_`,
          endkey: `b_${budget_id}_\ufff0`
        })
        .then((result) => {
          const documents = result.rows.map((doc) => {
            return {
              _id: doc.id,
              _deleted: true,
              _rev: doc.value.rev
            }
          })
          return db.bulkDocs(documents)
        })
    },

    deleteAllAccountTransactions: ({ getters, dispatch }, accountId) => {
      const db = Vue.prototype.$pouch
      accountId = accountId.slice(-ID_LENGTH.account)
      const budgetId = getters.selectedBudgetId.slice(-ID_LENGTH.budget)
      return db
        .allDocs({
          include_docs: true,
          startkey: `b_${budgetId}${ID_NAME.transaction}`,
          endkey: `b_${budgetId}${ID_NAME.transaction}\ufff0`
        })
        .then((result) => {
          const documents = result.rows.reduce((partial, item) => {
            if (item.doc.account === accountId) {
              partial.push(item.doc)
            }
            return partial
          }, [])
          dispatch('deleteBulkDocumentsFromPouchAndVuex', documents)

          // const documents = result.rows.reduce((partial, item) => {
          //   console.log('doc', item)
          //   if (item.doc.account === accountId) {
          //     const delete_doc = {
          //       // _id: item.id,
          //       ...item.doc,
          //       _deleted: true
          //       // rev: item.value.rev
          //     }
          //     partial.push(delete_doc)
          //   }
          //   return partial
          // }, [])
          // console.log('About to delete', documents)
          // return db.bulkDocs(documents)
        })
    },

    /**
     * Deletes bulk documents from pouchdb.
     * @param {array} documents The documents to delete.
     */
    deleteBulkDocumentsFromPouchAndVuex: (context, documents) => {
      const payload = documents.map((doc) => {
        return {
          current: {
            ...doc,
            _deleted: true,
            value: 0
          },
          previous: doc
        }
      })
      return context.dispatch('commitBulkDocsToPouchAndVuex', payload)
    },

    deleteDocumentFromPouchAndVuex: ({ dispatch }, document) => {
      const payload = {
        current: {
          ...document,
          _deleted: true,
          value: 0
        },
        previous: document
      }
      return dispatch('commitDocToPouchAndVuex', payload)
    }
  }
}
