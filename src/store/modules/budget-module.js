import moment from 'moment'
import _ from 'lodash'
import { sanitizeValueInput, randomInt, randomString, generateId, generateShortId, validateId } from '../../helper.js'
import { ID_LENGTH } from '../../constants.js'

export default {
  state: {
    monthlyData: {}
  },
  getters: {
    monthlyData: (state) => state.monthlyData,

    /**
     * Array of all transactions 'On Budget'
     */
    transactionsOnBudget: (state, getters) => {
      //Get list of account _ids that are on budget
      var accounts = getters.accountsOnBudget.map((acct) => acct._id.slice(-ID_LENGTH.account))
      var transOnBudget = []

      //
      for (let [key, value] of Object.entries(getters.transactions_by_account)) {
        if (accounts.includes(key)) {
          transOnBudget = transOnBudget.concat(value)
        }
      }
      return transOnBudget
    },

    /**
     * Dict of on-budget transactions grouped by YYYY-MM
     * Helper function only for transaction_lookup
     */
    transaction_grouping: (state, getters) => {
      console.log('transaction_grouping re-run')

      return getters.transactionsOnBudget.reduce(function (rv, item) {
        var date_key = 'date' in item ? item.date.slice(0, 7) : 'noddd'
        ;(rv[date_key] = rv[date_key] || []).push(item)

        return rv
      }, {})
    },

    /**
     * Dict of summed transaction data by category
     * Example:
     * transaction_lookup:
     *   06831c46-ac34-43a9-b0c7-be672d3059ab: 0
     *   0bec18cd-99ea-4991-9498-56022b982b5e: -100
     *   income: 100
     *   incomeNextMonth: 0
     *   null: 0
     */
    transaction_lookup: (state, getters) => {
      var final = {}
      console.log('transaction_lookup re-run')

      //For each month
      for (const [key, value] of Object.entries(getters.transaction_grouping)) {
        var sum = 0

        //For each transaction in the month. value is array of transactions
        final[key] = value.reduce(function (rv, item) {
          var date_key = 'date' in item ? item.date.slice(0, 7) : 'noddd'
          var amount = 'value' in item ? item.value : 0
          var id = ''

          getters.categories.forEach((category) => {
            if (category._id === 'income' || category._id === 'incomeNextMonth' || category._id === null) {
              id = category._id
            } else {
              id = category._id.slice(-ID_LENGTH.category)
            }
            if (item.category == id) {
              rv[id] = rv[id] ? rv[id] + item.value : item.value
            } else {
              rv[id] = rv[id] ? rv[id] : 0
            }
          })
          ;(rv['docs'] = rv['docs'] || []).push(item)
          rv['value'] = rv['value'] ? rv['value'] + item.value : item.value
          return rv
        }, {})
      }
      return sortDict(final)
    },


    /**
     * Dict of YYYY-MM:
     *   Dict of category names: monthCategory object (budget values)
     */
    month_category_lookup: (state, getters) => {
      console.log('monthCategoryBudgets lookup re-run')
      return getters.monthCategoryBudgets.reduce(function (map, obj) {
        if (!map[obj.date.slice(0, 7)]) {
          map[obj.date.slice(0, 7)] = {}
        }
        map[obj.date.slice(0, 7)][obj._id.slice(-ID_LENGTH.category)] = obj

        return map
      }, {})
    },

    /**
     * Array of all months found in data
     */
    all_months: (state, getters) => {
      const combined = getters.monthCategoryBudgets.concat(getters.transactions)
      var months = [...new Set(combined.map((entry) => entry.date.slice(0, 7)))].sort()
      const [lastMonth] = months.slice(-1)
      const lastMonthPlusOne = moment(lastMonth).add(1, 'M').format('YYYY-MM')
      const lastMonthPlusTwo = moment(lastMonth).add(2, 'M').format('YYYY-MM')

      return months.concat(lastMonthPlusOne).concat(lastMonthPlusTwo)
    }
  },
  mutations: {
    GET_MONTHLY_DATA(state, payload) {
      state.monthlyData = payload
    },
    REORDER_MASTER_CATEGORIES(state, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        this.dispatch('commitDocToPouchAndVuex')
      })
    },
    UPDATE_RECONCILED(state, transactionsToLock) {
      transactionsToLock.map((transactionToLock) => (transactionToLock.reconciled = true))
    }
  },
  actions: {
    /**
     * Recalculates entire budget. Returns dict of final budget data calculations. 
     * Example:
         monthly_data: Object
            2020-01: Object
              06831c46-ac34-43a9-b0c7-be672d3059ab: Object
                balance:0
                budgeted:0
                spent:0
    * @returns 
    */
    calculateMonthlyData({ getters, commit }) {
      var final_data = {}
      var previous_month = {}

      return new Promise((resolve, reject) => {
        const t7 = performance.now()

        //Iterate each month
        getters.all_months.forEach((month) => {
          final_data[month] = {}
          final_data[month].categories = {}
          var summaryData = {
            income_this_month: 0,
            overspent: 0,
            last_month_overspent: _.get(previous_month, `summaryData.overspent`, 0),
            balance_this_month: 0,
            budgeted_this_month: 0,
            available_to_budget_this_month: 0, //_.get(getters.transaction_lookup, `${month}.income`, 0)
            available_to_budget_last_month: _.get(previous_month, `summaryData.available_to_budget_this_month`, 0)
          }

          const previousMonth = moment(month).subtract(1, 'M').format('YYYY-MM')

          //Iterate over each category
          _.forEach(
            getters.categories.filter((cat) => cat._id !== 'income').filter((cat) => cat._id !== 'incomeNextMonth'),
            function (category) {
              const cat_id = category._id ? category._id.slice(-ID_LENGTH.category) : null
              const spent = _.get(getters.transaction_lookup, `${month}.${cat_id}`, 0)
              const budgeted = _.get(getters.month_category_lookup, `${month}.${cat_id}.budget`, 0)
              const activity = spent + budgeted
              const prev_month = _.get(previous_month, `categories.${cat_id}.overspending`, false)

              const isOverspending = _.get(getters.month_category_lookup, `${month}.${cat_id}.overspending`, false)

              var category_balance
              var category_balance_raw = _.get(previous_month, `categories.${cat_id}.balance`, 0)
              if (category_balance_raw > 0 || prev_month) {
                category_balance = activity + category_balance_raw
              } else {
                category_balance = activity
              }

              if (isOverspending) {
                //Need to carry over overspent balance to next month
              }

              final_data[month]['categories'][cat_id] = {
                budgeted: budgeted,
                spent: spent,
                balance: category_balance,
                overspending: isOverspending
              }

              summaryData.overspent += category_balance < 0 && !isOverspending ? category_balance : 0
              summaryData.budgeted_this_month += budgeted
            }
          )

          summaryData.income_this_month =
            _.get(getters.transaction_lookup, `${month}.income`, 0) +
            _.get(getters.transaction_lookup, `${previousMonth}.incomeNextMonth`, 0)
          summaryData.available_to_budget_this_month =
            summaryData.available_to_budget_last_month +
            summaryData.income_this_month -
            summaryData.budgeted_this_month +
            summaryData.last_month_overspent

          previous_month = final_data[month]
          final_data[month].summaryData = summaryData
        })

        const t8 = performance.now()
        resolve(final_data)
        console.log('Call to getMonthlyData took ' + (t8 - t7) + ' milliseconds.')
        commit('GET_MONTHLY_DATA', final_data)
      })
    },


    /**
     * Creates new budget and commits to pouchdb
     * @param {*} context
     * @param {string} budgetName The name of the budget to be created
     */
    createBudget: async (context, { name, use_default }) => {
      if (!name) {
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Invalid budget name',
          snackbarColor: 'error'
        })
        Promise.reject(`Invalid budget name: ${name}`)
      }
      const budget_id = await context.dispatch('generateUniqueShortId', { prefix: 'budget_' })

      const budget = {
        name: name,
        currency: 'USD',
        created: new Date().toISOString(),
        checkNumber: false,
        _id: `budget_${budget_id}`
      }

      var budgetOpened = {
        opened: new Date().toISOString(),
        _id: `budget-opened_${budget_id}`
      }

      return context
        .dispatch('commitDocToPouchAndVuex', budget)
        .then((result) => {
          return context.dispatch('setSelectedBudgetID', result.id.slice(-ID_LENGTH.budget))
        })
        .then(() => {
          if (use_default) {
            return context.dispatch('initializeBudgetCategories')
          } else {
            return null
          }
        })
        .then(() => {
          return context.dispatch('commitDocToPouchAndVuex', budgetOpened)
        })
        .then(() => {
          console.log("Created new budget")
          return
        })
        .catch((err) => {
          console.log(err)
        })
    },

    getBudgetOpened(context) {
      return this._vm.$pouch
        .allDocs({
          include_docs: true,
          attachments: true,
          startkey: 'budget-opened_',
          endkey: 'budget-opened_\ufff0',
        })
        .then((result) => {
          context.commit('GET_BUDGET_OPENED', result.rows)
        })
        .catch((err) => {
          console.log(err)
          context.commit('API_FAILURE', err)
        })
    },

    /**
     * Deletes entire budget
     * @param {*} context
     * @param {*} payload budget_ document
     */
    deleteEntireBudget(context, payload) {
      const budget_id = payload._id.slice(-ID_LENGTH.budget)

      return new Promise((resolve, reject) => {
        this._vm.$pouch
          .allDocs({
            include_docs: true,
            attachments: true,
            startkey: `b_${budget_id}_`,
            endkey: `b_${budget_id}_\ufff0`,
          })
          .then((result) => {
            //Add deleted key to each
            const rowsToDelete = {}
            rowsToDelete.docs = result.rows.map((v) => ({ ...v.doc, _deleted: true }))
            console.log('going to delete..', rowsToDelete)
            //Bulk delete
            context.dispatch('commitBulkDocsToPouchAndVuex', rowsToDelete).then(
              (response) => {
                this._vm.$pouch
                  .get(`budget-opened_${budget_id}`)
                  .then(function (doc) {
                    context.dispatch('deleteDocFromPouchAndVuex', doc)
                  })
                  .catch(function (err) {
                    console.log(err)
                  })

                // Finally, delete the budget_ doc
                //TODO: Put this inside .then() above?
                context.dispatch('deleteDocFromPouchAndVuex', payload)

                resolve(response)
              },
              (error) => {
                reject(error)
                context.commit('API_FAILURE', error)
              }
            )
          })
      })
    },

    ///
    /// Categories
    ///
    createMasterCategory: async (context, category_name) => {
      const prefix = `b_${context.rootState.selectedBudgetID}_master-category_`
      const id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      const payload = {
        _id: prefix + id,
        name: category_name,
        sort: 1,
        collapsed: false
      }
      
      return context.dispatch('commitDocToPouchAndVuex', payload)
    },

    
    createCategory: async (context, payload) => {
      const sort_length = context.getters.categoriesGroupedByMaster[payload.masterCategoryForModalForm]
        ? context.getters.categoriesGroupedByMaster[payload.masterCategoryForModalForm].length
        : 0

      const prefix = `b_${context.rootState.selectedBudgetID}_category_`
      const id = await context.dispatch('generateUniqueShortId', { prefix: prefix })
      const category = {
        name: payload.category_name,
        hidden: false,
        masterCategory: payload.masterCategoryForModalForm,
        sort: sort_length,
        _id: `b_${context.rootState.selectedBudgetID}_category_${id}`
      }
      return context.dispatch('commitDocToPouchAndVuex', category)
    },
    updateCategory(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', payload)
    },
    flipMasterCategoryCollapsed(context, payload) {
      const cat = Object.assign({}, payload)
      cat.collapsed = !cat.collapsed
      context.dispatch('commitDocToPouchAndVuex', cat)
    },
    flipCategoryHidden(context, payload) {
      const cat = Object.assign({}, payload)
      cat.hidden = !cat.hidden
      context.dispatch('commitDocToPouchAndVuex', cat)
    },
    ///
    /// Budget
    ///
    updateBudgetAmount(context, payload) {
      context.dispatch('commitDocToPouchAndVuex', payload).catch((error) => {
        console.log('updateBudgetAmount error:', error)
      })
    },

    /**
     * Turn the right-red-arrow on/off
     */
    flipOverspending(context, item) {
      var payload = {
        budget: 0,
        overspending: true,
        note: '',
        _id: `b_${context.getters.selectedBudgetID}_monthCategory_${context.getters.month_selected}-01_${item._id.slice(
          -ID_LENGTH.category
        )}`,
        date: context.getters.month_selected + '-01'
      }

      //Check if already exists
      if (
        context.getters.month_category_lookup[context.getters.month_selected] &&
        context.getters.month_category_lookup[context.getters.month_selected][item._id.slice(-ID_LENGTH.category)]
      ) {
        payload = JSON.parse(
          JSON.stringify(context.getters.month_category_lookup[context.getters.month_selected][item._id.slice(-ID_LENGTH.category)])
        )

        payload.overspending = !payload.overspending
      }
      context.dispatch('updateBudgetAmount', payload)
    },

    ///
    /// Account
    ///
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
            _id: `b_${context.getters.selectedBudgetID}_transaction_${generateId(date)}`
          }
          console.log('initTransaction', initTransaction)
          context.dispatch('createOrUpdateTransaction', initTransaction)
        }
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
    },

    /**
     * Generate a short ID and unsure it doesn't already exist in the database
     * @param {*} context 
     * @returns 
     */
    generateUniqueShortId: async(context, {prefix}) => {
      let unique_id = false
      let num_tries = 0
      const max_tries = 10
      while(!unique_id && num_tries < max_tries) {
        num_tries += 1
        const id = generateShortId()
        // id_exists = await this.idExists(prefix + id)
        const id_exists = await context.dispatch('idExists', prefix + id)
        if (!id_exists) {
          unique_id = id
        }
      }
      if (unique_id) {
        return unique_id
      } else {
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Unable to create unique ID',
          snackbarColor: 'error'
        })
        Promise.reject(`Unable to create unique ID, tried ${max_tries} times`)
      }
    },

    /**
     * Return true if id already exists in database, false otherwise
     * @param {*} context 
     * @param {String} id 
     * @returns 
     */
    idExists(context, id) {
      return this._vm.$pouch.get(id).then(() => {
        return true
      }).catch(() => {
        return false
      })
    },

    /**
     * Create payee doc.
     * This should only be called from getPayeeID() action.
     * @param {*} context
     * @param {String} payload Plaintext payee name
     * @returns
     */
    createPayee(context, payload) {

      var payee = {
        _id: `b_${context.rootState.selectedBudgetID}_payee_${generateId()}`,
        name: payload
      }

      return context.dispatch('commitDocToPouchAndVuex', payee)
    },

    /**
     * Returns the payee UUID for any payee name. Dispatches action to create the payee if it doesn't exist yet.
     * @param {*} context
     * @param {String} payload Plaintext payee name. e.g. 'Grocery Store'
     * @returns Payee UUID
     */
    async getPayeeID(context, payload) {
      //First, check if this payee has already been created
      const payeeLookup = Object.keys(context.getters.payee_map).find(
        (key) => context.getters.payee_map[key] === payload
      )

      if (payeeLookup) {
        return payeeLookup
      } else if (validateId(`${payload}`)) {
        // If the payload is already UUID then return.
        return payload
      } else if (payload === '---------------------initial-balance') {
        //If it's initial balance then return
        return payload
      } else if (typeof payload === 'undefined' || payload === null || payload === '') {
        // If payload is an object, then it's an existing payee. Otherwise we need to create the payee.
        return null
      } else if (typeof payload != 'string') {
        return payload.id
      } else {
        // Payload is a string. Need to create payee to get an uuid
        let payee = await context.dispatch('createPayee', payload)
        return payee.id.slice(-ID_LENGTH.payee)
      }
    },

    /**
     * Create/update the mirrored transfer transaction
     */
    saveMirroredTransferTransaction(context, payload) {
      var mirroredTransferTransaction = Object.assign({}, payload)
      var mirrorExists = false

      //Check if the mirrored transaction doesn't exist then we create
      if (payload.transfer) {
        const index =
          context.getters.transactionsLookupByID[
            `b_${context.getters.selectedBudgetID}_transaction_${payload.transfer}`
          ]
        if (index) {
          mirrorExists = true
          mirroredTransferTransaction = Object.assign({}, context.getters.transactions[index])
        }
      }
      if (!mirrorExists) {
        //Creating new transaction
        mirroredTransferTransaction._id = `b_${
          context.getters.selectedBudgetID
        }_transaction_${generateId(payload.date)}`

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

    ///
    /// Reorder Categories
    ///
    reorderSubCategory(context, payload) {
      //Get the category that was moved
      const item = JSON.parse(
        JSON.stringify(context.getters.categoriesGroupedByMaster[payload.from.className][payload.oldIndex])
      )

      //Assign sort value and fix off-by-one errors
      if (payload.newIndex > payload.oldIndex) {
        item.sort = payload.newIndex + 0.5
      } else {
        item.sort = payload.newIndex - 0.5
      }
      item.masterCategory = payload.to.className //Assign new master category

      let categoriesGroupedByMaster = JSON.parse(JSON.stringify(context.getters.categoriesGroupedByMaster))

      //First, we update the subcategory to it's correct mastercategory
      context.dispatch('commitDocToPouchAndVuex', item).then((result) => {
        let categoriesGroupedByMaster = JSON.parse(JSON.stringify(context.getters.categoriesGroupedByMaster))
        // Then iterate through them and re-set all their sort values
        for (const [key, masterArray] of Object.entries(categoriesGroupedByMaster)) {
          if (key !== 'undefined') {
            //Skip undefined master categories (income, incomeNextMonth, etc)
            masterArray.sort((a, b) => (a.sort > b.sort ? 1 : -1))
            masterArray.forEach((category, i) => {
              if (category.sort !== i) {
                category.sort = i
                context.dispatch('commitDocToPouchAndVuex', category)
              }
            })
          }
        }
      })
    },
    reorderMasterCategories(context, payload) {
      payload.forEach((master, i) => {
        master.sort = i
        context.dispatch('commitDocToPouchAndVuex', master)
      })
    },

    /**
     * Initialize categories in a new budget
     */
    initializeBudgetCategories(context) {
      console.log('Init default budget categories')
      const starter_categories = {
        Giving: ['Tithing', 'Charitable'],
        'Everyday Expenses': ['Restaurants', 'Groceries', 'Household Goods', 'Spending Money'],
        'Monthly Bills': [
          'Medical/Dental',
          'Internet',
          'Rent/Mortgage',
          'Clothing',
          'Water',
          'Renters Insurance',
          'Car Insurance',
          'Phone',
          'Fuel',
          'Car Maintenance',
          'Electricity',
          'Cable TV'
        ],
        Debt: ['Student Loan Payment', 'Car Payment'],
        'Savings Goals': [
          'Rainy Day Funds',
          'Christmas',
          'Birthdays',
          'Emergency Fund',
          'Car Replacement',
          'Retirement',
          'Vacation'
        ]
      }
      return Promise.all(Object.keys(starter_categories).map((master_category) => {
        return context.dispatch('createMasterCategory', master_category)
          .then((response) => {
            return Promise.all(starter_categories[master_category].map((subcategory) => {
              const payload = {
                category_name: subcategory,
                masterCategoryForModalForm: response.id.slice(-ID_LENGTH.category)
              }
              return context.dispatch('createCategory', payload)
            }))
          })
      }))
    },


    createMockTransactions(context, amount) {
      return new Promise((resolve, reject) => {
        const num_transactions = parseInt(amount)
        if (!num_transactions) {
          reject('Invalid amount')
        }
        if (context.getters.accounts.length < 1) {
          reject("At least one account is required")
        }
        const year_start = 2017
        const year_end = 2021

        const categories = context.getters.categories
        const accounts = context.getters.accounts

        const mock_transactions = Array(num_transactions).fill(0).map(() => {
          const year = randomInt(year_start, year_end)
          const month = randomInt(1, 12).toString().padStart(2, '0')
          const day = randomInt(1, 28).toString().padStart(2, '0')
          const date = `${year}-${month}-${day}`

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
            _id: `b_${context.getters.selectedBudgetID}_transaction_${generateId(date)}`,
            _rev: ''
          }
        })

        let mock_budget_data = []
        for(let year = year_start; year <= year_end; year++) {
          for(let month = 1; month <= 12; month++) {
            const date = `${year}-${month.toString().padStart(2, '0')}-01`
            categories.forEach((category) => {
              const category_id = category._id ? category._id.slice(-ID_LENGTH.category) : null
              if (category_id) {
                const budget_amount_item = {
                  budget: randomInt(-20000, 30000),
                  overspending: null,
                  note: randomString(randomInt(0, 100)),
                  _id: `b_${context.getters.selectedBudgetID}_monthCategory_${date}_${category_id}`,
                }
                mock_budget_data.push(budget_amount_item)
              }
            })
          }
        }

        context.dispatch('commitBulkDocsToPouchAndVuex', mock_budget_data.concat(mock_transactions)).then(() => {
          resolve(mock_transactions.length)
        })
      })
    }
  }
}

/**
 * Sort helper function
 */
function sortDict(obj) {
  return Object.keys(obj)
    .sort()
    .reduce(function (result, key) {
      result[key] = obj[key]
      return result
    }, {})
}
