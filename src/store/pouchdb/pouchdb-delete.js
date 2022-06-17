const deleteDatabase = async (context, db) => {
  return db.destroy().catch(function (err) {
    console.log(`Error deleting database: ${err}`)
  })

}

/**
 * Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate deletion to remote databases.
 *
 */
const deleteAllDocs = (context, db) => {
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
}

/**
 * Delete the entire pouchdb database. If there's a remote, then the database will just re-sync.
 *
 */
const eraseAllDocs = (context, db) => {
  db.erase().then(function (resp) {
    console.log(resp) //{ok: true}
  })
}

const deleteTransactions = ({ getters, dispatch }, db) => {
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
}

/**
 * Deletes single document from pouchdb and then calls DELETE_DOCUMENT to remove from current list.
 * @param {doc} document The document to commit to pouchdb
 */
const deleteDocFromPouchAndVuex = (context, document, db) => {
  console.log('deleteDocFromPouchAndVuex', document)
  db.remove(document)
    .then((result) => {
      context.commit('DELETE_DOCUMENT', result)
    })
    .catch((err) => {
      context.commit('API_FAILURE', err)
    })
}

/**
 * Deletes bulk documents from pouchdb.
 * @param {array} documents The documents to delete.
 */
const deleteBulkDocumentsFromPouchAndVuex = (context, documents) => {
  documents.map((transaction) => (transaction._deleted = true))
  context.dispatch('commitBulkDocsToPouchAndVuex', documents).then((response) => {
    context.dispatch('getAllDocsFromPouchDB') //TODO: reloads everything after bulk delete...not that efficient?
  })
}

export {
  deleteDatabase,
  deleteAllDocs,
  eraseAllDocs,
  deleteTransactions,
  deleteDocFromPouchAndVuex,
  deleteBulkDocumentsFromPouchAndVuex
}
