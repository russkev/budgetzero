import Vue, { nextTick } from 'vue'
import { DEFAULT_TRANSACTION, DEFAULT_TRANSACTIONS_PER_PAGE, ID_LENGTH, ID_NAME, NONE } from '../../constants'
import { compareAscii } from '@/store/modules/id-module.js'
import { generateId } from './id-module'
import _ from 'lodash'
import moment from 'moment'

const DEFAULT_ACCOUNT_TRANSACTIONS_STATE = {
  transactions: [],
  editedTransaction: {
    ...DEFAULT_TRANSACTION
  },
  originalTransaction: {
    ...DEFAULT_TRANSACTION
  },
  editedTransactionInitialDate: moment(new Date()).format('YYYY-MM-DD'),
  editedTransactionIndex: -1,
  accountId: '',
  accountOptions: {},
  numServerTransactions: 0,
  itemsPerPage: DEFAULT_TRANSACTIONS_PER_PAGE,
  selectedTransactionIds: [],
  isCreatingNewTransaction: false,
  isLoading: false,
  importOfxIsOpen: false,
  importCsvIsOpen: false
}

export default {
  namespaced: true,
  state: {
    ...DEFAULT_ACCOUNT_TRANSACTIONS_STATE
  },
  getters: {
    accountId: (state) => state.accountId,
    account: (state, getters, rootState, rootGetters) =>
      rootGetters.accountsById[getters.accountId.slice(-ID_LENGTH.account)],
    accountName: (state, getters) => getters.account.name,
    initialBalance: (state, getters) => _.get(getters, ['account', 'initialBalance'], 0),
    accountOptions: (state) => {
      return { ...state.accountOptions, accountId: state.accountId }
    },
    transactions: (state) => state.transactions,
    transactionsById: (state) =>
      state.transactions.reduce((partial, transaction) => {
        partial[transaction._id] = transaction
        return partial
      }, {}),
    editedTransaction: (state) => state.editedTransaction,
    editedTransactionInitialDate: (state) => state.editedTransactionInitialDate,
    editedTransactionIndex: (state) => state.editedTransactionIndex,
    // numServerTransactions: (state) => state.numServerTransactions,
    numServerTransactions: (state, getters, rootState, rootGetters) =>
      rootGetters.accountTransactionCounts[getters.accountId],
    itemsPerPage: (state) => state.itemsPerPage,
    accountDoc: (state, getters, rootState, rootGetters) => rootGetters.accountsById[getters.accountId],
    selectedTransactions: (state, getters) =>
      state.selectedTransactionIds.map((transactionId) => getters.transactionsById[transactionId]),
    isCreatingNewTransaction: (state) => state.isCreatingNewTransaction,
    dataTableHeaders: () => dataTableHeaders,
    isLoading: (state) => state.isLoading,
    tableIsDisabled: (state, getters, rootState, rootGetters) =>
      state.isLoading || state.importOfxIsOpen || state.importCsvIsOpen || rootGetters.isExporting,
    importOfxIsOpen: (state) => state.importOfxIsOpen,
    importCsvIsOpen: (state) => state.importCsvIsOpen,
    importIds: (state, getters, rootState, rootGetters) => {
      return _.get(rootGetters, ['allImportIds', getters.accountId], {})
    }
  },
  mutations: {
    SET_ACCOUNT_ID(state, account_id) {
      if (account_id === state.accountId) {
        return
      }
      Vue.set(state, 'editedTransaction', {
        ...DEFAULT_TRANSACTION,
        account: account_id,
        date: moment(new Date()).format('YYYY-MM-DD')
      })
      Vue.set(state, 'accountId', account_id)
    },
    SET_ACCOUNT_OPTIONS(state, options) {
      Vue.set(state, 'accountOptions', options)
    },
    SET_TRANSACTIONS(state, transactions) {
      Vue.set(state, 'transactions', transactions)
    },
    PUSH_TRANSACTION(state, transaction) {
      const new_transactions = [...state.transactions, transaction].sort((a, b) => compareAscii(b._id, a._id))
      Vue.set(state, 'transactions', new_transactions)
    },
    SET_EDITED_TRANSACTION(state, edited_transaction) {
      Vue.set(state, 'editedTransaction', edited_transaction)
    },
    SET_EDITED_TRANSACTION_ID(state, id) {
      Vue.set(state.editedTransaction, '_id', id)
    },
    SET_EDITED_TRANSACTION_VALUE(state, value) {
      Vue.set(state.editedTransaction, 'value', value)
    },
    SET_EDITED_TRANSACTION_CATEGORY(state, category_id) {
      Vue.set(state.editedTransaction, 'category', category_id)
    },
    SET_EDITED_TRANSACTION_CLEARED(state, value) {
      Vue.set(state.editedTransaction, 'cleared', value)
    },
    SET_EDITED_TRANSACTION_MEMO(state, value) {
      Vue.set(state.editedTransaction, 'memo', value)
    },
    SET_EDITED_TRANSACTION_NOTE(state, value) {
      Vue.set(state.editedTransaction, 'note', value)
    },
    SET_EDITED_TRANSACTION_DATE(state, date) {
      Vue.set(state.editedTransaction, 'date', date)
    },
    PUSH_EDITED_TRANSACTION_SPLIT(state, splitObject) {
      state.editedTransaction.splits.push(splitObject)
    },
    SET_EDITED_TRANSACTION_SPLIT_VALUE(state, { index, value }) {
      if (index > -1 && index < state.editedTransaction.splits.length) {
        Vue.set(state.editedTransaction.splits[index], 'value', value)
      }
    },
    SET_EDITED_TRANSACTION_SPLIT_CATEGORY(state, { index, categoryId }) {
      if (index > -1 && index < state.editedTransaction.splits.length) {
        Vue.set(state.editedTransaction.splits[index], 'category', categoryId)
      }
    },
    REMOVE_EDITED_TRANSACTION_SPLIT(state, index) {
      if (index > -1) {
        state.editedTransaction.splits.splice(index, 1)
      }
    },

    CLEAR_EDITED_TRANSACTION_SPLIT(state) {
      // Vue.set(state.editedTransaction, 'splits', [])
      while (state.editedTransaction.splits.length > 0) {
        state.editedTransaction.splits.pop()
      }
    },
    REVERSE_EDITED_TRANSACTION_SPLIT_VALUES(state) {
      state.editedTransaction.splits.forEach((split) => {
        split.value = -split.value
      })
    },
    CLEAR_EDITED_TRANSACTION(state) {
      if (state.isCreatingNewTransaction && state.editedTransactionIndex > -1) {
        state.transactions.splice(state.editedTransactionIndex, 1)
      }
      Vue.set(state, 'isCreatingNewTransaction', false)
      Vue.set(state, 'editedTransactionIndex', -1)
      Vue.set(state, 'editedTransaction', {
        ...DEFAULT_TRANSACTION,
        account: state.accountId,
        date: moment(new Date()).format('YYYY-MM-DD')
      })
    },
    SET_EDITED_TRANSACTION_INITIAL_DATE(state, date) {
      Vue.set(state, 'editedTransactionInitialDate', date)
    },
    SET_EDITED_TRANSACTION_INDEX(state, index) {
      Vue.set(state, 'editedTransactionIndex', index)
    },
    // SET_NUM_SERVER_TRANSACTIONS(state, num_transactions) {
    //   Vue.set(state, 'numServerTransactions', num_transactions)
    // },
    SET_ITEMS_PER_PAGE(state, num_items) {
      Vue.set(state, 'itemsPerPage', num_items)
    },
    SET_SELECTED_TRANSACTIONS(state, transactions) {
      const transactionIds = transactions.reduce((partial, transaction) => {
        if (transaction && transaction._id) {
          partial.push(transaction._id)
        }
        return partial
      }, [])
      Vue.set(state, 'selectedTransactionIds', transactionIds)
    },
    CLEAR_SELECTED_TRANSACTIONS(state) {
      Vue.set(state, 'selectedTransactionIds', [])
    },
    SET_IS_CREATING_NEW_TRANSACTION(state, is_creating) {
      Vue.set(state, 'isCreatingNewTransaction', is_creating)
    },
    SET_IS_LOADING(state, is_loading) {
      Vue.set(state, 'isLoading', is_loading)
    },
    SET_IMPORT_OFX_IS_OPEN(state, is_open) {
      Vue.set(state, 'importOfxIsOpen', is_open)
    },
    SET_IMPORT_CSV_IS_OPEN(state, is_open) {
      Vue.set(state, 'importCsvIsOpen', is_open)
    },
    RESET_ACCOUNT_TRANSACTIONS(state) {
      console.log('RESET_ACCOUNT_TRANSACTIONS')
      for (let key in DEFAULT_ACCOUNT_TRANSACTIONS_STATE) {
        Vue.set(state, key, DEFAULT_ACCOUNT_TRANSACTIONS_STATE[key])
      }
    }
  },
  actions: {
    /*
     * Get just the transactions that will appear on screen
     */
    async getTransactions({ dispatch, commit, getters, rootGetters }, account_id) {
      commit('SET_IS_LOADING', true)

      if (account_id !== undefined) {
        commit('SET_ACCOUNT_ID', account_id)
        const accountExists = await nextTick(() => {
          if (getters.accountDoc === undefined) {
            return false
          } else {
            return true
          }
        })
        if (!accountExists) {
          return
        }
      }

      if (rootGetters.accounts.length < 1) {
        commit('SET_IS_LOADING', false)
        return
      }

      dispatch('fetchTransactionsForAccount', getters.accountOptions, { root: true })
        .then((result) => {
          // commit('SET_NUM_SERVER_TRANSACTIONS', result.total_rows)
          const transactions = result.rows.map((row) => {
            const doc = row.doc
            const category_name = _.get(rootGetters.categoriesById, [doc.category, 'name'], '')
            const sign = _.get(getters, ['accountDoc', 'sign'], 1)
            const updatedDoc = {
              ...doc,
              value: doc.value * sign,
              ['category_name']: category_name,
              balance: doc.balance * sign
            }

            return updatedDoc
          })
          commit('SET_TRANSACTIONS', transactions)
        })
        .catch((error) => {
          console.log('getTransactions error, accountDoc:', getters.accountDoc)
          console.error(error)
        })
        .finally(() => {
          nextTick(() => {
            commit('SET_IS_LOADING', false)
          })
        })
    },
    updateAccountOptions({ commit, getters, rootGetters }, updatedOptions) {
      commit('SET_ACCOUNT_OPTIONS', updatedOptions)
    },
    async save({ getters, dispatch, commit }, item) {
      let previous = getters.isCreatingNewTransaction ? null : item
      await dispatch('prepareEditedItem')
      const transaction = JSON.parse(JSON.stringify(getters.editedTransaction))
      commit('CLEAR_EDITED_TRANSACTION')
      return dispatch(
        'createOrUpdateTransaction',
        {
          current: transaction,
          previous: previous
        },
        {
          root: true
        }
      )
        .then(() => {
          return dispatch('updateRunningBalance', { transaction }, { root: true })
        })
        .then(() => {
          return dispatch('getTransactions')
        })
        .catch((error) => {
          console.log(error)
        })
    },
    cancel({ commit }) {
      commit('CLEAR_EDITED_TRANSACTION')
    },
    editTransaction({ commit, getters }, transaction) {
      commit('SET_IS_CREATING_NEW_TRANSACTION', false)
      commit('CLEAR_EDITED_TRANSACTION')
      commit('SET_EDITED_TRANSACTION_INDEX', getters.transactions.indexOf(transaction))
      commit('SET_EDITED_TRANSACTION', JSON.parse(JSON.stringify(getters.transactions[getters.editedTransactionIndex])))
    },
    prepareEditedItem({ commit, getters, rootGetters }) {
      if (getters.isCreatingNewTransaction && getters.editedTransactionInitialDate !== getters.editedTransaction.date) {
        commit(
          'SET_EDITED_TRANSACTION_ID',
          `b_${rootGetters.selectedBudgetId}${ID_NAME.transaction}${generateId(getters.editedTransaction.date)}`
        )

        if (getters.editedTransaction.category === null) {
          commit('SET_EDITED_TRANSACTION_CATEGORY', NONE._id)
        }
      }
    },
    addTransaction({ commit, getters, rootGetters }) {
      if (getters.isCreatingNewTransaction) {
        return
      }
      commit('SET_IS_CREATING_NEW_TRANSACTION', true)
      commit('SET_EDITED_TRANSACTION', {
        ...DEFAULT_TRANSACTION,
        account: getters.accountId,
        cleared: false,
        date: moment(new Date()).format('YYYY-MM-DD'),
        _id: `b_${rootGetters.selectedBudgetId}${ID_NAME.transaction}${generateId()}`
      })
      commit('SET_EDITED_TRANSACTION_INITIAL_DATE', getters.editedTransaction.date)
      commit('PUSH_TRANSACTION', getters.editedTransaction)
      commit('SET_EDITED_TRANSACTION_INDEX', getters.transactions.indexOf(getters.editedTransaction))
    },
    categorizeSelectedTransactions({ getters, dispatch, commit }, { categoryId }) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      const documents = getters.selectedTransactions.map((doc) => {
        return {
          current: {
            ...doc,
            category: categoryId.slice(-ID_LENGTH.category)
          },
          previous: doc
        }
      })
      dispatch('commitBulkDocsToPouchAndVuex', documents, { root: true }).then(() => {
        dispatch('getTransactions')
      })
    },
    deleteSelectedTransactions({ commit, getters, dispatch }) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      commit('SET_IS_LOADING', true)
      dispatch('deleteBulkDocumentsFromPouchAndVuex', getters.selectedTransactions, { root: true })
        .then(() => {
          let oldest_document = { date: '9999-99-99' }
          for (let document of getters.selectedTransactions) {
            if (compareAscii(document.date, oldest_document.date) < 0) {
              oldest_document = document
            }
          }
          if (oldest_document.date !== '9999-99-99') {
            return dispatch(
              'updateRunningBalance',
              {
                transaction: oldest_document
              },
              { root: true }
            )
          }
          return null
        })
        .then(() => {
          commit('CLEAR_SELECTED_TRANSACTIONS')
          dispatch('getTransactions')
        })
        .finally(() => {
          commit('SET_IS_LOADING', false)
        })
    },
    deleteTransaction({ commit, dispatch }, transaction) {
      commit('SET_IS_LOADING', true)
      const payload = { current: null, previous: transaction }
      dispatch('commitDocToPouchAndVuex', payload, { root: true })
        .then(() => {
          return dispatch('updateRunningBalance', { transaction: transaction }, { root: true })
        })
        .then(() => {
          commit('CLEAR_SELECTED_TRANSACTIONS')
          return dispatch('getTransactions')
        })
        .finally(() => {
          return commit('SET_IS_LOADING', false)
        })
    },
    setClearedSelectedTransactions({ getters, dispatch, commit }, { cleared_value }) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      const documents = getters.selectedTransactions.map((doc) => {
        return {
          current: {
            ...doc,
            cleared: cleared_value
          },
          previous: doc
        }
      })
      dispatch('commitBulkDocsToPouchAndVuex', documents, { root: true }).then(() => {
        dispatch('getTransactions')
      })
    },
    setSelectedTransactions({ getters, commit, dispatch }, transactions) {
      commit('SET_SELECTED_TRANSACTIONS', transactions)
      if (transactions.length === 1 && transactions[0] && transactions[0]._id !== getters.editedTransaction._id) {
        dispatch('editTransaction', transactions[0])
      } else if (transactions.length !== 1 && getters.editedTransaction._id !== DEFAULT_TRANSACTION._id) {
        commit('CLEAR_EDITED_TRANSACTION')
      }
    },
    setEditedTransactionSplitValue({ commit, getters }, { index, value }) {
      commit('SET_EDITED_TRANSACTION_SPLIT_VALUE', { index: index, value: value })
      let remainder = getters.editedTransaction.value
      const splits = getters.editedTransaction.splits
      for (let i = 0; i < splits.length - 1; i++) {
        remainder -= splits[i].value
      }
      commit('SET_EDITED_TRANSACTION_SPLIT_VALUE', { index: splits.length - 1, value: remainder })
    },
    onTransactionDetailsClick({ getters, commit, dispatch }, item) {
      if (getters.selectedTransactions.length > 0) {
        commit('CLEAR_SELECTED_TRANSACTIONS')
        nextTick(() => {
          dispatch('editTransaction', item)
        })
      } else {
        dispatch('editTransaction', item)
      }
    },
    onImportTransactions({ dispatch, rootGetters, commit }, { transactions, account, csvInfo }) {
      commit('SET_IS_LOADING', true)
      const prev_account_document = rootGetters.accountsById[account]
      const current_account_document = { ...prev_account_document, csvInfo: csvInfo }
      let oldest_transaction = { date: '9999-99-99' }

      const transaction_documents = transactions.reduce((partial, transaction) => {
        if (transaction.exists) {
          return partial
        }
        const previous = null
        const current = {
          account: account,
          category: NONE._id,
          cleared: false,
          approved: false,
          value: Math.round(Number(transaction.amount) * 100),
          date: transaction.date,
          memo: transaction.memo,
          reconciled: false,
          flag: '#ffffff',
          payee: transaction.name ? transaction.name : null,
          importId: transaction.importId,
          transfer: null,
          splits: [],
          _id: `b_${rootGetters.selectedBudgetId}${ID_NAME.transaction}${generateId(
            transaction.date,
            transaction.importId
          )}`
        }
        if (compareAscii(transaction.date, oldest_transaction.date) < 0) {
          oldest_transaction = current
        }
        partial.push({ current, previous })
        return partial
      }, [])
      return dispatch(
        'commitDocToPouchAndVuex',
        { current: current_account_document, previous: prev_account_document },
        { root: true }
      )
        .then(() => {
          return dispatch('commitBulkDocsToPouchAndVuex', transaction_documents, { root: true })
        })
        .then(() => {
          return dispatch('updateRunningBalance', { transaction: oldest_transaction }, { root: true })
        })
        .then(() => {
          return dispatch('getTransactions')
        })
        .finally(() => {
          commit('SET_IS_LOADING', false)
        })
    }
  }
}

const headerClass = 'transaction-table-header text-body-2'
const dataTableHeaders = [
  {
    text: '',
    class: headerClass,
    value: 'data-table-select',
    width: '46px',
    align: 'center'
  },
  {
    text: '',
    class: headerClass,
    value: 'cleared',
    width: '26px',
    align: 'center'
  },
  {
    text: 'Date',
    class: headerClass,
    value: 'date',
    align: 'left'
  },
  {
    text: 'Category',
    class: headerClass,
    value: 'category',
    align: 'left',
    width: '200px'
  },
  {
    text: 'Description',
    class: headerClass,
    value: 'category',
    align: 'left',
    width: '100%'
  },
  {
    text: 'Outflow',
    class: headerClass,
    value: 'outflow',
    align: 'right',
    width: '100px'
  },
  {
    text: 'Inflow',
    class: headerClass,
    value: 'inflow',
    align: 'right',
    width: '100px'
  },
  {
    text: 'Balance',
    class: headerClass,
    value: 'balance',
    align: 'right',
    width: '100px'
  },
  {
    text: '',
    class: headerClass
  }
]
