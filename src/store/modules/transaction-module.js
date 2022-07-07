import { sanitizeValueInput, randomInt, randomString} from '../../helper'
import { ID_LENGTH, ID_NAME, NONE } from '../../constants'

const DEFAULT_TRANSACTIONS_STATE = {
  // transactions: []
}

export default {
  state: {
    ...DEFAULT_TRANSACTIONS_STATE
  },
  getters: {
    // transactions: (state) => state.transactions,
    // transactions_by_account: (state, getters) => _.groupBy(getters.transactions, 'account'),
    dataTableHeaders: () => dataTableHeaders
    // transactionsOnBudget: (state, getters) => {
    //   //Get list of account _ids that are on budget
    //   var accounts = getters.accountsOnBudget.map((account) => account._id.slice(-ID_LENGTH.account))
    //   var transactionsOnBudget = []

    //   //
    //   for (let [key, value] of Object.entries(getters.transactions_by_account)) {
    //     if (accounts.includes(key)) {
    //       transactionsOnBudget = transactionsOnBudget.concat(value)
    //     }
    //   }
    //   return transactionsOnBudget
    // }
  },
  mutations: {
    // SET_TRANSACTIONS(state, transactions) {
    //   state.transactions = transactions
    // }
    // UPDATE_RECONCILED(state, transactionsToLock) {
    //   transactionsToLock.map((transactionToLock) => (transactionToLock.reconciled = true))
    // }
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
            `b_${context.getters.selectedBudgetId}${ID_NAME.transaction}${payload.transfer}`
          ]
        if (index) {
          mirrorExists = true
          mirroredTransferTransaction = Object.assign({}, context.getters.transactions[index])
        }
      }
      if (!mirrorExists) {
        //Creating new transaction
        mirroredTransferTransaction._id = `b_${context.getters.selectedBudgetId}${
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
      mirroredTransferTransaction.category = NONE._id
      mirroredTransferTransaction.date = payload.date
      mirroredTransferTransaction.cleared = payload.cleared

      context.dispatch('commitDocToPouchAndVuex', { current: mirroredTransferTransaction, previous: null })

      return mirroredTransferTransaction._id.slice(-ID_LENGTH.transaction)
    },

    /**
     * Create or update transaction
     * @param {doc} current The updated document, null if intending to delete
     * @param {doc} previous The document that already exists on the database, null to create
     */
    async createOrUpdateTransaction(context, { current, previous }) {
      if (current) {
        current = await processTransfer(current, context)
        current.value = sanitizeValueInput(current.value)
        // const payee = await context.dispatch('getPayeeID', current.payee)
        // current.payee = payee
      }

      return context.dispatch('commitDocToPouchAndVuex', { current, previous })
    },

    /**
     * Completes Reconciliation
     * @param {doc} payload Any difference to that needs and adjustment transaction
     */
    completeReconciliation(context, payload) {
      if (payload.adjustmentTransaction) {
        context.dispatch('createOrUpdateTransaction', { current: payload.adjustmentTransaction, previous: null })
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

    createMockTransactions(context, { amount, start, end }) {
      return new Promise((resolve, reject) => {
        const num_transactions = parseInt(amount)
        if (!num_transactions) {
          reject('Invalid amount')
        }
        if (context.getters.accounts.length < 1) {
          reject('At least one account is required')
        }

        const month_array = monthArray(start, end)
        const categories = context.getters.categories
        const accounts = context.getters.accounts

        const mock_transactions = Array(num_transactions)
          .fill(0)
          .map(() => {
            const year_month = month_array[randomInt(0, month_array.length - 1)]
            const day = randomInt(1, 28).toString().padStart(2, '0')
            const date = `${year_month}-${day}`
            const transaction_id = this._vm.generateId(date)

            const category = categories[randomInt(3, categories.length - 1)]
            const category_id = category._id.slice(-ID_LENGTH.category)
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
              _id: `b_${context.getters.selectedBudgetId}${ID_NAME.transaction}${transaction_id}`,
              _rev: ''
            }
          })

        let mock_budget_data = []
        month_array.forEach((year_month) => {
          categories.forEach((category) => {
            const category_id = category._id.slice(-ID_LENGTH.category)
            if (category_id) {
              const budget_amount_item = {
                budget: randomInt(-20000, 30000),
                overspending: null,
                note: randomString(randomInt(0, 100)),
                _id: `b_${context.getters.selectedBudgetId}${ID_NAME.monthCategory}${year_month}_${category_id}`
              }
              mock_budget_data.push(budget_amount_item)
            }
          })
        })

        context.dispatch('commitBulkDocsToPouchAndVuex', mock_budget_data.concat(mock_transactions)).then(() => {
          resolve(mock_transactions.length)
        })
      })
    }
  }
}

/**
 * Check if this is a transfer transaction. if so, get the account ID
 * @param {*} transaction The transaction document to process
 * @param {*} context The Vue context 
 * @returns The updated transaction document
 */
async function processTransfer(transaction, context) {
  console.warn("PROCESS TRANSFER NOT IMPLEMENTED")
  return transaction
  //TODO: only let this be a transfer if the account actually exists?

  // if (transaction && transaction.payee && transaction.payee.includes('Transfer: ')) {
  //   const destination_account_id = Object.keys(context.getters.account_map).find(
  //     (key) => context.getters.account_map[key] === transaction.payee.slice(10)
  //   )
  //   const mirrored_transfer_id = await context.dispatch('saveMirroredTransferTransaction', transaction)

  //   return {
  //     ...transaction,
  //     payee: destination_account_id,
  //     transfer: mirrored_transfer_id,
  //     category: NONE._id
  //   }
  // } else {
  //   return {
  //     ...transaction,
  //     transfer: null
  //   }
  // }
}

function monthArray(start, end) {
  const start_array = start.split('-')
  const end_array = end.split('-')
  const year_start = parseInt(start_array[0])
  const month_start = parseInt(start_array[1])
  const year_end = parseInt(end_array[0])
  const month_end = parseInt(end_array[1])

  const month_array = []

  for (let current_year = year_start; current_year <= year_end; current_year++) {
    const m_start = current_year === year_start ? month_start : 1
    const m_end = current_year === year_end ? month_end : 12
    for (let current_m = m_start; current_m <= m_end; current_m++) {
      month_array.push(`${current_year.toString()}-${current_m.toString().padStart(2, '0')}`)
    }
  }
  return month_array
}

const calculateTransactionBalanceUpdate = (current, previous) => {
    // Note that 'cleared' in a document (like current and previous) is the isCleared boolean value.
    // 'cleared' in a transaction_payload is the dollar amount that has been cleared
    if (previous === null) {
      previous = {
        cleared: current.cleared,
        value: 0,
      }
    }
    if (current === null) {
      current = {
        cleared: previous.cleared,
        value: 0
      }
    }

    let transaction_payload = {
      account_id: current.account,
      cleared: 0,
      uncleared: 0,
      working: current.value - previous.value
    }

    if (current.cleared && previous.cleared) {
      transaction_payload.cleared = transaction_payload.working
    } else if (current.cleared && !previous.cleared) {
      transaction_payload.cleared = current.value
      transaction_payload.uncleared = -current.value
    } else if (!current.cleared && previous.cleared) {
      transaction_payload.cleared = -current.value
      transaction_payload.uncleared = current.value
    } else {
      transaction_payload.uncleared = transaction_payload.working
    }
    return transaction_payload
}

export { calculateTransactionBalanceUpdate }

const dataTableHeaders = [
  {
    text: '',
    class: 'transaction-table-header',
    value: 'data-table-select',
  },
  {
    text: '',
    class: 'transaction-table-header',
    value: 'cleared',
  },
  {
    text: 'Date',
    class: 'transaction-table-header',
    value: 'date',
    align: 'left'
  },
  {
    text: 'Category',
    class: 'transaction-table-header',
    value: 'category',
    align: 'left'
  },
  {
    text: 'Memo',
    class: 'transaction-table-header',
    value: 'memo',
    align: 'left'
  },
  {
    text: 'Outflow',
    class: 'transaction-table-header',
    value: 'outflow',
    align: 'left',
  },
  {
    text: 'Inflow',
    class: 'transaction-table-header',
    value: 'inflow',
    align: 'left',
  }
]
