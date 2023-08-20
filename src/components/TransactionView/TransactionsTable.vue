<template>
  <v-sheet class="flex-table-container ma-0 pa-0" ref="tableWrapper" color="transparent">
    <v-data-table
      data-testid="transactions-table"
      v-model="selected"
      :headers="tableHeaders"
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
      class="transactions-table flex-table-main background lighten-1"
      :loading="isLoading"
    >
      <!-- group-desc -->
      <!-- disable-sort -->
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
        <tr :class="`transaction-row ${isHighlighted(item, isSelected) ? 'primary darken-4' : ''}`" :key="item._id">
          <!-- Checkbox -->
          <td class="row-checkbox pa-0 ma-0">
            <transaction-checked :item="item" :is-selected="isSelected" @input="select($event)" />
          </td>
          <!-- Cleared-->
          <td class="row-cleared pa-0">
            <transaction-cleared :item="item" :highlighted="isHighlighted(item, isSelected)" />
          </td>
          <!-- Category-->
          <td v-if="account && account.onBudget && !isCompact" class="row-category pa-0">
            <transaction-categories :item="item" :highlighted="isHighlighted(item, isSelected)" />
          </td>
          <!-- Description -->
          <td v-if="account && account.onBudget && !isCompact" class="row-description pa-0">
            <transaction-description :item="item" />
          </td>
          <td v-else class="row-description px-0 py-2">
            <transaction-categories :item="item" :highlighted="isHighlighted(item, isSelected)" />
            <transaction-description :item="item" />
          </td>
          <!-- Outflow -->
          <td class="pr-0 row-outflow" v-if="!isCompact">
            <transaction-flow :item="item" :isOutflow="true" />
          </td>
          <!-- Inflow -->
          <td class="pr-0 row-inflow">
            <transaction-flow v-if="!isCompact" :item="item" :isOutflow="false" />
            <transaction-flow v-else :item="item" :isOutflow="false" :is-both-directions="true" />
          </td>
          <!-- Balance -->
          <td class="pr-0 pl-2 row-balance">
            <transaction-balance :item="item" />
          </td>
          <!-- Delete -->
          <td class="pa-0 ma-0">
            <transaction-delete :item="item" />
          </td>
        </tr>
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
  data() {
    return {
      sizeObserver: null,
      isCompact: false
    }
  },
  mounted() {
    this.sizeObserver = new ResizeObserver(() => {
      if (this.$refs.tableWrapper.$el.offsetWidth < 800) {
        this.isCompact = true
      } else {
        this.isCompact = false
      }
    })
    this.sizeObserver.observe(this.$refs.tableWrapper.$el)
  },
  computed: {
    ...mapGetters('accountTransactions', [
      'account',
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
        if (transactions) {
          this.setSelectedTransactions(transactions)
        }
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
        this.updateAccountOptions(updated_options)
      }
    },
    tableHeaders() {
      if (!this.account) {
        return []
      }
      if (this.isCompact) {
        return this.dataTableHeaders.filter((header) => header.text !== 'Category' && header.text !== 'Outflow')
      } else {
        return this.dataTableHeaders.filter((header) => this.account.onBudget || header.text !== 'Category')
      }
    }
  },
  watch: {
    options: {
      handler(current, prev) {
        if (current.itemsPerPage !== prev.itemsPerPage) {
          localStorage.setItem('transactionsPerPage', current.itemsPerPage)
        }
        this.getTransactions()
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
    ...mapActions('accountTransactions', [
      'getTransactions',
      'setSelectedTransactions',
      'deleteTransaction',
      'updateAccountOptions'
    ]),
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
</style>
<style>
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
tbody tr:hover {
  background-color: var(--v-background-base) !important;
}

.date-row {
  min-height: 12px;
  color: var(--v-primary-lighten3);
  padding-left: 0px;
  height: 20px !important;
  transition: height 0s !important;
}

tr.v-data-table__empty-wrapper td {
  transition: height 0s !important;
}

.transactions-table th {
  min-width: min-content !important;
  background: var(--v-background-base) !important;
  border: none !important;
  box-shadow: none !important;
}

.transactions-table .v-input--selection-controls__input {
  margin: 0;
}

.transactions-table .v-input__slot {
  margin: 0;
}

.transactions-table table tr > td {
  border-bottom: 1px solid var(--v-background-base) !important;
}

.text-disabled {
  color: var(--v-background-lighten5);
}
</style>
