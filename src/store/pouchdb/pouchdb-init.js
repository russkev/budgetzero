import Vue from 'vue'
import PouchDB from 'pouchdb'
import { documentExists } from '../../helper'
import { ID_LENGTH, ID_NAME } from '../../constants'

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    initializeDesignDocs: (context) => {
      const db = Vue.prototype.$pouch
      const design_document_id = '_design/stats'
      return documentExists(db, design_document_id)
        .then((document_exists) => {
          if (document_exists) {
            return db.get(design_document_id)
          } else {
            return false
          }
        })
        .then((existing_design_document) => {
          const budget_id_start = 2
          const budget_id_end = 2 + ID_LENGTH.budget
          const transaction_name_end = budget_id_end + ID_NAME.transaction.length
          const is_transaction = `id.slice(${budget_id_end}, ${transaction_name_end}) == '${ID_NAME.transaction}'`
          let design_document = {
            _id: design_document_id,
            views: {
              sum_transaction_by_account: {
                map: `function (doc) {
                const id = doc._id 
                if (${is_transaction}) {
                  emit(
                    [
                      id.slice(${budget_id_start}, ${budget_id_end}), 
                      doc.account, 
                      doc.cleared
                    ], 
                    doc.value
                  )
                }
              }`,
              reduce: '_sum'
              },
              sum_transaction_by_budget: {
                map: `function (doc) {
                const id = doc._id
                if (${is_transaction}) {
                  emit(
                    [
                      id.slice(${budget_id_start}, ${budget_id_end}), 
                      doc.date.slice(0, 7),
                      doc.category
                    ], 
                    doc.value
                  )
                }
              }`,
              reduce: '_sum'
              },
              transactions_by_account: {
                map: `function (doc) {
                  const id = doc._id
                  if (${is_transaction}) {
                    emit([
                      id.slice(${budget_id_start}, ${budget_id_end}), 
                      doc.account,
                      id.slice(-${ID_LENGTH.transaction})
                    ]) 
                  }
                }`
              }
            }
          }
          if (existing_design_document) {
            design_document['_rev'] = existing_design_document['_rev']
          }
          console.log('WARNING DESIGN DOCUMENT UPDATED')
          return db.put(design_document)
        })
        .catch((err) => {
          console.log(`Design document failure: ${err.message}`)
        })
    },
    createLocalPouchDB(context) {    
      PouchDB.adapter('worker', require('worker-pouch'))
      const db = new PouchDB('budgetzero_local_db')
      Vue.prototype.$pouch = db

      return context
        .dispatch('initializeDesignDocs')
        .then(() => {
          return context.dispatch('loadLocalBudgetRoot')
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}
