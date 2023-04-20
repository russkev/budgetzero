import { isArray } from 'lodash'
import _ from 'lodash'
import { DEFAULT_ACCOUNT_BALANCE, DEFAULT_MONTH_BALANCE, ID_LENGTH, ID_NAME, NONE } from '../../constants'
import { sanitizeValueInput, randomInt, randomString } from '../../helper'
import { updateAccountBalances } from './account-module'
import { initCategoryBalancesMonth, updateSingleCategory } from './category-module'
import { updateMonthBalances } from './category-module'
import { compareAscii } from './id-module'

export default {
  getters: {
    dataTableHeaders: () => dataTableHeaders
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
        if (isArray(current.splits) && current.splits.length > 0) {
          current.splits.map((split) => {
            split.value = sanitizeValueInput(split.value)
          })
        }
      }

      return context.dispatch('commitDocToPouchAndVuex', { current, previous })
    },

    updateRunningBalance(context, { transaction, isDeleted }) {
      return context
        .dispatch('fetchPrecedingTransaction', { transaction, isDeleted })
        .then((result) => {
          const return_value = result === null ? transaction : result.doc
          return return_value
        })
        .then((result) => {
          return context.dispatch('fetchAllSucceedingTransactions', result)
        })
        .then((rows) => {
          if (!rows || rows.length === 0) {
            return
          }
          let running_balance = 0
          if (compareAscii(rows[0].doc._id, transaction._id) < 0) {
            running_balance = rows[0].doc.balance - rows[0].doc.value
          }
          const updated_docs = rows.map((row) => {
            running_balance += row.doc.value
            return {
              current: {
                ...row.doc,
                balance: running_balance
              },
              previous: row.doc
            }
          })
          let result_promise = null
          if (updated_docs.length > 0) {
            result_promise = context.dispatch('commitBulkDocsToPouch', updated_docs)
          }
          return result_promise
        })
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
      context.commit('UPDATE_RECONCILED', transactionsToLock)

      //Commit to pouchdb
      context.dispatch('commitBulkDocsToPouchAndVuex', transactionsToLock)
    },

    async createMockTransactions(context, { amount, start, end }) {
      const num_transactions = parseInt(amount)
      if (!num_transactions) {
        throw 'Invalid amount'
      }
      if (context.getters.accounts.length < 1) {
        throw 'At least one account is required'
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

      let mock_category_data = []
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
            mock_category_data.push(budget_amount_item)
          }
        })
      })

      const valid_mock_transactions = await context.dispatch(
        'validBulkDocs',
        mock_transactions.map((doc) => {
          return { current: doc, previous: null }
        })
      )
      const valid_category_data = await context.dispatch(
        'validBulkDocs',
        mock_category_data.map((doc) => {
          return { current: doc, previous: null }
        })
      )

      return Promise.all([
        context.dispatch('commitBulkDocsToPouch', valid_mock_transactions),
        context.dispatch('commitBulkDocsToPouch', valid_category_data)
      ])
      // })
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
  console.warn('PROCESS TRANSFER NOT IMPLEMENTED')
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

const calculateTransactionBalanceUpdate = (current, previous, account) => {
  // Note that 'cleared' in a document (like current and previous) is the isCleared boolean value.
  // 'cleared' in a transaction_payload is the dollar amount that has been cleared
  if (previous === null) {
    previous = {
      cleared: current.cleared,
      value: 0
    }
  }
  if (current === null) {
    current = {
      cleared: previous.cleared,
      value: 0
    }
  }

  let transaction_payload = {
    account_id: account._id.slice(-ID_LENGTH.account),
    account: account,
    cleared: 0,
    uncleared: 0,
    working: (current.value - previous.value) * account.sign
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

const parseAllTransactions = (allTransactions, month_category_balances, getters, dispatch) => {
  let balances = { account: {}, category: {}, month: {} }
  if (allTransactions === undefined) {
    return balances
  }

  const month_category_months = Object.keys(month_category_balances)
  let month_category_index = 0
  // let monthBalances = {}
  let updated_transaction_docs = []

  let running_balances = getters.accounts.reduce((partial, account) => {
    const account_id = account._id.slice(-ID_LENGTH.account)
    partial[account_id] = 0
    return partial
  }, {})

  allTransactions.map((row) => {
    const account_id = row.doc.account
    const account_doc = getters.accountsById[account_id]
    if (account_doc === undefined) {
      console.error('Account not found for id:', account_id)
      return
    }
    const working = row.doc.value
    const month = row.doc.date.slice(0, 7)
    let category_id = row.doc.category
    if (category_id === undefined || category_id === null) {
      category_id = NONE._id
    }
    const master_id = _.get(getters.categoriesById, [category_id, 'masterCategory'], null)
    const cleared = row.doc.cleared ? working : 0
    const uncleared = row.doc.cleared ? 0 : working
    const splits = row.doc.splits ? row.doc.splits : []

    // _.defaultsDeep(balances.account, defaultAccountBalance(account_id))
    _.defaultsDeep(balances.account, { [account_id]: DEFAULT_ACCOUNT_BALANCE })
    _.defaultsDeep(balances.month, { [month]: DEFAULT_MONTH_BALANCE })
    updateAccountBalances(balances.account, account_doc, account_id, cleared, uncleared, working)
    updateMonthBalances(balances.month, master_id, account_doc, month, working)

    const running_balance = running_balances[account_id] + working
    running_balances[account_id] = running_balance
    const updated_transaction_doc = getUpdatedDoc(row.doc, running_balance)
    if (updated_transaction_doc) {
      updated_transaction_docs.push({ current: updated_transaction_doc, previous: row.doc })
    }

    initFromMonthCategory(month)
    const category_items = splits.length > 0 ? splits : [{ category: category_id, value: working }]

    category_items.map((item) => {
      if (balances.category[month] === undefined) {
        balances.category[month] = initCategoryBalancesMonth(balances.category, month, getters.categories)
      }
      balances.category[month] = updateSingleCategory(balances.category[month], item.category, {
        amount: item.value,
        account: account_doc
      })
    })
  })

  if (updated_transaction_docs.length > 0) {
    dispatch('commitBulkDocsToPouchAndVuex', updated_transaction_docs)
  }

  initFromMonthCategory('9999-99')

  function initFromMonthCategory(month) {
    if (balances.category[month] !== undefined) {
      return
    }
    while (
      month_category_index < month_category_months.length &&
      compareAscii(month_category_months[month_category_index], month) <= 0
    ) {
      const current_month = month_category_months[month_category_index]
      balances.category[current_month] = initCategoryBalancesMonth(balances.category, current_month, getters.categories)
      Object.entries(month_category_balances[current_month]).forEach(([category_id, category]) => {
        balances.category[current_month][category_id].doc = _.get(
          month_category_balances,
          [current_month, category_id, 'doc'],
          {}
        )
      })
      month_category_index += 1
    }
  }

  return balances
}

const isUncategorized = (categoryId, splits) => {
  // const categoryId = transaction.category
  // const splits = transaction.splits
  if (
    (categoryId === undefined || categoryId === null || categoryId === NONE._id) &&
    (splits === undefined || splits.length === 0)
  ) {
    return true
  } else if (splits !== undefined && splits.length > 1) {
    return splits.some((split) => split.category === NONE._id)
  }
}

export { calculateTransactionBalanceUpdate, parseAllTransactions, isUncategorized }

function getUpdatedDoc(transaction_doc, running_balance) {
  let updated_transaction_doc = null
  if (transaction_doc.balance !== running_balance) {
    updated_transaction_doc = {
      ...transaction_doc,
      balance: running_balance
    }
  }
  if (!Array.isArray(transaction_doc.splits)) {
    if (updated_transaction_doc) {
      updated_transaction_doc = {
        ...updated_transaction_doc,
        splits: []
      }
    } else {
      updated_transaction_doc = {
        ...transaction_doc,
        splits: []
      }
    }
  }
  return updated_transaction_doc
}
