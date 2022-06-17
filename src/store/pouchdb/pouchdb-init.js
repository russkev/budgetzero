import Vue from "vue"
import PouchDB, { emit } from 'pouchdb'
import { documentExists } from "../../helper"
import { ID_LENGTH, ID_NAME, RESERVED_IDs } from "../../constants"

const initializeDesignDocs = (db) => {
  const design_document_id = '_design/stats'

  
  documentExists(db, design_document_id)
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
      const is_transaction 
        = `id.slice(${budget_id_end}, ${transaction_name_end}) == '${ID_NAME.transaction}'`
      // TODO check that all category ids are accounted for
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
          }
        }
      }
      if (existing_design_document) {
        design_document['_rev'] = existing_design_document['_rev']
      }
      console.log("WARNING DESIGN DOCUMENT UPDATED")
      return db.put(design_document)
    })
    .catch((err) => {
      console.log(`Design document failure: ${err.message}`)
    })
}

export { initializeDesignDocs }