import { sanitizeValueInput } from '../../helper'
import moment from 'moment'
import { ID_LENGTH, ID_NAME } from '../../constants'

export default {
  state: {
    allAccountBalances: {}
    // monthsInUse: []
  },
  getters: {
    allAccountBalances: (state) => state.allAccountBalances
  },
  mutations: {
    SET_ALL_ACCOUNT_BALANCES(state, payload) {
      state.allAccountBalances = payload
    },

    UPDATE_ACCOUNT_BALANCES(state, { account_id, cleared, uncleared, working }) {
      _.defaultsDeep(state.allAccountBalances, defaultAccountBalance(account_id))
      updateAccountBalances(state.allAccountBalances, account_id, cleared, uncleared, working)
    }
  },
  actions: {
    createUpdateAccount(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', { current: payload.account, previous: null }).then((response) => {
        const date = moment(new Date()).format('YYYY-MM-DD')
        if (payload.initialBalance) {
          const initTransaction = {
            account: response.id.slice(-ID_LENGTH.account),
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
            _id: `b_${context.getters.selectedBudgetID}${ID_NAME.transaction}${this._vm.generateId(date)}`
          }
          console.log('initTransaction', initTransaction)
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
            console.log('delete account', result2.total_rows)
            if (result2.total_rows > 0) {
              // Account still has transactions, so resolve with amount of transactions in account for error message.
              reject(result2.total_rows)
            } else {
              // Dispatch account for deletion
              context.dispatch('deleteDocFromPouchAndVuex', payload)
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

const updateAccountBalances = (current_balances, account_id, cleared, uncleared, working) => {
  current_balances[account_id].cleared += cleared
  current_balances[account_id].uncleared += uncleared
  current_balances[account_id].working += working
}

const defaultAccountBalance = (account_id) => {
  return {
    [account_id]: {
      cleared: 0,
      uncleared: 0,
      working: 0
    }
  }
}
export { updateAccountBalances, defaultAccountBalance }
