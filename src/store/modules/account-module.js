import { sanitizeValueInput } from '../../helper'
import moment from 'moment'
import { DEFAULT_ACCOUNT_BALANCE, ID_LENGTH, ID_NAME } from '../../constants'
import _ from 'lodash'
import Vue from 'vue'

const DEFAULT_ACCOUNT_STATE = {
  allAccountBalances: {},
  accounts: [],
  intlCurrency: new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }),
}

export default {
  state: {
    ...DEFAULT_ACCOUNT_STATE
  },
  getters: {
    allAccountBalances: (state) => state.allAccountBalances,
    accounts: (state) => state.accounts,
    accountsById: (state) => {
      return state.accounts.reduce((partial, account) => {
        partial[account._id.slice(-ID_LENGTH.account)] = account
        return partial
      }, {})
    },
    accountsOnBudget: (state) => {
      return state.accounts.filter((account) => account.onBudget)
    },
    accountsOffBudget: (state) => {
      return state.accounts.filter((account) => !account.onBudget)
    },
    intlCurrency: (state) => state.intlCurrency,
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
    deleteAccount(context, payload) {
      return new Promise((resolve, reject) => {
        const myId = payload._id.slice(-ID_LENGTH.account)
        this._vm.$pouch
          .query((doc, emit) => {
            if (doc.account === myId) {
              emit(doc)
            }
          })
          .then((result2) => {
            if (result2.total_rows > 0) {
              // Account still has transactions, so resolve with amount of transactions in account for error message.
              reject(result2.total_rows)
            } else {
              // Dispatch account for deletion
              context.dispatch('commitDocToPouchAndVuex', { current: null, previous: payload })
              resolve('Success')
            }
          })
          .catch((err) => {
            reject('Error')
            console.log(err)
          })
      })
    }
  }
}

const updateAccountBalances = (current_balances, account, account_id, cleared, uncleared, working) => {
  let updated_balances = {...current_balances[account_id]}
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
