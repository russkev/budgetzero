<template>
  <div>
    <v-row cols="12" class="pr-4">
      <v-card style="width: 300px;" outlined>
        <v-card-title id="selected-month" class="headline grey lighten-4 py-2">
          {{
            new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long" }).format(
              new Date(selectedMonth)
            )
          }}
        </v-card-title>
        <v-card-subtitle
          v-if="!monthDataExists"
          id="data-doesnt-exist-msg"
          class="grey lighten-4 pt-2 pb-1"
        >
          <span>Data does not exist for this month</span>
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="pa-0">
          <div class="px-2 pt-2">
            <p style="text-align: left;" class="subtitle-2 mb-0">
              Leftover Last Month
              <span id="leftover-amount" style="float: right;">
                {{ intlCurrency.format(monthStats.leftover_last_month / 100) }}
              </span>
            </p>
            <p style="text-align: left;" class="subtitle-2 mb-0">
              Income This Month
              <span id="income-amount" style="float: right;">
                {{ intlCurrency.format(monthStats.income_this_month / 100) }}
              </span>
            </p>
            <p style="text-align: left;" class="subtitle-2 mb-0">
              Overspent Last Month
              <span id="overspent-amount" style="float: right;">
                {{ intlCurrency.format(monthStats.overspent_last_month / 100) }}
              </span>
            </p>
            <p style="text-align: left;" class="subtitle-2 mb-2">
              Budgeted This Month
              <span id="budgeted-amount" style="float: right;">
                {{ intlCurrency.format(monthStats.budgeted_this_month / 100) }}
              </span>
            </p>
            <p style="text-align: left;" class="subtitle-2 mb-2">
              Spent This Month
              <span id="budgeted-amount" style="float: right;">
                {{ intlCurrency.format(monthStats.spent_this_month / 100) }}
              </span>
            </p>
          </div>
          <v-divider />
          <div id="available-to-budget-text" class="text-center primary--text title grey lighten-4">
            Available To Budget
            <v-divider />
          </div>

          <div id="available-to-budget-amount" class="title text-center mb-0">
            {{ intlCurrency.format(availableToBudget / 100) }}
          </div>
        </v-card-text>
      </v-card>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {},
  // data() {
  //   return {
  //     intlCurrency: new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }),
  //   };
  // },
  computed: {
    ...mapGetters([
      "intlCurrency",
      "allCategoryBalances",
      "masterCategoriesById",
      "masterCategoriesByCategoryId",
    ]),
    ...mapGetters("categoryMonth", ["selectedMonth"]),
    monthDataExists() {
      return this.allCategoryBalances[this.selectedMonth] !== undefined;
    },
    monthStats() {
      let stats = {
        leftover_last_month: 0,
        income_this_month: 0,
        overspent_last_month: 0,
        budgeted_this_month: 0,
        spent_this_month: 0,
      };
      if (!this.monthDataExists) {
        return stats;
      }

      Object.entries(this.allCategoryBalances[this.selectedMonth]).reduce(
        (partial, [category_id, category_balances]) => {
          // const is_income = this.masterCategoriesById[category_balances.master_id].isIncome
          const is_income = this.masterCategoriesByCategoryId[category_id];
          // Object.values(categories).map((category) => {
          if (is_income) {
            stats.income_this_month += _.get(category_balances, ["spent"], 0);
            stats.leftover_last_month += _.get(category_balances, ["carryover"], 0);
          } else {
            stats.spent_this_month += _.get(category_balances, ["spent"], 0);
            stats.overspent_last_month += _.get(category_balances, ["carryover"], 0);
          }
          stats.budgeted_this_month += _.get(category_balances, ["doc", "budget"], 0);
          // })
        }
      );
      return stats;
    },
    availableToBudget() {
      return (
        this.monthStats.leftover_last_month +
        this.monthStats.income_this_month -
        this.monthStats.budgeted_this_month +
        this.monthStats.overspent_last_month
      );
    },
  },
  methods: {},
};
</script>
