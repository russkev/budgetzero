import { sanitizeValueInput } from '../../helper'
import moment from 'moment'
import { DEFAULT_ACCOUNT_BALANCE, ID_LENGTH, ID_NAME } from '../../constants'
import _ from 'lodash'
import Vue from 'vue'

const DEFAULT_ACCOUNT_STATE = {
  allAccountBalances: {},
  accounts: [],
  accountTransactionCounts: {},
  intlCurrency: new Intl.NumberFormat('en-us', { style: 'currency', currency: 'USD' })
}

export default {
  state: {
    ...DEFAULT_ACCOUNT_STATE
  },
  getters: {
    allAccountBalances: (state, getters) => {
      return Object.entries(state.allAccountBalances).reduce((partial, [account_id, balance]) => {
        // const initial = _.get(getters, [('accountsById', account_id, 'initialBalance')], 0)
        let initial = 0
        if (getters.accountsById[account_id] && getters.accountsById[account_id].initialBalance !== undefined) {
          initial = getters.accountsById[account_id].initialBalance
        }
        partial[account_id] = {
          ...balance,
          cleared: balance.cleared + initial,
          working: balance.working + initial
        }
        return partial
      }, {})
    },
    accounts: (state) => state.accounts,
    accountsById: (state) => {
      return state.accounts.reduce((partial, account) => {
        partial[account._id.slice(-ID_LENGTH.account)] = account
        return partial
      }, {})
    },
    accountsOnBudget: (state) => {
      return state.accounts
        .filter((account) => account.onBudget)
        .sort((a, b) => {
          if (a.sort !== undefined && b.sort !== undefined) {
            return a.sort - b.sort
          } else return 0
        })
    },
    accountsOffBudget: (state) => {
      return state.accounts.filter((account) => !account.onBudget)
    },
    intlCurrency: (state) => state.intlCurrency,
    accountTransactionCounts: (state) => state.accountTransactionCounts,
    totalInitialBalance: (state, getters) => {
      return getters.accounts.reduce((partial, account) => {
        if (account.initialBalance !== undefined) {
          partial += account.initialBalance
        }
        return partial
      }, 0)
    }
  },
  mutations: {
    SET_ACCOUNTS(state, accounts) {
      state.accounts = accounts
      accounts.forEach((account) => {
        const id = account._id.slice(-ID_LENGTH.account)
        if (state.allAccountBalances[id] === undefined) {
          Vue.set(state.allAccountBalances, id, DEFAULT_ACCOUNT_BALANCE)
        }
      })
    },
    SET_ALL_ACCOUNT_BALANCES(state, accountBalances) {
      Object.entries(accountBalances).forEach(([account_id, balances]) => {
        Vue.set(state.allAccountBalances, account_id, balances)
      })
    },
    UPDATE_ACCOUNT_BALANCES(state, { account, account_id, cleared, uncleared, working }) {
      if (state.allAccountBalances[account_id] === undefined) {
        Vue.set(state.allAccountBalances, account_id, DEFAULT_ACCOUNT_BALANCE)
      }
      updateAccountBalances(state.allAccountBalances, account, account_id, cleared, uncleared, working)
    },
    RESET_ACCOUNT_STATE(state) {
      Object.entries(DEFAULT_ACCOUNT_STATE).forEach(([key, value]) => {
        Vue.set(state, key, value)
      })
    },
    SET_ALL_ACCOUNT_TRANSACTION_COUNTS(state, accountTransactionCounts) {
      Vue.set(state, 'accountTransactionCounts', accountTransactionCounts)
    },
    INCREMENT_ACCOUNT_TRANSACTION_COUNTS_BY(state, { account_id, increment }) {
      Vue.set(state.accountTransactionCounts, account_id, state.accountTransactionCounts[account_id] + increment)
    }
  },
  actions: {
    createUpdateAccount(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', { current: payload.account, previous: null }).then((response) => {
        const date = moment(new Date()).format('YYYY-MM-DD')
        if (payload.initialBalance) {
          const initTransaction = {
            account: response._id.slice(-ID_LENGTH.account),
            category: null,
            cleared: true,
            approved: true,
            value: sanitizeValueInput(payload.initialBalance) * 100,
            date: date,
            memo: null,
            reconciled: true,
            flag: '#ffffff',
            payee: `---------------------initial-balance`,
            transfer: null,
            splits: [],
            _id: `b_${context.getters.selectedBudgetId}${ID_NAME.transaction}${this._vm.generateId(date)}`
          }
          return context.dispatch('createOrUpdateTransaction', { current: initTransaction, previous: null })
        }

        return
      })
    },
    // deleteAccount({ dispatch, getters }, accountId) {
    //   const account = getters.accountsById[accountId.slice(-ID_LENGTH.account)]
    //   console.log('account', account)
    //   return dispatch('deleteDocumentFromPouchAndVuex', account, { root: true })
    // },
    // deleteAccount({dispatch}, accountId) {
    //   return new Promise((resolve, reject) => {
    //     accountId = accountId.slice(-ID_LENGTH.account)
    //     this._vm.$pouch
    //       .query((doc, emit) => {
    //         if (doc.account === accountId) {
    //           emit(doc)
    //         }
    //       })
    //       .then((result2) => {
    //         if (result2.total_rows > 0) {
    //           // Account still has transactions, so resolve with amount of transactions in account for error message.
    //           reject(result2.total_rows)
    //         } else {
    //           // Dispatch account for deletion
    //           dispatch('commitDocToPouchAndVuex', { current: null, previous: payload })
    //           resolve('Success')
    //         }
    //       })
    //       .catch((err) => {
    //         reject('Error')
    //         console.log(err)
    //       })
    //   })
    // }
    deleteAccount({ dispatch, commit, getters }, accountId) {
      accountId = accountId.slice(-ID_LENGTH.account)
      return dispatch('fetchAccountTransactionsCount', accountId).then((count) => {
        if (count > 0) {
          commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: `Account still has ${count} transactions. Cannot delete.`,
            snackbarColor: 'error'
          })
          console.warn(`Account still has ${count} transactions. Cannot delete.`)
          return
        }
        const account = getters.accountsById[accountId]
        dispatch('commitDocToPouchAndVuex', { current: null, previous: account })
      })
    }
  }
}

const updateAccountBalances = (current_balances, account, account_id, cleared, uncleared, working) => {
  let updated_balances = { ...current_balances[account_id] }
  updated_balances.cleared += cleared * account.sign
  updated_balances.uncleared += uncleared * account.sign
  updated_balances.working += working * account.sign
  if (working * account.sign > 0) {
    updated_balances.income += working * account.sign
  } else {
    updated_balances.expense += working * account.sign * -1
  }

  Vue.set(current_balances, account_id, updated_balances)
}

export { updateAccountBalances }
