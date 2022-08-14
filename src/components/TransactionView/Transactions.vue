<template>
  <div>
    <TransactionHeader :selected_account_id="accountOptions.account_id" />
    <v-data-table
      v-model="selected"
      :headers="dataTableHeaders"
      :items="transactions"
      item-key="_id"
      show-select
      single-expand
      :expanded.sync="expanded"
      :options.sync="accountOptions"
      :server-items-length="numTransactionsTotal"
      :items-per-page="itemsPerPage"
      :footer-props="{
        'items-per-page-options': [2, 10, 20, 50, 100, 200],
        'update.options': accountOptions
      }"
      refs="items"
    >
      <template #item="{ item, expand, select, isSelected }">
        <tr v-if="item._id === editedItem._id" :key="item._id">
          <!-- <form> -->
            <!-- Checkbox -->
            <td class="pr-0">
              <v-simple-checkbox
                color="accent"
                :value="isSelected"
                :ripple="false"
                @input="select($event)"
                :disabled="expanded.length > 0"
              />
            </td>

            <!-- Cleared input -->
            <td class="pa-0">
              <v-btn icon @click="toggleCleared(item)">
                <v-icon v-if="editedItem.cleared" color="primary">mdi-alpha-c-circle</v-icon>
                <v-icon v-if="!editedItem.cleared" color="grey">mdi-alpha-c-circle-outline</v-icon>
              </v-btn>
            </td>

            <!-- Date input -->
            <td id="edit-date-input">
              <date-picker v-model="editedItem.date" />
            </td>

            <!-- Category input -->
            <td>
              <treeselect
                :multiple="false"
                :options="categoryOptions"
                v-model="editedItem.category"
                :disable-branch-nodes="true"
                required
              />
            </td>

            <!-- Memo input -->
            <td>
              <v-text-field v-model="editedItem.memo" />
            </td>

            <!-- Outflow -->
            <td align="right">
                <!-- ref="outflow" -->
              <v-text-field 
                :value="outflowAmount"
                suffix="$"
                reverse
                :rules="[rules.currency]"
                @blur="outflowAmountApply($event)" 
                @change="outflowAmountApply($event)"
                @mousedown="outflowAmountApply($event)"
                @keyup.enter="outflowAmountApply($event); save(item)"
              />
            </td>

            <!-- Inflow -->
            <td align="right">
              <v-text-field 
                :value="inflowAmount"
                suffix="$"
                reverse
                :rules="[rules.currency]"
                @blur="inflowAmountApply($event)" 
                @change="inflowAmountApply($event)"
                @mousedown="inflowAmountApply($event)"
                @keyup.enter="inflowAmountApply($event); save(item)"
              />
            </td>

            <!-- Balance -->
            <td align="right">
              {{ new Intl.NumberFormat('en-us', { style: 'currency', currency: 'USD' }).format(item.balance / 100) }}
            </td>
          <!-- </form> -->
        </tr>

        <tr v-else>
          <!-- Checkbox -->
          <td class="pr-0">
            <v-simple-checkbox
              color="accent"
              :value="isSelected"
              :ripple="false"
              @input="select($event)"
              :disabled="expanded.length > 0"
            />
          </td>

          <!-- Cleared -->
          <td>
            <v-btn icon @click="toggleCleared(item)">
              <v-icon v-if="item.cleared" color="primary">mdi-alpha-c-circle</v-icon>
              <v-icon v-if="!item.cleared" color="grey">mdi-alpha-c-circle-outline</v-icon>
            </v-btn>
          </td>

          <!-- Date -->
          <td @click="editItem(item); expand(item)">
            {{ item.date }}
          </td>

          <!-- Category -->
          <td @click="editItem(item); expand(item)">
            {{ item.category_name }}
          </td>

          <!-- Memo -->
          <td class="memo" @click="editItem(item); expand(item)">
            {{ item.memo }}
          </td>

          <!-- Outflow -->
          <td align="right" @click="editItem(item); expand(item)">
            {{ item.value > 0 ? '' : intlCurrency.format(-item.value / 100)}}
          </td>

          <!-- Inflow -->
          <td align="right" @click="editItem(item); expand(item)">
            {{ item.value > 0 ? intlCurrency.format(item.value / 100) : '' }}
          </td>

          <!-- Balance -->
          <td align="right">
            {{ intlCurrency.format(item.balance / 100) }}
          </td>
        </tr>
      </template>

      <template #expanded-item="{ item }">
        <td :colspan="dataTableHeaders.length" class="mr-0 pr-0 grey lighten-2">
          <v-btn small @click="cancel()"> Cancel </v-btn>
          <v-btn small @click="save(item)"> Save </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-btn @click="addTransaction"> Create </v-btn>
    <v-btn @click="deleteSelectedTransactions"> Delete selected </v-btn>
    <v-btn @click="clearSelectedTransactions"> Clear Selected </v-btn>
    <v-btn @click="unclearSelectedTransactions"> Unclear Selected </v-btn>
    <v-btn @click="onFetchSucceeding">Fetch Succeeding</v-btn>
    <v-btn @click="onFetchPreceding">Fetch Preceding</v-btn>
    <v-btn @click="getTransactions">Get Transactions</v-btn>
    <v-menu bottom offset-x close-on-content-click close-on-click>
      <template #activator="{ on, attrs }">
        <!-- <v-list-item v-bind="attrs" left v-on="on">Categorize as:</v-list-item> -->
        <v-btn v-bind="attrs" v-on="on">Categorize as:</v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="category in categoriesForDropdown"
          :key="category._id"
          dense
          @click="categorizeSelectedTransactions(category)"
        >
          <v-list-item-title> {{ category.name }} </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn @click.stop="importModalIsVisible = true">
      <v-icon left>mdi-cloud-upload</v-icon>
      <span>Import</span>
    </v-btn>
    <import-modal-component
      :visible="importModalIsVisible"
      :account="this.$route.params.account_id"
      @close="onImportModalClose"
    />
    <!-- @close="importModalIsVisible = false" -->
  </div>
</template>

<script>
import TransactionHeader from './TransactionHeader'
import { DEFAULT_TRANSACTION, ID_LENGTH, ID_NAME, NONE } from '../../constants'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
import DatePicker from './DatePicker'
import ImportModalComponent from './ImportModalComponent.vue'
// import Banking from 'banking'
// import ofx from 'node-ofx-parser'

export default {
  components: { Treeselect, TransactionHeader, ImportModalComponent, DatePicker },
  data() {
    return {
      selected: [],
      expanded: [],
      intlCurrency: new Intl.NumberFormat('en-us', { style: 'currency', currency: 'USD' }),
      numServerTransactions: 0,
      accountOptions: {
        account_id: this.$route.params.account_id,
      },
      itemsPerPage: this.savedItemsPerPage(),
      transactions: [],
      editedIndex: -1,

      date: moment(new Date()).format('YYYY-MM-DD'),
      dateMenuIsVisible: false,
      creatingNewTransactions: false,
      editedItem: {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format('YYYY-MM-DD')
      },
      editedItemInitialDate: moment(new Date()).format('YYYY-MM-DD'),
      outflowDisplayValue: '',
      inflowDisplayValue: '',
      importModalIsVisible: false,
      testInflowValue: '',

      rules: {
        // date: (value) => {
        //   return this.$vm.validateDate(value) || 'Invalid date.'
        // },
        currency: (value) => {
          return value !== undefined && (value.length === 0 || !isNaN(value))
        }
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.accountOptions.account_id = to.params.account_id
    next()
  },
  watch: {
    accountOptions: {
      handler(current, prev) {
        if (current.itemsPerPage !== prev.itemsPerPage) {
          localStorage.setItem("transactionsPerPage", current.itemsPerPage)
        }
        this.getTransactions()
      },
      deep: true
    },
    expanded: {
      handler() {
        this.selected = []
      }
    }
  },
  computed: {
    // Re-configure categoriesByMaster to be in correct format for treeselect
    ...mapGetters(['dataTableHeaders', 'selectedBudgetId', 'categoriesById', 'categoriesByMaster', 'accountsById']),
    account() {
      return this.accountsById[this.$route.params.account_id]
    },

    selectedAccount() {},
    categoryOptions() {
      const key_values = Object.entries(this.$store.getters.categoriesByMaster)
      return key_values.map(([master_category_id, categories]) => {
        const category_label = this.$store.getters.masterCategoriesById[master_category_id].name
        const result = {
          id: master_category_id,
          label: category_label
        }
        if (master_category_id !== NONE._id) {
          result['children'] = categories.map((category) => {
            return {
              id: category._id.slice(-ID_LENGTH.category),
              label: category.name
            }
          })
        }
        return result
      })
    },
    categoriesForDropdown() {
      return Object.values(this.categoriesByMaster).flat()
    },
    numTransactionsTotal() {
      return this.creatingNewTransactions ? this.numServerTransactions + 1 : this.numServerTransactions
    },
    outflowAmount: {
      get() {
        if (this.outflowDisplayValue === '' && this.editedItem.value < 0) {
          this.outflowDisplayValue = (Math.round(this.parseCurrencyValue(this.editedItem.value)) / 100).toFixed(2)
        }
        return this.outflowDisplayValue
      },
      set(outflow_value) {
        this.outflowDisplayValue = outflow_value
      }
    },
    inflowAmount: {
      get() {
        if (this.inflowDisplayValue === '' && this.editedItem.value > 0) {
          this.inflowDisplayValue = (Math.round(this.parseCurrencyValue(this.editedItem.value)) / 100).toFixed(2)
        }
        return this.inflowDisplayValue
      },
      set(inflow_value) {
        this.inflowDisplayValue = inflow_value
      }
    },
  },
  methods: {
    outflowAmountApply(event) {
      if (event.target) {
        const target_value = event.target.value
        this.outflowDisplayValue = target_value
        const sanitized_value = Math.round(this.parseCurrencyValue(target_value) * 100)
        if (sanitized_value > 0) {
          Vue.set(this.editedItem, 'value', -sanitized_value)
        }
        
        // setTimeout used here to ensure outflowAmount is triggered from outflowDisplayValue assignment
        setTimeout(() => {
          if (sanitized_value > 0) {
            this.outflowDisplayValue = (sanitized_value / 100).toFixed(2)
            this.inflowDisplayValue = ''
          } else {
            this.outflowDisplayValue = ''
          }
        })
      }
    },
    inflowAmountApply(event) {
      if (event.target) {
        const target_value = event.target.value
        this.inflowDisplayValue = target_value
        const sanitized_value = Math.round(this.parseCurrencyValue(target_value) * 100)
        if (sanitized_value > 0) {
          Vue.set(this.editedItem, 'value', sanitized_value)
        }

        // setTimeout used here to ensure inflowAmount is triggered from inflowDisplayValue assignment
        setTimeout(() => {
          if (sanitized_value > 0) {
            this.inflowDisplayValue = (sanitized_value / 100).toFixed(2)
            this.outflowDisplayValue = ''
          } else {
            this.inflowDisplayValue = ''
          }
        })
      }
    },
    getTransactions() {
      this.$store.dispatch('fetchTransactionsForAccount', this.accountOptions).then((result) => {
        this.numServerTransactions = result.total_rows
        this.transactions = result.rows.map((row) => {
          const category_name = _.get(this.categoriesById, [row.doc.category, 'name'], '')
          return {
            ...row.doc,
            value: row.doc.value * this.account.sign,
            ['category_name']: category_name,
            balance: row.doc.balance * this.account.sign
          }
        })
      })
    },
    editItem(item) {
      this.creatingNewTransactions = false
      this.editedIndex = this.transactions.indexOf(item)
      this.editedItem = { ...this.transactions[this.editedIndex] }
    },



    toggleCleared(item) {
      if (this.editedIndex === this.transactions.indexOf(item)) {
        this.editedItem.cleared = !this.editedItem.cleared
        return
      }

      this.editedItem = { ...item, cleared: !item.cleared }
      this.prepareEditedItem()
      const payload = { current: this.editedItem, previous: item }
      this.$store.dispatch('createOrUpdateTransaction', payload).then(() => this.getTransactions())
      this.resetEditedItem()
    },
    clearSelectedTransactions() {
      this.updateClearedSelectedTransactions(true)
    },
    unclearSelectedTransactions() {
      this.updateClearedSelectedTransactions(false)
    },
    updateClearedSelectedTransactions(is_cleared) {
      if (this.selected.length < 1) {
        return
      }
      const documents = this.selected.map((doc) => {
        return {
          current: {
            ...doc,
            cleared: is_cleared
          },
          previous: doc
        }
      })
      this.$store.dispatch('commitBulkDocsToPouchAndVuex', documents).then(() => {
        this.getTransactions()
        // At the moment this is required because otherwise checkboxes remain checked but this.selected is stale
        this.selected = []
      })
    },
    parseCurrencyValue(input_currency) {
      let value = ''
      if (input_currency !== undefined) {
        // Remove all non-digit chars except for period
        value = input_currency.toString().replace(/[^0-9.]/g, '')
      }
      return value
    },
    resetEditedItem() {
      if (this.creatingNewTransactions && this.editedIndex > -1) {
        this.transactions.splice(this.editedIndex, 1)
      }
      this.creatingNewTransactions = false
      this.editedIndex = -1
      this.editedItem = {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format('YYYY-MM-DD')
      }
      this.inflowDisplayValue = ''
      this.outflowDisplayValue = ''
    },
    prepareEditedItem() {
      if (this.creatingNewTransactions && this.editedItemInitialDate !== this.editedItem.date) {
        this.editedItem['_id'] = `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(
          this.editedItem.date
        )}`
      }

      Vue.delete(this.editedItem, 'category_name')

      if (this.editedItem.category === null) {
        this.editedItem.category = NONE._id
      }
      // this.editedItem.value *= this.account.sign
    },
    addTransaction() {
      if (this.creatingNewTransactions) {
        return
      }
      this.creatingNewTransactions = true
      this.editedItem = {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format('YYYY-MM-DD'),
        _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId()}`
      }
      this.editedItemInitialDate = this.editedItem.date
      this.transactions.push(this.editedItem)
      this.transactions.sort((a, b) => this.compareAscii(b._id, a._id))
      this.editedIndex = this.transactions.indexOf(this.editedItem)
      this.expanded.push(this.editedItem)
    },
    categorizeSelectedTransactions(category) {
      if (this.selected.length < 1) {
        return
      }
      const documents = this.selected.map((doc) => {
        return {
          current: {
            ...doc,
            category: category._id.slice(-ID_LENGTH.category)
          },
          previous: doc
        }
      })
      this.$store.dispatch('commitBulkDocsToPouchAndVuex', documents).then(() => {
        this.getTransactions()

        // At the moment this is required because otherwise checkboxes remain checked but this.selected is stale
        this.selected = []
      })
    },
    deleteSelectedTransactions() {
      if (this.selected.length < 1) {
        return
      }
      this.$store.dispatch('deleteBulkDocumentsFromPouchAndVuex', { documents: this.selected }).then(() => {
        this.getTransactions()
        this.selected = []
      })
    },
    deleteTransaction(item) {
      this.$store
        .dispatch('createOrUpdateTransaction', { current: null, previous: item })
        .then(() => {
          this.$store.dispatch('updateRunningBalance', item)
        })
        .then(() => {
          return this.getTransactions()
        })
      // .then(() => {
      //   return this.$store.dispatch('updateBalances')
      // })
      this.cancel()
    },
    onImportModalClose() {
      this.importModalIsVisible = false
      this.getTransactions()
    },
    async save(item) {
      // let payload = {}
      let previous = this.creatingNewTransactions ? null : item
      // if (previous !== null && this.editedItem.date !== this.editedItem.month) {
      //   payload = {
      //     current:
      //   }
      // }
      this.prepareEditedItem()
      // const current = JSON.parse(JSON.stringify(this.editedItem))
      const transaction = JSON.parse(JSON.stringify(this.editedItem))
      this.$store
        .dispatch('createOrUpdateTransaction', {
          current: this.editedItem,
          previous: previous
        })
        .then(() => {
          return this.$store.dispatch('updateRunningBalance', transaction)
        })
        .then(() => {
          return this.getTransactions()
        })
        .catch((error) => {
          console.log(error)
        })
      // .then(() => {
      //   this.$store.dispatch('updateBalances')
      // })
      this.cancel()
    },
    cancel() {
      this.selected = []
      this.expanded = []
      this.resetEditedItem()
    },
    onFetchSucceeding() {
      this.selected.map((transaction) => {
        this.$store.dispatch('fetchSucceedingTransaction', transaction)
      })
    },
    onFetchPreceding() {
      this.selected.map((transaction) => {
        this.$store.dispatch('fetchPrecedingTransaction', transaction)
      })
    },
    savedItemsPerPage() {
      const saved_items_per_page = localStorage.getItem("transactionsPerPage")
      if (saved_items_per_page) {
        return parseInt(saved_items_per_page)
      } else {
        return 50
      }
    },
    submit() {
      console.log("SUBMIT")
    }
  }
}
</script>

<style>
div.vue-treeselect__control {
  width: inherit;
}
div.vue-treeselect__menu-container {
  width: 400px;
}

td.memo {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
