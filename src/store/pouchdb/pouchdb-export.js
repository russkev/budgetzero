import Vue from 'vue'
import FileSaver from 'file-saver'
import moment from 'moment'
import { read, utils, writeFileXLSX } from 'xlsx'
import _ from 'lodash'

export default {
  state: {
    isExporting: false
  },
  getters: {
    isExporting: (state) => state.isExporting
  },
  mutations: {
    SET_IS_EXPORTING(state, isExporting) {
      Vue.set(state, 'isExporting', isExporting)
    }
  },
  actions: {
    exportSelectedBudgetAsJSON: (context) => {
      const db = Vue.prototype.$pouch
      const selected_budget_id = context.getters.selectedBudgetId
      return db
        .allDocs({
          include_docs: true,
          attachments: true,
          startkey: `b_${selected_budget_id}`,
          endkey: `b_${selected_budget_id}\ufff0`
        })
        .then((result) => {
          //Add in the budget object.
          var b_object = context.rootGetters.budgetRootsMap[selected_budget_id]
          delete b_object['_rev']

          const export_date = moment(new Date()).format('YYYY-MM-DD_hh-mm')

          const reformattedExport = result.rows
            .map((row) => row.doc)
            .map((row) => {
              delete row['_rev'] //Delete rev field to prevent conflicts on restore
              return row
            })

          reformattedExport.push(b_object)
          var blob = new Blob([JSON.stringify(reformattedExport)], {
            type: 'text/plain;charset=utf-8'
          })
          FileSaver.saveAs(blob, `BudgetZero_Export_${export_date}.txt`)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async exportBudgetAsJSON() {
      console.log('exportBudgetAsJSON: Not implemented yet.  Use exportSelectedBudgetAsJSON instead.')
      const db = Vue.prototype.$pouch
      try {
        const all_docs = await db.allDocs({
          include_docs: true,
          attachments: true
        })

        const export_date = moment(new Date()).format('YYYY-MM-DD_hh-mm')

        const reformattedExport = all_docs.rows
          .map((row) => row.doc)
          .map((row) => {
            delete row['_rev'] //Delete rev field to prevent conflicts on restore
            return row
          })

        var blob = new Blob([JSON.stringify(reformattedExport)], {
          type: 'text/plain;charset=utf-8'
        })
        FileSaver.saveAs(blob, `BudgetZero_Export_${export_date}.json`)
        localStorage.setItem('lastBackup', export_date)
      } catch (err) {
        console.log(err)
      }
    },
    async exportAccountToExcel({ dispatch, getters, commit }, { accountId }) {
      commit('SET_IS_EXPORTING', true)
      dispatch('fetchTransactionsForAccount', { accountId, itemsPerPage: false, page: false })
        .then((transactions) => {
          const test_doc = transactions.rows[0].doc
          const sheetData = transactions.rows.reduce((partial, transaction) => {
            let memo_prefix = ''
            let docs = [transaction.doc]
            if (transaction.doc.splits && transaction.doc.splits.length > 0) {
              docs = transaction.doc.splits.map((split) => {
                return {
                  ...transaction.doc,
                  category: split.category,
                  value: split.value
                }
              })
              memo_prefix = '[Split] '
            }
            docs.forEach((doc) => {
              const category = getters.categoriesById[doc.category]
              const masterCategory = getters.masterCategoriesById[category.masterCategory]
              partial.push({
                Date: doc.date,
                Cleared: doc.cleared,
                'Master Category': masterCategory.name,
                Category: category.name,
                Memo: memo_prefix + doc.memo,
                Amount: doc.value / 100
              })
            })
            return partial
          }, [])
          const accountName = getters.accountsById[accountId].name
          const sheet = utils.json_to_sheet(sheetData)
          const workbook = utils.book_new()
          utils.book_append_sheet(workbook, sheet, accountName)
          writeFileXLSX(workbook, 'Transactions.xlsx')
        })
        .finally(() => {
          commit('SET_IS_EXPORTING', false)
        })
    }
  }
}
