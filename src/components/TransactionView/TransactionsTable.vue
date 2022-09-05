<template>
  <v-data-table
    id="transactions-table"
    data-testid="transactions-table"
    v-model="selected"
    :headers="dataTableHeaders"
    :items="transactions"
    item-key="_id"
    show-select
    single-expand
    dense
    :expanded.sync="expanded"
    :options.sync="options"
    :server-items-length="numTransactionsTotal"
    :items-per-page="itemsPerPage"
  >
  </v-data-table>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { DEFAULT_TRANSACTIONS_PER_PAGE } from '../../constants';
export default {
  computed: {
    ...mapGetters("accountTransactions", [
      "accountId",
      "accountOptions",
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
        : this.numServerTransactions
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
  created() {
    const saved_transactions_per_page = localStorage.getItem("transactionsPerPage")
    if (saved_transactions_per_page) {
      this.SET_ITEMS_PER_PAGE(parseInt(saved_transactions_per_page))
    } else {
      this.SET_ITEMS_PER_PAGE(DEFAULT_TRANSACTIONS_PER_PAGE)
    }
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_ACCOUNT_ID",
      "SET_SELECTED_TRANSACTIONS",
      "SET_EXPANDED_TRANSACTIONS",
      "SET_ACCOUNT_OPTIONS",
      "SET_ITEMS_PER_PAGE"
    ]),
    ...mapActions("accountTransactions", [
      "getTransactions",
    ])

  },
};
</script>
