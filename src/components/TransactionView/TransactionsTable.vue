<template>
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
    :expanded.sync="expanded"
    :options.sync="options"
    :server-items-length="numTransactionsTotal"
    :items-per-page="itemsPerPage"
    :footer-props="{
      'items-per-page-options': [5, 10, 20, 50, 100, 200],
      'update.options': options,
    }"
  >
    <template #group.header="{items}">
      <td colspan="20" class="date-row">
        {{ items[0].date }}
      </td>
    </template>
    <template #item="{ item, expand, select, isSelected }">
      <tr class="transaction-row" :key="item._id">
        <td id="edit-row-checkbox" class="expanded-checkbox">
          <toggle-checked :is-selected="isSelected" @input="select($event)" />
        </td>
        <td class="row-cleared pa-0">
          <toggle-cleared :item="item" />
        </td>
        <td class="row-memo">
          <transaction-category :item="item" @expand="expand(item)" />
        </td>
        <td class="row-outflow">
          <transaction-flow :item="item" @expand="expand(item)" is-outflow />
        </td>
        <td class="row-inflow">
          <transaction-flow :item="item" @expand="expand(item)" />
        </td>
        <td class="row-balance">
          <transaction-balance :item="item" />
        </td>
      </tr>
    </template>
    <template #expanded-item="{ item }">
      <tr>
        <transaction-expanded :item="item"/>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { DEFAULT_TRANSACTIONS_PER_PAGE } from "../../constants";
import ToggleChecked from "./ToggleChecked.vue";
import SelectCategory from "./SelectCategory.vue";
import TransactionFlow from "./TransactionFlow.vue";
import TransactionBalance from "./TransactionBalance.vue";
import TransactionExpanded from "./TransactionExpanded.vue";

export default {
  components: {
    ToggleChecked,
    SelectCategory,
    TransactionFlow,
    TransactionBalance,
    TransactionExpanded,
  },
  computed: {
    ...mapGetters("accountTransactions", [
      "accountId",
      "accountOptions",
      "editedTransaction",
      "selectedTransactions",
      "expandedTransactions",
      "dataTableHeaders",
      "transactions",
      "numServerTransactions",
      "itemsPerPage",
      "isCreatingNewTransaction",
    ]),
    ...mapGetters(["selectedBudgetId", "accounts"]),
    numTransactionsTotal() {
      return this.isCreatingNewTransaction
        ? this.numServerTransactions + 1
        : this.numServerTransactions;
    },
    selected: {
      get() {
        return this.selectedTransactions;
      },
      set(transactions) {
        this.SET_SELECTED_TRANSACTIONS(transactions);
      },
    },
    expanded: {
      get() {
        return this.expandedTransactions;
      },
      set(transactions) {
        this.SET_EXPANDED_TRANSACTIONS(transactions);
      },
    },
    options: {
      get() {
        return this.accountOptions;
      },
      set(updated_options) {
        this.SET_ACCOUNT_OPTIONS(updated_options);
      },
    },
  },
  watch: {
    options: {
      handler(current, prev) {
        if (current.itemsPerPage !== prev.itemsPerPage) {
          localStorage.setItem("transactionsPerPage", current.itemsPerPage);
        }
      },
      deep: true,
    },
  },
  created() {
    const saved_transactions_per_page = localStorage.getItem("transactionsPerPage");
    if (saved_transactions_per_page) {
      this.SET_ITEMS_PER_PAGE(parseInt(saved_transactions_per_page));
    } else {
      this.SET_ITEMS_PER_PAGE(DEFAULT_TRANSACTIONS_PER_PAGE);
    }
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_ACCOUNT_ID",
      "SET_SELECTED_TRANSACTIONS",
      "SET_EXPANDED_TRANSACTIONS",
      "SET_ACCOUNT_OPTIONS",
      "SET_ITEMS_PER_PAGE",
    ]),
    ...mapActions("accountTransactions", ["getTransactions"]),
  },
};
</script>

<style scoped>
td.row-memo {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
table {
  table-layout: fixed;
}
</style>
