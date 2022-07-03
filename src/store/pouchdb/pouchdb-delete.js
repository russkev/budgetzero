import Vue from 'vue'

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    deleteLocalDatabase: (context) => {
      const db = Vue.prototype.$pouch
      
      db
        .destroy()
        .then(() => {
          context.commit('DELETE_LOCAL_DB')
          context.commit('UPDATE_SELECTED_BUDGET_ID', null)
        })
        .catch(function (err) {
          console.log(`Error deleting database: ${err}`)
        })
    },

    /**
     * Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate deletion to remote databases.
     *
     */
    deleteAllDocs: (context) => {
      const db = Vue.prototype.$pouch
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

    /**
     * Delete the entire pouchdb database. If there's a remote, then the database will just re-sync.
     *
     */
    eraseAllDocs: (context) => {
      const db = Vue.prototype.$pouch
      db.erase().then(function (resp) {
        console.log(resp) //{ok: true}
      })
    },
    
    /**
     * Delete local transactions only
     */
    deleteTransactions: ({getters, dispatch}) => {
      const db = Vue.prototype.$pouch
      return new Promise((resolve, reject) => {
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
     * Deletes single document from pouchdb and then calls DELETE_DOCUMENT to remove from current list.
     * @param {doc} document The document to commit to pouchdb
     */
    deleteDocFromPouchAndVuex: (context, document) => {
      const db = Vue.prototype.$pouch
      console.log('deleteDocFromPouchAndVuex', document)
      db.remove(document)
        // .then((result) => {
        //   context.commit('DELETE_DOCUMENT', result)
        // })
        .catch((err) => {
          context.commit('API_FAILURE', err)
        })
    },

    /**
     * Deletes bulk documents from pouchdb.
     * @param {array} documents The documents to delete.
     */
    deleteBulkDocumentsFromPouchAndVuex: (context, {documents}) => {
      const payload = documents.map((doc) => {
        return {
          current: {
            ...doc,
            _deleted: true,
            value: 0,
          },
          previous: doc
        }
      })
      return context.dispatch('commitBulkDocsToPouchAndVuex', payload)
    }
  }
}