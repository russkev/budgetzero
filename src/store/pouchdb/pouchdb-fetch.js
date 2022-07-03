import { ID_NAME, ID_LENGTH, UNCATEGORIZED } from '../../constants'
import { logPerformanceTime, prevMonth } from '../../helper'
import Vue from 'vue'

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    fetchBudgetOpened: (context) => {
      const db = Vue.prototype.$pouch
      const t1 = performance.now()
      return db
        .allDocs({
          include_docs: true,
          attachments: false,
          startkey: ID_NAME.budgetOpened,
          endkey: ID_NAME.budgetOpened + '\ufff0'
        })
        .then((result) => {
          logPerformanceTime('loadBudgetOpened', t1)
          return context.commit('SET_BUDGET_OPENED', result.rows)
        })
        .catch((err) => {
          console.log(err)
          context.commit('API_FAILURE', err)
        })
    },
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
      return fetchDocsByType(context, db, budget_id, ID_NAME.account, 'fetchAccounts').then((result) => {
        return context.commit('SET_ACCOUNTS', result)
      })
    },
    fetchPayees: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.payee, 'fetchPayees').then((result) => {
        return context.commit('SET_PAYEES', result)
      })
    },
    fetchCategories: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.category, 'fetchCategories').then((result) => {
        context.commit('SET_CATEGORIES', result)
        return 'success'
      })
    },
    fetchMasterCategories: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      return fetchDocsByType(context, db, budget_id, ID_NAME.masterCategory, 'fetchMasterCategories').then((result) => {
        result.push(UNCATEGORIZED)
        context.commit('SET_MASTER_CATEGORIES', result)
        return 'success'
      })
    },
    fetchMonthCategories: (context) => {
      const db = Vue.prototype.$pouch
      const budget_id = context.rootState.selectedBudgetId
      // const name = ID_NAME.monthCategory + context.
      return fetchDocsByType(context, db, budget_id, ID_NAME.monthCategory, 'fetchMonthCategories')
      // .then((result) => {
      //   console.log(result)
      //   return result
      // })
      // .then((result) => {
      //   context.commit('SET_MONTH_CATEGORY_BUDGETS', result)
      //   return 'success'
      // })
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
          startkey: [budget_id, options.account_id, '\ufff0'],
          endkey: [budget_id, options.account_id, ''],
          limit: options.itemsPerPage,
          skip: skip_amount,
          descending: true
        })
        .then((result) => {
          logPerformanceTime('fetchTransactionsForAccount', t1)
          return result
        })

      // return fetchDocsByType(context, db, budget_id, ID_NAME.transaction, 'fetchTransactions').then((result) => {
      //   return context.commit('SET_TRANSACTIONS', result)
      // })
    },
    fetchAccountBalances: (context) => {
      // const db = Vue.prototype.$pouch
      // const t1 = performance.now()
      // const budget_id = context.rootState.selectedBudgetId
      // return db
      //   .query('stats/sum_transaction_by_account', {
      //     group: true,
      //     // group_level: 3,
      //     startkey: [`${budget_id}`, '', ''],
      //     endkey: [`${budget_id}`, '\ufff0', '\ufff0']
      //   })
      //   .then((result) => {
      //     logPerformanceTime('fetchAccountBalances', t1)
      //     return result.rows
      //   })
      //   .then((result) => {
      //     return context.commit('SET_ACCOUNT_BALANCES', result)
      //   })
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
          console.log('sum_transaction_by_budget')
          console.log(result)
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
