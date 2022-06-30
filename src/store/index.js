import Vue from 'vue'
import Vuex from 'vuex'
import account from './modules/account-module'
import budget from './modules/budget-module'
import category from './modules/category-module'
import id from './modules/id-module'
import payee from './modules/payee-module'
import pouchdb from './pouchdb/pouchdb-main'
import reports from './modules/reports-module'
import transaction from './modules/transaction-module'
import user from './modules/user-module'
import pouchdbDelete from './pouchdb/pouchdb-delete'
import pouchdbExport from './pouchdb/pouchdb-export'
import pouchdbFetch from './pouchdb/pouchdb-fetch'
import pouchdbInit from './pouchdb/pouchdb-init'
import pouchdbRemote from './pouchdb/pouchdb-remote'
import { generateId, generateShortId, validateId, compareAscii } from './modules/id-module'
import { updateSingleCategory, defaultCategoryBalance, getCategoryBalance } from './modules/category-module'
import { updateAccountBalances, defaultAccountBalance } from './modules/account-module'
import { calculateTransactionBalanceUpdate } from './modules/transaction-module'
import { validateDate, validateMonth } from '../helper'
import moment from 'moment'

Vue.mixin({
  methods: {
    generateId,
    generateShortId,
    validateId,
    compareAscii,
    defaultAccountBalance,
    defaultCategoryBalance,
    updateAccountBalances,
    updateSingleCategory,
    getCategoryBalance,
    validateDate,
    validateMonth,
    calculateTransactionBalanceUpdate
  }
})

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    account,
    budget,
    category,
    id,
    payee,
    pouchdb,
    reports,
    transaction,
    user,
    pouchdbDelete,
    pouchdbExport,
    pouchdbFetch,
    pouchdbInit,
    pouchdbRemote,
  },
  state: {
    snackbarMessage: '',
    snackbarColor: '',
    snackbar: false,
    sync_state: '',
    selectedBudgetID: null,
    selectedMonth: moment(new Date()).format('YYYY-MM')
  },
  getters: {
    snackbarMessage: (state) => state.snackbarMessage,
    snackbarColor: (state) => state.snackbarColor,
    sync_state: (state) => state.sync_state,
    snackbar: (state) => state.snackbar,
    selectedBudgetID: (state) => state.selectedBudgetID,
    selectedMonth: (state) => state.selectedMonth
  },
  mutations: {
    SET_STATUS_MESSAGE(state, message) {
      state.sync_state = `${message}`
    },
    SET_SNACKBAR_MESSAGE(state, payload) {
      state.snackbarMessage = payload.snackbarMessage
      state.snackbarColor = payload.snackbarColor

      state.snackbar = true
    },
    SET_SNACKBAR(state, snackbar) {
      state.snackbar = snackbar
    },
    // ADD_MONTH(state) {
    //   state.selected_month = moment(state.selected_month)
    //     .add(1, 'M')
    //     .format('YYYY-MM')
    // },
    // PREVIOUS_MONTH(state) {
    //   state.selected_month = moment(state.selected_month)
    //     .subtract(1, 'M')
    //     .format('YYYY-MM')
    // },
    // GO_TO_CURRENT_MONTH(state) {
    //   state.selected_month = moment(new Date()).format('YYYY-MM')
    // },
    UPDATE_SELECTED_BUDGET(state, selectedBudgetID) {
      state.selectedBudgetID = selectedBudgetID
      localStorage.budgetID = selectedBudgetID
    },
    UPDATE_SELECTED_MONTH(state, year_month) {
      state.selectedMonth = year_month
    }
  },
  actions: {
    setSnackBarBoolean(context, snackbar) {
      context.commit('SET_SNACKBAR', snackbar)
    },
    setSelectedBudgetID(context, payload) {
      context.commit('UPDATE_SELECTED_BUDGET', payload)
      context.dispatch('loadLocalBudgetRoot')
    }
  }
})
