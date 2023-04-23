<template>
  <v-sheet class="flex-table-container ma-0 pa-0" color="transparent">
    <v-data-table
      id="transactions-table"
      data-testid="transactions-table"
      v-model="selected"
      :headers="dataTableHeaders"
      :items="transactions"
      group-by="date"
      item-key="_id"
      show-select
      single-expand
      dense
      fixed-header
      disable-sort
      :options.sync="options"
      :server-items-length="numTransactionsTotal"
      :items-per-page="itemsPerPage"
      :footer-props="{
        'items-per-page-options': [5, 10, 20, 50, 100, 200],
        'update.options': options
      }"
      :header-props="{
        'disable-sort': true,
        class: 'text-body-2'
      }"
      class="flex-table-main background lighten-1"
      :loading="isLoading"
    >
      <template #header.data-table-select="{ on, props }">
        <v-simple-checkbox
          :ripple="false"
          v-bind="props"
          v-on="on"
          color="primary"
          class="px-0 py-auto ma-0 select-all-checkbox"
        />
      </template>
      <template #header="{ name }">
        <span class="text-body-2">{{ name }}</span>
      </template>
      <template #group.header="{ items }">
        <td colspan="20" class="date-row background">
          {{ formatDate(items[0].date) }}
        </td>
      </template>
      <template #item="{ item, select, isSelected }">
        <v-hover v-slot="{ hover: hover }">
          <tr :class="`transaction-row ${isHighlighted(item, isSelected) ? 'info darken-4' : ''}`" :key="item._id">
            <td class="row-checkbox pa-0 ma-0">
              <transaction-checked :item="item" :hover="hover" :is-selected="isSelected" @input="select($event)" />
            </td>
            <td class="row-cleared pa-0">
              <transaction-cleared :item="item" :hover="hover" :highlighted="isHighlighted(item, isSelected)" />
            </td>
            <td class="row-category pa-0">
              <transaction-categories :item="item" :highlighted="isHighlighted(item, isSelected)" />
            </td>
            <td class="row-description pa-0">
              <transaction-description :item="item" />
            </td>
            <td class="pr-0 row-outflow">
              <transaction-flow :item="item" :isOutflow="true" />
            </td>
            <td class="pr-0 row-inflow">
              <transaction-flow :item="item" :isOutflow="false" />
            </td>
            <td class="pr-0 pl-2 row-balance">
              <transaction-balance :item="item" />
            </td>
            <td class="pa-0 ma-0">
              <transaction-delete :item="item" :hover="hover" />
            </td>
          </tr>
        </v-hover>
      </template>
    </v-data-table>
  </v-sheet>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { DEFAULT_TRANSACTIONS_PER_PAGE } from '../../constants'
import { formatDate } from '../../helper'
import TransactionChecked from './TransactionChecked.vue'
import TransactionBalance from './TransactionBalance.vue'
import TransactionDescription from './TransactionDescription.vue'
import TransactionCleared from './TransactionCleared.vue'
import TransactionCategories from './TransactionCategories.vue'
import TransactionFlow from './TransactionFlow.vue'
import TransactionDelete from './TransactionDelete.vue'

export default {
  components: {
    TransactionChecked,
    TransactionBalance,
    TransactionDescription,
    TransactionCleared,
    TransactionCategories,
    TransactionFlow,
    TransactionDelete
  },
  computed: {
    ...mapGetters('accountTransactions', [
      'accountId',
      'accountOptions',
      'editedTransaction',
      'selectedTransactions',
      'expandedTransactions',
      'dataTableHeaders',
      'transactions',
      'numServerTransactions',
      'itemsPerPage',
      'isCreatingNewTransaction',
      'isLoading'
    ]),
    ...mapGetters(['selectedBudgetId', 'accounts', 'intlCurrency']),
    numTransactionsTotal() {
      return this.isCreatingNewTransaction ? this.numServerTransactions + 1 : this.numServerTransactions
    },
    selected: {
      get() {
        return this.selectedTransactions
      },
      set(transactions) {
        this.setSelectedTransactions(transactions)
      }
    },
    expanded: {
      get() {
        return this.expandedTransactions
      },
      set(transactions) {
        this.SET_EXPANDED_TRANSACTIONS(transactions)
      }
    },
    options: {
      get() {
        return this.accountOptions
      },
      set(updated_options) {
        this.SET_ACCOUNT_OPTIONS(updated_options)
      }
    }
  },
  watch: {
    options: {
      handler(current, prev) {
        if (current.itemsPerPage !== prev.itemsPerPage) {
          localStorage.setItem('transactionsPerPage', current.itemsPerPage)
        }
      },
      deep: true
    }
  },
  created() {
    const saved_transactions_per_page = localStorage.getItem('transactionsPerPage')
    if (saved_transactions_per_page) {
      this.SET_ITEMS_PER_PAGE(parseInt(saved_transactions_per_page))
    } else {
      this.SET_ITEMS_PER_PAGE(DEFAULT_TRANSACTIONS_PER_PAGE)
    }
  },
  methods: {
    ...mapMutations('accountTransactions', [
      'SET_ACCOUNT_ID',
      'SET_SELECTED_TRANSACTIONS',
      'SET_EXPANDED_TRANSACTIONS',
      'SET_ACCOUNT_OPTIONS',
      'SET_ITEMS_PER_PAGE'
    ]),
    ...mapActions('accountTransactions', ['getTransactions', 'setSelectedTransactions', 'deleteTransaction']),
    ...mapActions(['commitDocToPouchAndVuex']),
    formatDate: formatDate,
    isHighlighted(item, isSelected) {
      return !this.isLoading && (isSelected || item._id === this.editedTransaction._id)
    }
  }
}
</script>

<style scoped>
table {
  table-layout: fixed;
}

table tr.transaction-row > td {
  border-bottom: 1px solid var(--v-background-base) !important;
}

.flex-table-main {
  display: flex;
  width: 100%;
  flex-direction: column;
  flex-grow: 1;
}

.flex-table-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}
</style>
<style>
tbody tr:hover {
  background-color: var(--v-background-base) !important;
}

.date-row {
  min-height: 12px;
  color: var(--v-secondary-lighten3);
  padding-left: 0px;
  height: 20px !important;
  transition: height 0s !important;
}

tr.v-data-table__empty-wrapper td {
  transition: height 0s !important;
}

#transactions-table th {
  min-width: min-content !important;
  background: var(--v-background-base);
  border: none;
  box-shadow: none;
}

#transactions-table .v-input--selection-controls__input {
  margin: 0;
}

#transactions-table .v-input__slot {
  margin: 0;
}

.text-disabled {
  color: var(--v-background-lighten5);
}
</style>
