import { sanitizeValueInput, randomInt, randomString} from '../../helper'

export default {
  state: {},
  getters: {
    transactionsOnBudget: (state, getters) => {
      //Get list of account _ids that are on budget
      var accounts = getters.accountsOnBudget.map((account) => account._id.slice(-ID_LENGTH.account))
      var transactionsOnBudget = []

      //
      for (let [key, value] of Object.entries(getters.transactions_by_account)) {
        if (accounts.includes(key)) {
          transactionsOnBudget = transactionsOnBudget.concat(value)
        }
      }
      return transactionsOnBudget
    }
  },
  mutations: {
    UPDATE_RECONCILED(state, transactionsToLock) {
      transactionsToLock.map((transactionToLock) => (transactionToLock.reconciled = true))
    }
  },
  actions: {
    /**
     * Create/update the mirrored transfer transaction
     */
    saveMirroredTransferTransaction(context, payload) {
      var mirroredTransferTransaction = Object.assign({}, payload)
      var mirrorExists = false

      //Check if the mirrored transaction doesn't exist then we create
      if (payload.transfer) {
        const index =
          context.getters.transactionsIndexById[
            `b_${context.getters.selectedBudgetID}${ID_NAME.transaction}${payload.transfer}`
          ]
        if (index) {
          mirrorExists = true
          mirroredTransferTransaction = Object.assign({}, context.getters.transactions[index])
        }
      }
      if (!mirrorExists) {
        //Creating new transaction
        mirroredTransferTransaction._id = `b_${context.getters.selectedBudgetID}${
          ID_NAME.transaction
        }${this._vm.generateId(payload.date)}`

        delete mirroredTransferTransaction._rev
      }
      //Create the mirrored transaction
      mirroredTransferTransaction.value = -payload.value
      mirroredTransferTransaction.transfer = payload._id.slice(-ID_LENGTH.transaction)
      mirroredTransferTransaction.account = payload.payee
      mirroredTransferTransaction.payee = payload.account //The payee is the _id of the other account
      mirroredTransferTransaction.memo = payload.memo
      mirroredTransferTransaction.category = null
      mirroredTransferTransaction.date = payload.date
      mirroredTransferTransaction.cleared = payload.cleared

      context.dispatch('commitDocToPouchAndVuex', mirroredTransferTransaction)

      return mirroredTransferTransaction._id.slice(-ID_LENGTH.transaction)
    },

    /**
     * Create or update transaction
     * @param {doc} payload The transaction to create or update
     */
    async createOrUpdateTransaction(context, payload) {
      //Check if this is a transfer transaction. if so, get the account ID
      //TODO: only let this be a transfer if the account actually exists?
      if (payload.payee && payload.payee.includes('Transfer: ')) {
        const destination_account_id = Object.keys(context.getters.account_map).find(
          (key) => context.getters.account_map[key] === payload.payee.slice(10)
        )
        payload.payee = destination_account_id
        const mirroredTransferID = await context.dispatch('saveMirroredTransferTransaction', payload)
        payload.transfer = mirroredTransferID
        payload.category = null
      } else {
        payload.transfer = null
      }

      payload.value = sanitizeValueInput(payload.value)

      await context.dispatch('getPayeeID', payload.payee).then((response) => {
        payload.payee = response
        return context.dispatch('commitDocToPouchAndVuex', payload)
      })
    },

    /**
     * Completes Reconciliation
     * @param {doc} payload Any difference to that needs and adjustment transaction
     */
    completeReconciliation(context, payload) {
      if (payload.adjustmentTransaction) {
        context.dispatch('createOrUpdateTransaction', payload.adjustmentTransaction)
      }

      //Search for transactions to lock
      const transactionsToLock = context.getters.transactions_by_account[payload.account]
        .filter((trans) => !trans.reconciled)
        .filter((trans) => trans.cleared)

      //Update reconciled field
      // transactionsToLock.map((x) => (x.reconciled = true))
      context.commit('UPDATE_RECONCILED', transactionsToLock)

      //Commit to pouchdb
      context.dispatch('commitBulkDocsToPouchAndVuex', transactionsToLock)
    },

    createMockTransactions(context, amount) {
      return new Promise((resolve, reject) => {
        const num_transactions = parseInt(amount)
        if (!num_transactions) {
          reject('Invalid amount')
        }
        if (context.getters.accounts.length < 1) {
          reject('At least one account is required')
        }
        const year_start = 2017
        const year_end = 2021

        const categories = context.getters.categories
        const accounts = context.getters.accounts

        const mock_transactions = Array(num_transactions)
          .fill(0)
          .map(() => {
            const year = randomInt(year_start, year_end)
            const month = randomInt(1, 12).toString().padStart(2, '0')
            const day = randomInt(1, 28).toString().padStart(2, '0')
            const date = `${year}-${month}-${day}`
            const transaction_id = this._vm.generateId(date)

            const category = categories[randomInt(3, categories.length - 1)]
            const category_id = category._id ? category._id.slice(-ID_LENGTH.category) : null
            const account_id = accounts[randomInt(0, accounts.length - 1)]._id.slice(-ID_LENGTH.account)
            return {
              account: account_id,
              category: category_id,
              cleared: true,
              approved: true,
              value: randomInt(-20000, 30000),
              date: date,
              memo: randomString(randomInt(0, 250)),
              reconciled: false,
              flag: '#ffffff',
              payee: null,
              transfer: null,
              splits: [],
              _id: `b_${context.getters.selectedBudgetID}${ID_NAME.transaction}${transaction_id}`,
              _rev: ''
            }
          })
        console.log('MOCK TRANSACTIONS')
        console.log(mock_transactions)

        let mock_budget_data = []
        for (let year = year_start; year <= year_end; year++) {
          for (let month = 1; month <= 12; month++) {
            const date = `${year}-${month.toString().padStart(2, '0')}`
            categories.forEach((category) => {
              const category_id = category._id ? category._id.slice(-ID_LENGTH.category) : null
              if (category_id) {
                const budget_amount_item = {
                  budget: randomInt(-20000, 30000),
                  overspending: null,
                  note: randomString(randomInt(0, 100)),
                  _id: `b_${context.getters.selectedBudgetID}${ID_NAME.monthCategory}${date}_${category_id}`
                }
                mock_budget_data.push(budget_amount_item)
              }
            })
          }
        }

        // context.dispatch('commitBulkDocsToPouchAndVuex', mock_budget_data.concat(mock_transactions)).then(() => {
        //   resolve(mock_transactions.length)
        // })
      })
    }
  }
}
