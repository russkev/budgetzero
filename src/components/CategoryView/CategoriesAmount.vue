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
      <categories-working
        :last-month="monthStats.available_last_month"
        :income="monthStats.income_this_month"
        :budgeted="monthStats.budgeted_this_month"
        :available="monthStats.available_this_month"
      />
    </v-card>
  </v-tooltip>
</template>

<script>
import { mapGetters } from "vuex";
import CategoriesWorking from "./CategoriesWorking.vue";

export default {
  props: {},
  components: {
    CategoriesWorking,
  },
  computed: {
    ...mapGetters([
      "intlCurrency",
      "allCategoryBalances",
      "masterCategoriesById",
      "masterCategoriesByCategoryId",
      "monthBalances",
    ]),
    ...mapGetters("categoryMonth", ["selectedMonth", "masterCategoriesStats", "monthStats"]),
    availableToBudget() {
      return this.monthStats.available_this_month;
    },
  },
  methods: {},
};
</script>
