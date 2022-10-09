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
    accountOptions: (state) => {
      return { ...state.accountOptions, accountId: state.accountId }
    },
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
    dataTableHeaders: () => dataTableHeaders
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
    SET_NUM_SERVER_TRANSACTIONS(state, num_transactions) {
      Vue.set(state, 'numServerTransactions', num_transactions)
    },
    SET_ITEMS_PER_PAGE(state, num_items) {
      Vue.set(state, 'itemsPerPage', num_items)
    },
    SET_EXPANDED_TRANSACTIONS(state, transactions) {
      Vue.set(state, 'expandedTransactions', transactions)
    },
    CLEAR_EXPANDED_TRANSACTIONS(state) {
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
    getTransactions({ dispatch, commit, getters, rootGetters }, account_id) {
      if (account_id !== undefined) {
        commit('SET_ACCOUNT_ID', account_id)
      }

      if (rootGetters.accounts.length < 1) {
        return
      }

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
    async save({ getters, dispatch }, item) {
      let previous = getters.isCreatingNewTransaction ? null : item
      await dispatch('prepareEditedItem')
      const transaction = JSON.parse(JSON.stringify(getters.editedTransaction))
      return dispatch(
        'createOrUpdateTransaction',
        {
          current: transaction,
          previous: previous
        },
        {
          root: true
        }
      ).then(() => {
        return dispatch(
          'updateRunningBalance',
          {
            transaction: transaction,
            isDeleted: false
          },
          {
            root: true
          }
        )
          .then(() => {
            return dispatch('getTransactions')
          })
          .catch((error) => {
            console.log(error)
          })
      })
    },
    cancel({ commit, getters }) {
      commit('SET_EDITED_TRANSACTION', JSON.parse(JSON.stringify(getters.transactions[getters.editedTransactionIndex])))
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
        commit('CLEAR_SELECTED_TRANSACTIONS')
      })
    },
    deleteSelectedTransactions({ commit, getters, dispatch }) {
      if (getters.selectedTransactions.length < 1) {
        return
      }
      dispatch('deleteBulkDocumentsFromPouchAndVuex', { documents: getters.selectedTransactions }, { root: true })
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
                transaction: oldest_document,
                isDeleted: true
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
        commit('CLEAR_SELECTED_TRANSACTIONS')
      })
    },
    setSelectedTransactions({ getters, commit, dispatch }, transactions) {
      console.log("TRANSACTIONS", transactions)
      commit('SET_SELECTED_TRANSACTIONS', transactions)
      if (transactions.length === 1 && transactions[0]._id !== getters.editedTransaction._id) {
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
  }
]
