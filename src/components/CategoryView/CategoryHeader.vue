<template>
  <v-tooltip bottom class="pa-0" color="transparent" :open-delay="500">
    <template #activator="{on}">
      <v-alert
        align="right"
        border="left"
        :type="availableToBudget < 0 ? 'error' : 'success'"
        text
        class="pa-2"
        icon="false"
        v-on="on"
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
    <v-card max-width="600px" flat outlined color="outline background" class="ma-0 px-4 py-1">
      <div class="header-balance-grid">
        <div>Left over from last month:</div>
        <div></div>
        <div>{{ intlCurrency.format(monthStats.available_last_month / 100)}}</div>
        <div>Income this month</div>
        <div>+</div>
        <div>{{ intlCurrency.format(monthStats.income_this_month / 100)}}</div>
        <div>Budgeted this month</div>
        <div>-</div>
        <div>{{ intlCurrency.format(monthStats.budgeted_this_month / 100)}}</div>
        <div>Available to budget</div>
        <div>=</div>
        <div>{{ intlCurrency.format(monthStats.available_this_month / 100)}}</div>
      </div>
    </v-card>
  </v-tooltip>
</template>

<script>
import { mapGetters } from "vuex";
import { compareAscii } from "../../store/modules/id-module";

export default {
  props: {},
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
    },
    availableToBudget() {
      return this.monthStats.available_this_month;
    },
  },
  methods: {},
};
</script>


<style>
div.header-balance-grid {
  display: grid;
  grid-template-columns: auto auto 100px;
}

div.header-balance-grid > :nth-child(3n) {
  text-align: right;
}


</style>