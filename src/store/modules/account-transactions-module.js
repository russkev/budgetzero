import Vue from 'vue'
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
  editedTransactionInitialDate: moment(new Date()).format('YYYY-MM-DD'),
  editedTransactionIndex: -1,
  accountId: '',
  accountOptions: {},
  numServerTransactions: 0,
  itemsPerPage: DEFAULT_TRANSACTIONS_PER_PAGE,
  expandedTransactions: [],
  selectedTransactions: [],
  isCreatingNewTransaction: false
}

export default {
  namespaced: true,
  state: {
    ...DEFAULT_ACCOUNT_TRANSACTIONS_STATE
  },
  getters: {
    accountId: (state) => state.accountId,
    accountOptions: (state) => {return {...state.accountOptions, accountId: state.accountId}},
    transactions: (state) => state.transactions,
    editedTransaction: (state) => state.editedTransaction,
    editedTransactionInitialDate: (state) => state.editedTransactionInitialDate,
    editedTransactionIndex: (state) => state.editedTransactionIndex,
    numServerTransactions: (state) => state.numServerTransactions,
    itemsPerPage: (state) => state.itemsPerPage,
    accountDoc: (state, getters, rootState, rootGetters) => rootGetters.accountsById[getters.accountId],
    expandedTransactions: (state) => state.expandedTransactions,
    selectedTransactions: (state) => state.selectedTransactions,
    isCreatingNewTransaction: (state) => state.isCreatingNewTransaction,
    dataTableHeaders: () => dataTableHeaders,
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
      Vue.set(state.editedTransaction, 'id', id)
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
    SET_NUM_SERVER_TRANSACTIONS(state, num_transactions) {
      Vue.set(state, 'numServerTransactions', num_transactions)
    },
    SET_ITEMS_PER_PAGE(state, num_items) {
      Vue.set(state, 'itemsPerPage', num_items)
    },
    SET_EXPANDED_TRANSACTIONS(state, transactions) {
      Vue.set(state, 'expandedTransactions', transactions)
    },
    CLEAR_EXPANDED(state) {
      Vue.set(state, 'expandedTransactions', [])
    },
    SET_SELECTED_TRANSACTIONS(state, transactions) {
      Vue.set(state, 'selectedTransactions', transactions)
    },
    CLEAR_SELECTED_TRANSACTIONS(state) {
      Vue.set(state, 'selectedTransactions', [])
    },
    SET_IS_CREATING_NEW_TRANSACTION(state, is_creating) {
      Vue.set(state, 'isCreatingNewTransaction', is_creating)
    }
  },
  actions: {
    getTransactions({dispatch, commit, getters, rootGetters}, account_id) {
      if (account_id !== undefined) {
        console.log("SETTING ACCOUNT ID", account_id)
        commit('SET_ACCOUNT_ID', account_id)
      }

      if (rootGetters.accounts.length < 1) {
        return
      }

      console.log("GET TRANSACTIONS", getters.accountId)
      dispatch('fetchTransactionsForAccount', getters.accountOptions, { root: true }).then((result) => {
        commit('SET_NUM_SERVER_TRANSACTIONS', result.total_rows)
        const transactions = result.rows.map((row) => {
          const doc = row.doc
          const category_name = _.get(rootGetters.categoriesById, [doc.category, 'name'], '')
          const sign = getters.accountDoc.sign
          return {
            ...doc,
            value: doc.value * sign,
            ['category_name']: category_name,
            balance: doc.balance * sign
          }
        })
        commit('SET_TRANSACTIONS', transactions)
      })
    },
    editTransaction({commit, getters}, transaction) {
      commit('SET_IS_CREATING_NEW_TRANSACTION', false)
      commit('CLEAR_EDITED_TRANSACTION')
      commit('SET_EDITED_TRANSACTION_INDEX', context.getters.transactions.indexOf(transaction))
      commit('SET_EDITED_TRANSACTION', {
        ...getters.transactions[context.getters.editedTransactionIndex]
      })
    },
    prepareEditedItem({commit, getters, rootGetters}) {
      if (
        getters.isCreatingNewTransaction &&
        getters.editedTransactionInitialDate !== context.getters.editedTransaction.date
      ) {
        commit(
          'SET_EDITED_TRANSACTION_ID',
          `b_${rootGetters.selectedBudgetId}${ID_NAME.transaction}${generateId(
            getters.editedTransaction.date
          )}`
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
        date: moment(new Date()).format('YYYY-MM-DD'),
        _id: `b_${rootGetters.selectedBudgetId}${ID_NAME.transaction}${generateId()}`
      })
      commit('SET_EDITED_TRANSACTION_INITIAL_DATE', getters.editedTransaction.date)
      commit('PUSH_TRANSACTION', getters.editedTransaction)
      commit('SET_EDITED_TRANSACTION_INDEX', getters.transactions.indexOf(getters.editedTransaction))
      commit('SET_EXPANDED_TRANSACTIONS', [getters.editedTransaction])
    },
    updateSelectedTransactionsCleared({ getters, dispatch, commit }, { is_cleared }) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      const documents = getters.selectedTransactions.map((doc) => {
        return {
          current: {
            ...doc,
            cleared: is_cleared
          },
          previous: doc
        }
      })
      dispatch('commitBulkDocsToPouchAndVuex', documents, { root: true }).then(() => {
        dispatch('getTransactions')
        commit('CLEAR_SELECTED_TRANSACTIONS')
      })
    },
    categorizeSelectedTransactions({getters, dispatch, commit}, { category }) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      const documents = getters.selectedTransactions.map((doc) => {
        return {
          current: {
            ...doc,
            category: category._id.slice(ID_LENGTH.category)
          },
          previous: doc
        }
      })
      dispatch('commitBulkDocsToPouchAndVuex', documents, { root: true }).then(() => {
        dispatch('getTransactions')
        commit('CLEAR_SELECTED_TRANSACTIONS')
      })
    },
    deleteSelectedTransactions({getters, dispatch}) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      dispatch('deleteBulkDocumentsFromPouchAndVuex', { documents: context.getters.selectedTransactions }, { root: true })
        .then(() => {
          let oldest_document = { date: '9999-99-99' }
          for (let document of context.getters.selectedTransactions) {
            if (compareAscii(document.date, oldest_document.date) > 0) {
              oldest_document = document
            }
          }
          if (oldest_document.date !== '9999-99-99') {
            return context.dispatch(
              'updateRunningBalance',
              {
                transaction: oldest_document,
                isDeleted: true
              },
              { root: true }
            )
          }
          return null
        })
        .then(() => {
          dispatch('getTransactions')
        })
    }
  }
}

const dataTableHeaders = [
  {
    text: '',
    class: 'transaction-table-header',
    value: 'data-table-select',
    width: '46px',
    align: 'center'
  },
  {
    text: '',
    class: 'transaction-table-header',
    value: 'cleared',
    width: '26px',
    align: 'center'
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
    align: 'left',
    width: '100%'
  },
  {
    text: 'Outflow',
    class: 'transaction-table-header',
    value: 'outflow',
    align: 'left',
    width: '100px'
  },
  {
    text: 'Inflow',
    class: 'transaction-table-header',
    value: 'inflow',
    align: 'left',
    width: '100px'
  },
  {
    text: 'Balance',
    class: 'transaction-table-header',
    value: 'balance',
    align: 'right',
    width: '100px'
  }
]