<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title ma-0 ml-2">
    <v-card-title class="primary darken-3 pa-3">{{ title }}</v-card-title>
    <div class="transaction-details-grid pa-2 pb-0">
      <div class="text-h5">Budgeted</div>
      <div>
        <!-- {{ selectedCategory ? selectedCategory.budget : '' }} -->
        <currency-input
          v-model="budgetedData"
          input-testid="`category-budget-input-${category._id}`"
          />
      </div>
      <div>Move</div>
      <div></div>
      <div class="text-h5">Working</div>
      <div>
        <categories-working v-if="!selectedCategory"
          :last-month="monthStats.available_last_month"
          :income="monthStats.income_this_month"
          :budgeted="monthStats.budgeted_this_month"
          :available="monthStats.available_this_month"
        />
        <categories-working v-else
          :last-month="selectedCategory.carryover"
          :income="selectedCategory.income"
          :spent="selectedCategory.expense"
          :budgeted="selectedCategory.budget"
          :available="selectedCategory.balance"
          add-budgeted
        />
      </div>
    </div>
    <!-- <v-card-title class="primary darken-3 pa-3">Transactions</v-card-title> -->
    <div class="text-h4 mt-3">
      Transactions
    </div>
    <v-data-table
      :headers="transactionHeaders"
      :items="transactions"
      dense
      group-by="group"
      disable-sort
    >
      <template #group.header="{ items }">
        <td colspan="20">
          {{ formatDate(items[0].date) }}
        </td>
      </template>
      <template #item="{ item }">
        <tr>
          <td>
            <description-tooltip :item="item">
              <template #activator="{ on }">
                <div class="ellipsis" v-on="on">{{ item.memo }}</div>
              </template>
            </description-tooltip>
          </td>
          <td>
            {{ item.account }}
          </td>
          <td>
            {{ intlCurrency.format(item.amount / 100) }}
          </td>
          <td>
            {{ intlCurrency.format(item.balance / 100) }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import CategoriesWorking from "./CategoriesWorking.vue";
import { formatDate } from "../../helper";
import { mapGetters, mapActions } from "vuex";
import CurrencyInput from "../TransactionView/CurrencyInput.vue";

export default {
  name: "CategoryDetails",
  components: {
    CategoriesWorking,
    CurrencyInput,
  },
  watch: {
    masterCategoriesById: {
      handler: function () {
        this.getMonthTransactions();
      },
    },
  },
  computed: {
    ...mapGetters(["masterCategoriesById", "intlCurrency"]),
    ...mapGetters("categoryMonth", [
      "transactionHeaders",
      "monthTransactions",
      "selectedCategory",
      "monthStats",
    ]),
    transactions() {
      let balance = 0;
      let monthTransactions = JSON.parse(JSON.stringify(this.monthTransactions));
      const length = monthTransactions.length;
      let result = [];
      for (let i = length - 1; i >= 0; i--) {
        const monthTransaction = monthTransactions[i];
        if (!this.selectedCategory || monthTransaction.category === this.selectedCategory._id) {
          balance += monthTransaction.amount;
          result.push({
            ...monthTransaction,
            balance: balance,
          });
        }
      }
      return result.reverse();
    },
    title() {
      return this.selectedCategory ? this.selectedCategory.name : "All Categories";
    },
    budgetedData: {
      get() {
        return this.selectedCategory ? this.selectedCategory.budget : 0;
      },
      set(value) {
        if (!this.selectedCategory || this.selectedCategory.budget === value)
          return;
        const event = {target: {value: value}};
        this.onCategoryBudgetChanged({category_id: this.selectedCategory._id, event});
      },
    },
  },
  methods: {
    ...mapActions(["fetchTransactionsForMonth"]),
    ...mapActions("categoryMonth", ["getMonthTransactions", "onCategoryBudgetChanged",]),
    formatDate: formatDate,
  },
};
</script>

<style>
.category-details-title {
  width: 100%;
  overflow-y: auto;
}
</style>
