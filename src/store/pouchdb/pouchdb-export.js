import Vue from 'vue'
var FileSaver = require('file-saver')
import moment from 'moment'

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    exportSelectedBudgetAsJSON: (context) => {
      // const db = this._vm.$pouch
      const db = Vue.prototype.$pouch
      const selected_budget_id = context.rootState.selectedBudgetId
      return db
        .allDocs({
          include_docs: true,
          attachments: true,
          startkey: `b_${selected_budget_id}`,
          endkey: `b_${selected_budget_id}\ufff0`
        })
        .then((result) => {
          //Add in the budget object. TODO: add in budgetOpened object?
          var b_object = context.rootGetters.budgetRootsMap[selected_budget_id]
          delete b_object['_rev']

          var b_opened_object = context.rootGetters.budgetOpenedMap[selected_budget_id]
          delete b_opened_object['_rev']

          console.log('exportBudgetAsJSON', b_object.name)
          const export_date = moment(new Date()).format('YYYY-MM-DD_hh-mm')

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
          FileSaver.saveAs(blob, `BudgetZero_Export_${export_date}.txt`)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    exportBudgetAsJSON: () => {
      const db = Vue.prototype.$pouch
      return db
        .allDocs({
          include_docs: true,
          attachments: true
        })
        .then((result) => {
          console.log('exportBudgetAsJSON', JSON.stringify(result))
          const export_date = moment(new Date()).format('YYYY-MM-DD_hh-mm')

          const reformattedExport = result.rows
            .map((row) => row.doc)
            .map((row) => {
              delete row['_rev'] //Delete rev field to prevent conflicts on restore
              return row
            })

          var blob = new Blob([JSON.stringify(reformattedExport)], {
            type: 'text/plain;charset=utf-8'
          })
          FileSaver.saveAs(blob, `BudgetZero_Export_${export_date}.txt`)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}
