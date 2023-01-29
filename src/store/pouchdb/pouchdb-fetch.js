import { ID_NAME, ID_LENGTH, NONE } from '../../constants'
import { logPerformanceTime, prevMonth } from '../../helper'
import { base64Date } from '../modules/id-module'
import Vue from 'vue'

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    fetchAllBudgets: (context) => {
      const db = Vue.prototype.$pouch
      const t1 = performance.now()
      return db
        .allDocs({
          include_docs: true,
          attachments: false,
          startkey: ID_NAME.budget,
          endkey: ID_NAME.budget + '\ufff0'
        })
        .then((result) => {
          logPerformanceTime('fetchAllBudgets', t1)
          const docs = result.rows.map((row) => row.doc)

          // Sort in descending order by when it was last accessed
          docs.sort((a, b) => {
            if (a.accessed && b.accessed) {
              return b.accessed - a.accessed
            } else if (b.accessed) {
              return 1
            } else {
              return -1
            }
          })

          context.commit('SET_ALL_BUDGETS', docs)
          return docs
        })
        .catch((err) => {
          console.log(err)
          context.commit('API_FAILURE', err)
        })
    },
    fetchAccounts: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.account, 'fetchAccounts').then((accounts) => {
        context.commit('SET_ACCOUNTS', accounts)
        return accounts
      })
    },
    fetchPayees: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.payee, 'fetchPayees').then((result) => {
        context.commit('SET_PAYEES', result)
        return result
      })
    },
    fetchCategories: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.category, 'fetchCategories').then((result) => {
        context.commit('SET_CATEGORIES', result)
        return result
      })
    },
    fetchMasterCategories: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.masterCategory, 'fetchMasterCategories').then((result) => {
        // result.push(NONE)
        context.commit('SET_MASTER_CATEGORIES', result)
        return result
      })
    },
    fetchMonthCategories: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.monthCategory, 'fetchMonthCategories')
    },
    fetchTransactionsWithImportId: async (context, options) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.getters.selectedBudgetId
      if (!budget_id) {
        return []
      }

      return db
        .query('stats/transactions_by_import_id', {
          include_docs: false,
          startkey: [budget_id, options.account_id, options.import_id],
          endkey: [budget_id, options.account_id, options.import_id]
        })
        .then((result) => {
          return result.rows
        })
    },
    fetchTransactionsForAccount: async (context, options) => {
      const t1 = performance.now()

      const db = Vue.prototype.$pouch
      let budget_id = context.getters.selectedBudgetId
      if (!budget_id) {
        const budgets = await context.dispatch('fetchAllBudgets')
        budget_id = await context.dispatch('updateSelectedBudgetId', budgets)
      }
      const skip_amount = (options.page - 1) * options.itemsPerPage
      return db
        .query(`stats/transactions_by_account`, {
          include_docs: true,
          startkey: [budget_id, options.accountId, '\ufff0'],
          endkey: [budget_id, options.accountId, ''],
          limit: options.itemsPerPage,
          skip: skip_amount,
          descending: true
        })
        .then((result) => {
          logPerformanceTime('fetchTransactionsForAccount', t1)
          return result
        })
    },
    fetchAccountIsEmpty: async (context, account_id) => {
      const t1 = performance.now()
      const db = Vue.prototype.$pouch
      const budget_id = context.getters.selectedBudgetId
      if (!budget_id) {
        return true
      }
      return db
        .query(`stats/transactions_by_account`, {
          include_docs: false,
          startkey: [budget_id, account_id, ''],
          endkey: [budget_id, account_id, '\ufff0'],
          limit: 1
        })
        .then((result) => {
          console.log('fetchAccountIsEmpty', result.rows)
          logPerformanceTime('fetchAccountIsEmpty', t1)
          return result.rows.length === 0
        })
    },
    fetchTransactionsForMonth: async (context, month) => {
      console.log('fetchTransactionsForMonth')
      const t1 = performance.now()
      const db = Vue.prototype.$pouch
      const budget_id = context.getters.selectedBudgetId
      if (!budget_id) {
        return []
      }
      const start_date_encoded = base64Date(`${month}-00`)
      const end_date_encoded = base64Date(`${month}-32`)
      const start_key = `b_${budget_id}${ID_NAME.transaction}${start_date_encoded}`;
      const end_key = `b_${budget_id}${ID_NAME.transaction}${end_date_encoded}\ufff0`;
      return db
        .allDocs({
          include_docs: true,
          startkey: end_key,
          endkey: start_key,
          descending: true
        })
        .then((result) => {
          logPerformanceTime('fetchTransactionsForMonth', t1)
          return result.rows.map((row) => row.doc)
        })
    },
    fetchSucceedingTransaction: async (context, transaction) => {
      const t1 = performance.now()

      const db = Vue.prototype.$pouch
      const budget_id = transaction._id.slice(2, 2 + ID_LENGTH.budget)

      return db
        .query(`stats/transactions_by_account`, {
          include_docs: true,
          startkey: [budget_id, transaction.account, transaction._id.slice(-ID_LENGTH.transaction)],
          endkey: [budget_id, transaction.account, '\ufff0'],
          limit: 2,
          descending: false
        })
        .then((result) => {
          logPerformanceTime('fetchSucceedingTransaction', t1)
          console.log(result)
          if (result.rows.length > 1) {
            return result.rows[1]
          }
        })
    },
    fetchPrecedingTransaction: async (context, { transaction, isDeleted }) => {
      const t1 = performance.now()

      const db = Vue.prototype.$pouch
      const budget_id = transaction._id.slice(2, 2 + ID_LENGTH.budget)
      const limit = isDeleted ? 1 : 2

      return db
        .query(`stats/transactions_by_account`, {
          include_docs: true,
          startkey: [budget_id, transaction.account, transaction._id.slice(-ID_LENGTH.transaction)],
          endkey: [budget_id, transaction.account, ''],
          limit: limit,
          descending: true
        })
        .then((result) => {
          logPerformanceTime('fetchPrecedingTransaction', t1)
          if (result.rows.length > 0) {
            return result.rows[result.rows.length - 1]
          } else {
            return null
          }
        })
    },
    /**
     *
     * @param {*} context
     * @param {*} transaction Start transaction
     * @returns All transactions including and later than start transaction
     */
    fetchAllSucceedingTransactions: async (context, transaction) => {
      const t1 = performance.now()
      const db = Vue.prototype.$pouch
      const budget_id = transaction._id.slice(2, 2 + ID_LENGTH.budget)

      return db
        .query(`stats/transactions_by_account`, {
          include_docs: true,
          startkey: [budget_id, transaction.account, transaction._id.slice(-ID_LENGTH.transaction)],
          endkey: [budget_id, transaction.account, '\ufff0'],
          descending: false
        })
        .then((result) => {
          logPerformanceTime('fetchAllSucceedingTransactions', t1)
          return result.rows
        })
    },
    fetchBudgetBalances: (context) => {
      const db = Vue.prototype.$pouch
      const t1 = performance.now()
      const budget_id = context.rootState.selectedBudgetId
      const month_end = context.rootState.selectedMonth
      const month_start = prevMonth(month_end)

      return db
        .query('stats/sum_transaction_by_budget', {
          group: true,
          startkey: [`${budget_id}`, `${month_start}`, ''],
          endkey: [`${budget_id}`, `${month_end}`, '\ufff0']
        })
        .then((result) => {
          logPerformanceTime('fetchBudgetBalances', t1)
          return result.rows
        })
        .then((result) => {
          return context.commit('SET_BUDGET_BALANCES', result)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    fetchAllTransactions: (context) => {
      const db = Vue.prototype.$pouch
      const t1 = performance.now()
      const budget_id = context.rootState.selectedBudgetId

      return db
        .allDocs({
          include_docs: true,
          startkey: `b_${budget_id}${ID_NAME.transaction}`,
          endkey: `b_${budget_id}${ID_NAME.transaction}\ufff0`
        })
        .then((result) => {
          logPerformanceTime('fetchAllTransactions', t1)
          return result
        })
    }
  }
}

const fetchDocsByType = (context, db, budget_id, id_name, function_name) => {
  const t2 = performance.now()
  const id_prefix = `b_${budget_id}${id_name}`

  return db
    .allDocs({
      include_docs: true,
      startkey: id_prefix,
      endkey: id_prefix + '\ufff0'
    })
    .then((result) => {
      logPerformanceTime(function_name, t2)
      return result.rows.map((row) => row.doc)
    })
    .catch((err) => {
      console.log(err)
      context.commit('API_FAILURE', err)
    })
}
