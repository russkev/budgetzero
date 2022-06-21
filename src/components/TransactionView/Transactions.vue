<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="dataTableHeaders"
      :items="transactions"
      item-key="_id"
      sort-by="_id"
      show-select
      single-expand
      :expanded.sync="expanded"
      :options.sync="accountOptions"
      :server-items-length="num_transactions_total"
      class="elevation-1"
      :footer-props="{
        'items-per-page-options': [10, 20, 50, 100, 200]
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
            <v-menu v-model="dateMenuIsVisible" transition="scale-transition" offset-x offset-y>
              <template #activator="{ on }">
                <v-text-field class="pa-0 pb-1" label="" v-model="editedItem.date" v-on="on" :rules="[rules.date]" />
              </template>
              <v-date-picker v-model="editedItem.date" @input="dateMenu = false" />
            </v-menu>
          </td>
          <td v-else @click="editItem(item); expand(item)">
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

          <td v-else @click="editItem(item); expand(item)">
            {{ item.category_name }}
          </td>

          <!-- Memo input -->
          <td v-if="item._id === editedItem._id">
            <v-text-field v-model="editedItem.memo" />
          </td>

          <td v-else class="memo" @click="editItem(item); expand(item)">
            {{ item.memo }}
          </td>

          <!-- Outflow -->
          <td v-if="item._id === editedItem._id">
            <v-text-field 
              v-model="outflowAmount"
              prefix='$'
              color="red"
              id="outflow-input"
              :rules="[rules.currency]"
            />
          </td>
          <td v-else @click="editItem(item); expand(item)">
            {{ item.value > 0 ? '' : (-item.value / 100) | currency }}
          </td>

          <!-- Inflow -->
          <td v-if="item._id === editedItem._id">
            <v-text-field 
              v-model="inflowAmount"
              prefix='$'
              color="green"
              id="inflow-input"
              :rules="[rules.currency]"
            />
          </td>
          <td v-else @click="editItem(item); expand(item)">
            {{ item.value > 0 ? item.value / 100 : '' | currency }}
          </td>
        </tr>
      </template>

      <template #expanded-item>
        <td :colspan="dataTableHeaders.length" class="mr-0 pr-0 grey lighten-2">
          <v-btn small @click="cancel()"> Cancel </v-btn>
          <v-btn small @click="save()"> Save </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-btn @click='onClickMe'>
      Create
    </v-btn>
    <v-btn @click='deleteSelectedTransactions'>
      Delete selected
    </v-btn>
  </div>
</template>

<script>
import { DEFAULT_TRANSACTION, ID_LENGTH, ID_NAME } from '../../constants'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  components: { Treeselect },
  data() {
    return {
      selected: [],
      expanded: [],
      num_transactions_total: 0,
      accountOptions: {
        account_id: this.$route.params.account_id
      },
      transactions: [],
      editedIndex: -1,
      date: moment(new Date()).format('YYYY-MM-DD'),
      dateMenuIsVisible: false,
      creating_new_transactions: false,
      editedItem: {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format('YYYY-MM-DD')
      },
      rules: {
        date: (value) => {
          const pattern = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
          return pattern.test(value) || 'Invalid date.'
        },
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
      handler() {
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
    // Re-configure categoriesGroupedByMaster to be in correct format for treeselect
    ...mapGetters(['dataTableHeaders', 'selectedBudgetID']),
    categoryOptions() {
      const key_values = Object.entries(this.$store.getters.categoriesGroupedByMaster)
      return key_values.map(([master_category_id, categories]) => {
        if (master_category_id === 'undefined') {
          return {
            id: 'null',
            label: categories[0].name
          }
        } else {
          const category_label = this.$store.getters.masterCategoriesByTruncatedId[master_category_id].name
          return {
            id: master_category_id,
            label: category_label,
            children: categories.map((category) => {
              return {
                id: category._id.slice(-ID_LENGTH.category),
                label: category.name
              }
            })
          }
        }
      })
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
        console.log("categoriesByTruncatedId")
        console.log(result)
        this.num_transactions_total = result.total_rows
        this.transactions = result.rows.map((row) => {
          const category_name = _.get(this.$store.getters.categoriesByTruncatedId, [row.doc.category, 'name'], '')
          return {
            ...row.doc,
            ['category_name']: category_name,
          }
        })
      })
    },
    editItem(item) {
      this.creating_new_transactions = false
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
      this.$store.dispatch('createOrUpdateTransaction', this.editedItem).then(() => {
        this.getTransactions()
      })
      this.resetEditedItem()
    },
    parseCurrencyValue(input_currency) {
      // Remove all non-digit chars except for period
      return input_currency.toString().replace(/[^0-9.]/g, '')
    },
    resetEditedItem() {
      if (this.creating_new_transactions && this.editedIndex > -1) {
        this.transactions.splice(this.editedIndex, 1)
      }
      this.creating_new_transactions = false
      this.editedIndex = -1
      this.editedItem = {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format('YYYY-MM-DD')
      }
    },
    prepareEditedItem() {
      let value = 0
      // if (this.editedItem.inflow !== '') {
      //   value += this.editedItem.inflow
      // }
      // if (this.editedItem.outflow !== '') {
      //   value -= this.editedItem.outflow
      // }


      Vue.delete(this.editedItem, 'category_name')

      if (this.editedItem.category === 'null') {
        this.editedItem.category = null
      }
    },
    addTransaction() {
      this.creating_new_transactions = true
      const date = moment(new Date()).format('YYYY-MM-DD')
      this.editedItem = {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: date,
        _id: `b_${this.selectedBudgetID}${ID_NAME.transaction}${this.generateId(date)}`
      }
      console.log(this.editedItem)
      this.transactions.push(this.editedItem)
      this.transactions.sort((a, b) => ('' + b._id).localeCompare(a._id))
      this.editedIndex = this.transactions.indexOf(this.editedItem)
      this.expanded.push(this.editedItem)
    },
    deleteSelectedTransactions() {
      // const payload = [...this.selected]
      if (this.selected.length < 1) {
        return
      }
      this.$store
        .dispatch('deleteBulkDocumentsFromPouchAndVuex', {documents: this.selected})
        .then(() => {
          this.getTransactions()
          this.$store.dispatch('updateBalances')
        })
        // .then(() => {
        //   this.selected = []
        // })

    },
    deleteTransaction(item) {
      this.$store.dispatch('deleteDocFromPouchAndVuex', {...item})
        .then(() => {
          return this.getTransactions()
        })
        .then(() => {
          return this.$store.dispatch('updateBalances')
        })
      this.cancel()
    },
    save() {
      this.prepareEditedItem()
      this.$store
        .dispatch('createOrUpdateTransaction', this.editedItem)
        .then(() => {
          this.getTransactions()
        })
        .then(() => {
          this.$store.dispatch('updateBalances')
        })
      this.cancel()
    },
    cancel() {
      this.selected = []
      this.expanded = []
      this.resetEditedItem()
    },
    onClickMe() {
      // console.log(base64Date("2022-06-25"))
      // console.log(base64Date("2022-06-24"))
      // console.log(base64Date("2022-06-23"))
      this.addTransaction()
      console.log(this.editItem)
      // this.$store.dispatch('fetchAllTransactions')
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
