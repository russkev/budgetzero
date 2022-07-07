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
      :footer-props="{
        'items-per-page-options': [2, 10, 20, 50, 100, 200]
      }"
    >
      <template #item="{ item, expand, select, isSelected }">
        <tr :key="item._id">
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
          <td v-if="item._id === editedItem._id" class="pa-0">
            <v-btn icon @click="toggleCleared(item)">
              <v-icon v-if="editedItem.cleared" color="primary">mdi-alpha-c-circle</v-icon>
              <v-icon v-if="!editedItem.cleared" color="grey">mdi-alpha-c-circle-outline</v-icon>
            </v-btn>
          </td>
          <td v-else>
            <v-btn icon @click="toggleCleared(item)">
              <v-icon v-if="item.cleared" color="primary">mdi-alpha-c-circle</v-icon>
              <v-icon v-if="!item.cleared" color="grey">mdi-alpha-c-circle-outline</v-icon>
            </v-btn>
          </td>

          <!-- Date input -->
          <td v-if="item._id === editedItem._id" id="edit-date-input">
            <date-picker v-model="editedItem.date"/>
          </td>
          <td
            v-else
            @click="
              editItem(item)
              expand(item)
            "
          >
            {{ item.date }}
          </td>

          <!-- Category input -->
          <td v-if="item._id === editedItem._id">
            <treeselect
              :multiple="false"
              :options="categoryOptions"
              v-model="editedItem.category"
              :disable-branch-nodes="true"
              required
            />
          </td>

          <td
            v-else
            @click="
              editItem(item)
              expand(item)
            "
          >
            {{ item.category_name }}
          </td>

          <!-- Memo input -->
          <td v-if="item._id === editedItem._id">
            <v-text-field v-model="editedItem.memo" />
          </td>

          <td
            v-else
            class="memo"
            @click="
              editItem(item)
              expand(item)
            "
          >
            {{ item.memo }}
          </td>

          <!-- Outflow -->
          <td v-if="item._id === editedItem._id">
            <v-text-field v-model="outflowAmount" prefix="$" color="red" id="outflow-input" :rules="[rules.currency]" />
          </td>
          <td
            v-else
            @click="
              editItem(item)
              expand(item)
            "
          >
            {{ item.value > 0 ? '' : (-item.value / 100) | currency }}
          </td>

          <!-- Inflow -->
          <td v-if="item._id === editedItem._id">
            <v-text-field v-model="inflowAmount" prefix="$" color="green" id="inflow-input" :rules="[rules.currency]" />
          </td>
          <td
            v-else
            @click="
              editItem(item)
              expand(item)
            "
          >
            {{ item.value > 0 ? item.value / 100 : '' | currency }}
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
    <v-btn @click="onClickMe"> Click Me </v-btn>
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

export default {
  components: { Treeselect, TransactionHeader, DatePicker },
  data() {
    return {
      selected: [],
      expanded: [],
      numServerTransactions: 0,
      accountOptions: {
        account_id: this.$route.params.account_id
      },
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
      rules: {
        // date: (value) => {
        //   return this.$vm.validateDate(value) || 'Invalid date.'
        // },
        currency: (value) => {
          const result = isNaN(parseFloat(value)) && value.length > 0 ? 'Numbers only' : true
          return result
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
      handler(prev, current) {
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
    ...mapGetters(['dataTableHeaders', 'selectedBudgetId', 'categoriesById']),
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
    numTransactionsTotal() {
      return this.creatingNewTransactions ? this.numServerTransactions + 1 : this.numServerTransactions
    },
    outflowAmount: {
      get() {
        return this.editedItem.value < 0 ? Math.round(this.parseCurrencyValue(this.editedItem.value)) / 100 : ''
      },
      set(new_value) {
        this.editedItem.value = -Math.round(this.parseCurrencyValue(new_value) * 100)
      }
    },
    inflowAmount: {
      get() {
        return this.editedItem.value > 0 ? Math.round(this.parseCurrencyValue(this.editedItem.value)) / 100 : ''
      },
      set(new_value) {
        this.editedItem.value = Math.round(this.parseCurrencyValue(new_value) * 100)
      }
    }
  },
  methods: {
    getTransactions() {
      this.$store.dispatch('fetchTransactionsForAccount', this.accountOptions).then((result) => {
        this.numServerTransactions = result.total_rows
        this.transactions = result.rows.map((row) => {
          const category_name = _.get(this.categoriesById, [row.doc.category, 'name'], '')
          return {
            ...row.doc,
            ['category_name']: category_name
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
      this.$store
        .dispatch('createOrUpdateTransaction', payload)
        .then(() => this.getTransactions())
      this.resetEditedItem()
    },
    parseCurrencyValue(input_currency) {
      // Remove all non-digit chars except for period
      return input_currency.toString().replace(/[^0-9.]/g, '')
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
    deleteSelectedTransactions() {
      if (this.selected.length < 1) {
        return
      }
      this.$store.dispatch('deleteBulkDocumentsFromPouchAndVuex', { documents: this.selected }).then(() => {
        this.getTransactions()
        // this.$store.dispatch('updateBalances')
        this.selected = []
      })
    },
    deleteTransaction(item) {
      this.$store
        .dispatch('createOrUpdateTransaction', { current: null, previous: item })
        .then(() => {
          return this.getTransactions()
        })
        // .then(() => {
        //   return this.$store.dispatch('updateBalances')
        // })
      this.cancel()
    },
    save(item) {
      // let payload = {}
      let previous = this.creatingNewTransactions ? null : item
      // if (previous !== null && this.editedItem.date !== this.editedItem.month) {
      //   payload = {
      //     current:
      //   }
      // }
      this.prepareEditedItem()
      this.$store
        .dispatch('createOrUpdateTransaction', { current: this.editedItem, previous: previous })
        .then(() => {
          this.getTransactions()
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
    onClickMe() {
      console.log(this.transactions)
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
