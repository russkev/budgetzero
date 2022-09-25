<!-- <template>
  <div>
    <v-row cols="12" class="pr-4">
      <v-card style="width: 300px;" outlined color="background lighten-1">
        <v-card-title id="selected-month" class="headline py-2">
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
          <div id="available-to-budget-text" class="text-center primary--text title">
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
</template> -->

<template>
  <v-alert
    align="right"
    border="left"
    :type="availableToBudget < 0 ? 'error' : 'success'"
    text
    class="pa-2"
    icon="false"
  >
    <template #prepend>
      <div class="mr-2"></div>
    </template>
    <div class="text-h5" data-testid="total-balance-title">
      <span v-if="availableToBudget < 0">
        Amount over budget:
      </span>
      <span v-else>
        Amount left to budget:
      </span>
    </div>
    <div class="text-h3" data-testid="total-balance">
      <span v-if="availableToBudget < 0">
        {{ intlCurrency.format(-availableToBudget / 100) }}
        <!-- {{  }} -->
      </span>
      <span v-else>
        {{ intlCurrency.format(availableToBudget / 100) }}
      </span>
    </div>
  </v-alert>
</template>

<script>
import { mapGetters } from "vuex";
import { compareAscii } from "../../store/modules/id-module";

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
      "monthBalances",
    ]),
    ...mapGetters("categoryMonth", ["selectedMonth", "masterCategoriesStats"]),
    monthStats() {
      let stats = {
        available_last_month: 0,
        income_this_month: 0,
        budgeted_this_month: 0,
        available_this_month: 0,
      };

      const sortedMonths = Object.keys(this.monthBalances).sort((a, b) => compareAscii(a, b));
      if (sortedMonths.length > 0) {
        let previous_month = sortedMonths[0];
        if (compareAscii(previous_month, this.selectedMonth) < 0) {
          for (let i = 1; i < sortedMonths.length; i++) {
            if (compareAscii(sortedMonths[i], this.selectedMonth) >= 0) {
              break;
            }
            previous_month = sortedMonths[i];
          }
          stats.available_last_month = this.monthBalances[previous_month].available;
        }
      }


      if (this.monthBalances[this.selectedMonth]) {
        stats.income_this_month = this.monthBalances[this.selectedMonth].income;
        stats.budgeted_this_month = this.monthBalances[this.selectedMonth].budgeted;
        stats.available_this_month = this.monthBalances[this.selectedMonth].available;
      } else {
        stats.income_this_month = 0;
        stats.budgeted_this_month = 0;
        stats.available_this_month = stats.available_last_month;
      }

      return stats;

      // const thisMonthIndex = sortedMonths.findIndex((month) => month === this.selectedMonth);
      // let previous_income = 0
      // if (thisMonthIndex > 0) {
      //   previous_income = this.monthBalances[sortedMonths[thisMonthIndex - 1]].income;
      // }

      // return stats;
    },
    availableToBudget() {
      // console.log('availableToBudget', this.monthStats.balance_this_month)

      // get previous month from monthBalances if it exists
      // let previousMonth = this.monthBalances.find(
      //   (monthBalance) => monthBalance.month === this.selectedMonth - 1
      // );

      // sort a list of months

      return this.monthStats.available_this_month;
    },

    // // monthDataExists() {
    // //   return this.allCategoryBalances[this.selectedMonth] !== undefined;
    // // },
    // monthStats() {
    //   let stats = {
    //     // leftover_last_month: 0,
    //     // income_this_month: 0,
    //     // overspent_last_month: 0,
    //     // budgeted_this_month: 0,
    //     // spent_this_month: 0,
    //     balance_this_month: 0,
    //   };
    //   // if (!this.monthDataExists) {
    //   //   return stats;
    //   // }

    //   // Object.entries(this.allCategoryBalances[this.selectedMonth]).reduce(
    //   //   (partial, [category_id, category_balances]) => {
    //   //     // // const is_income = this.masterCategoriesById[category_balances.master_id].isIncome
    //   //     // const is_income = this.masterCategoriesByCategoryId[category_id];
    //   //     // // Object.values(categories).map((category) => {
    //   //     // if (is_income) {
    //   //     //   stats.income_this_month += _.get(category_balances, ["spent"], 0);
    //   //     //   stats.leftover_last_month += _.get(category_balances, ["carryover"], 0);
    //   //     // } else {
    //   //     //   stats.spent_this_month += _.get(category_balances, ["spent"], 0);
    //   //     //   stats.overspent_last_month += _.get(category_balances, ["carryover"], 0);
    //   //     // }
    //   //     // stats.budgeted_this_month += _.get(category_balances, ["doc", "budget"], 0);
    //   //     // // })

    //   //   }
    //   // );
    //   // return stats;
    //   // Object.values(this.masterCategoriesStats).reduce(
    //   //   (partial, stats) => {
    //   //     stats.balance_this_month += stats.balance
    //   //   }
    //   // )
    //   console.log("this.masterCategoriesStats", Object.values(this.masterCategoriesStats));
    //   Object.values(this.masterCategoriesStats).forEach((stats_object) => {
    //     stats.balance_this_month += stats_object.balance;
    //   });
    // },
    // availableToBudget() {
    //   return (
    //     this.monthStats.balance_this_month
    //     // this.monthStats.leftover_last_month +
    //     // this.monthStats.income_this_month -
    //     // this.monthStats.budgeted_this_month +
    //     // this.monthStats.overspent_last_month
    //   );
    // },
  },
  methods: {},
};
</script>
