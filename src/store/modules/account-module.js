import { sanitizeValueInput } from "../../helper"

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    createUpdateAccount(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', payload.account).then((response) => {
        const date = new Date().toISOString().split('T')[0]
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
          return context.dispatch('createOrUpdateTransaction', initTransaction)
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
