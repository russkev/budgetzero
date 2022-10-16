<template>
  <header-row
    :title-id="`master-category-name-${masterIncomeCategory._id}`"
    :spent-id="`master-category-spent-${masterIncomeCategory._id}`"
    :balance-id="`master-category-balance-${masterIncomeCategory._id}`"
  >
    <template #title>
      <span class="text-h4 ml-3 secondary--text text--lighten-2">
        {{ masterIncomeCategory.name }}
      </span>
    </template>
    <template #spent>
      <div class="secondary--text text--lighten-2">
        <span class="text-h5">
          Spent
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(masterCategoriesStats[masterIncomeCategory._id].spent / 100) }}
        </span>
      </div>
    </template>
    <template #balance>
      <div class="secondary--text text--lighten-2">
        <span class="text-h5">
          Balance
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(masterCategoriesStats[masterIncomeCategory._id].balance / 100) }}
        </span>
      </div>
    </template>
    <template #collapse>
      <v-btn
        tile
        elevation="0"
        small
        class="pa-0 ma-0"
        min-width="20px"
        height="auto"
        color="transparent"
        :data-testid="`btn-expand-${masterIncomeCategory._id}`"
        @click="toggleMasterCategoryCollapsed(masterIncomeCategory._id)"
      >
        <v-icon small>
          {{ masterIncomeCategory.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
        </v-icon>
      </v-btn>
    </template>

  </header-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import HeaderRow from "./HeaderRow.vue";

export default {
  components: {
    HeaderRow,
  },
  computed: {
    ...mapGetters(["intlCurrency",  "masterIncomeCategory"]),
    ...mapGetters("categoryMonth", ["masterCategoriesStats"]),
  },
  methods: {
    ...mapActions(["toggleMasterCategoryCollapsed"]),
    // toggleMasterCategoryCollapsed() {
    //   console.log("MASTER CATEGORY TOGGLE")
    // },
  },
};
</script>