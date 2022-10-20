<template>
  <header-row
    :title-id="`master-category-name-${masterIncomeCategory._id}`"
    :balance-id="`master-category-this-month-${masterIncomeCategory._id}`"
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
          {{ amount }}
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
import { INCOME, NONE } from "../../constants";
import _ from "lodash";

export default {
  components: {
    HeaderRow,
  },
  computed: {
    ...mapGetters(["intlCurrency",  "masterIncomeCategory" , "categoriesById"]),
    ...mapGetters("categoryMonth", ["masterCategoriesStats"]),
    incomeColor() {
      return _.get(this, ['categoriesById',[INCOME._id],'color','hex'], NONE.hexColor)
    },
    amount() {
      const value =
        this.masterCategoriesStats[INCOME._id].income -
        this.masterCategoriesStats[INCOME._id].expense;
      if (value === 0) {
        return this.intlCurrency.format(0);
      } else {
        return this.intlCurrency.format(value / 100);
      }
    }
  },
  methods: {
    ...mapActions(["toggleMasterCategoryCollapsed",  "updateIncomeColor"]),
        onColorChange(color) {
      this.updateIncomeColor(color)
    }
  },
};
</script>