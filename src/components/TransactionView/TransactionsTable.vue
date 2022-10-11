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
        'update.options': options,
      }"
      :header-props="{
        'disable-sort': true,
        class: 'text-body-2',
      }"
      class="flex-table-main background lighten-1"
    >
      <!-- :expanded.sync="expanded" -->
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
      <template #group.header="{items}">
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
              <transaction-cleared :item="item" :hover="hover" :highlighted="isHighlighted(item, isSelected)"/>
            </td>
            <td class="row-category pa-0">
              <transaction-categories :item="item" :highlighted="isHighlighted(item, isSelected)"/>
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
              <delete-button
                :hover="hover"
                :data-testid="`btn-delete-transaction-${item._id}`"
                @click="onDeleteTransaction(item)"
                height="100%"
              />
            </td>
          </tr>
        </v-hover>
      </template>
    </v-data-table>
  </v-sheet>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { DEFAULT_TRANSACTIONS_PER_PAGE } from "../../constants";
import TransactionChecked from "./TransactionChecked.vue";
import TransactionBalance from "./TransactionBalance.vue";
import TransactionDescription from "./TransactionDescription.vue";
import TransactionCleared from "./TransactionCleared.vue";
import TransactionCategories from "./TransactionCategories.vue";
import DeleteButton from "../CategoryView/DeleteButton.vue";
import TransactionFlow from "./TransactionFlow.vue";

export default {
  components: {
    TransactionChecked,
    TransactionBalance,
    TransactionDescription,
    TransactionCleared,
    TransactionCategories,
    TransactionFlow,
    DeleteButton,
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
    ...mapGetters(["selectedBudgetId", "accounts", "intlCurrency"]),
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
        this.setSelectedTransactions(transactions);
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
    ...mapActions("accountTransactions", ["getTransactions", "setSelectedTransactions"]),
    ...mapActions(["commitDocToPouchAndVuex"]),
    // Convert date to weekday, day, month, year words
    formatDate(date) {
      const date_obj = new Date(date);
      const weekday = date_obj.toLocaleString("en-us", { weekday: "long" });
      const day = date_obj.toLocaleString("en-us", { day: "numeric" });
      const month = date_obj.toLocaleString("en-us", { month: "long" });
      const year = date_obj.toLocaleString("en-us", { year: "numeric" });
      return `${weekday}, ${day} ${month}, ${year}`;
    },
    isHighlighted(item, isSelected) {
      return isSelected || item._id === this.editedTransaction._id;
    },
    // onCategorySelected({ item, categoryId }) {
    //   console.log("onCategorySelected", categoryId);
    //   const current = { ...item, category: categoryId };
    //   const previous = item;
    //   this.commitDocToPouchAndVuex({ current, previous }).then(() => {
    //     this.getTransactions();
    //   });
    // },
    onDeleteTransaction(transaction) {
      // this.commitDocToPouchAndVuex({ current: null, previous: transaction }).then(() => {
      //   this.getTransactions();
      // });
      console.log("onDeleteTransaction", transaction);
    },
    tempSelect(event) {
      console.log("TEMP SELECT", event);
    }
  },
};
</script>

<style scoped>
table {
  table-layout: fixed;
}

tbody tr:hover {
  background-color: var(--v-background-base) !important;
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

/* td.row-checkbox {

} */
</style>
<style>
.date-row {
  min-height: 12px;
}

#transactions-table th {
  padding: 0;
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
</style>
