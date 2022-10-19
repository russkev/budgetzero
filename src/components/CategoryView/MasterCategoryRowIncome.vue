<template>
  <header-row
    :title-id="`master-category-name-${masterIncomeCategory._id}`"
    :spent-id="`master-category-spent-${masterIncomeCategory._id}`"
    :balance-id="`master-category-balance-${masterIncomeCategory._id}`"
  >
  <template #color>
    <master-category-color :color="incomeColor" @updated="onColorChange" />
  </template>
    <template #title>
      <span class="text-h4 ml-3">
        {{ masterIncomeCategory.name }}
      </span>
    </template>
    <template #balance>
      <div>
        <span class="text-h5">
          This Month
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
import { INCOME } from "../../constants";

export default {
  components: {
    HeaderRow,
  },
  computed: {
    ...mapGetters(["intlCurrency",  "masterIncomeCategory" , "categoriesById"]),
    ...mapGetters("categoryMonth", ["masterCategoriesStats"]),
    incomeColor() {
      const incomeBaseCategory = this.categoriesById[INCOME._id]
      if (incomeBaseCategory) {
        return incomeBaseCategory.color.hex
      } else {
        return "000000"
      }
    },
  },
  methods: {
    ...mapActions(["toggleMasterCategoryCollapsed",  "updateIncomeColor"]),
        onColorChange(color) {
      this.updateIncomeColor(color)
    }
  },
};
</script>