<template>
  <v-container class="pt-0">
    <category-month-selector />
    <v-row justify="space-between" class="ma-0 pt-2">
      <v-col sm="auto" />
      <v-col sm="auto">
        <category-header />
      </v-col>
    </v-row>
    <v-row>
      <v-col />
      <v-col> Budget </v-col>
      <v-col> Spent </v-col>
      <v-col> Balance </v-col>
    </v-row>
    <draggable v-model="masterCategoriesData" handle=".master-handle">
      <v-row
        class="master-category-row ma-0 pa-0"
        v-for="(master_category, master_index) in masterCategoriesData"
        :key="master_category.id"
      >
        <master-category-row :masterCategory="master_category" :masterIndex="master_index" />
        <!-- <v-container> -->
          <!-- <draggable
            class="categories-container"
            :data-testid="`categories-container-${master_category.id}`"
            :id="`categories-container-${master_category.id}`"
            :group="{ name: master_category.id, put: true }"
            @end="onCategoryOrderChanged"
            handle=".handle"
          > -->
            <category-rows :categoriesForMaster="categoriesData[master_category.id]" :masterCategory="master_category" />
          <!-- </draggable> -->
        <!-- </v-container> -->
      </v-row>
    </draggable>
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import BaseDialogModalComponent from "../Modals/BaseDialogModalComponent.vue";
import CategoryHeader from "./CategoryHeader.vue";
import CategoryGridInput from "./CategoryGridInput.vue";
import CategoryMonthSelector from "./CategoryMonthSelector.vue";
import MasterCategoryRow from "./MasterCategoryRow.vue";
import CategoryRows from "./CategoryRows.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { ID_LENGTH } from "../../constants";

export default {
  name: "CategoryGrid",
  components: {
    draggable,
    BaseDialogModalComponent,
    CategoryHeader,
    CategoryGridInput,
    CategoryMonthSelector,
    MasterCategoryRow,
    CategoryRows,
},
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["intlCurrency", "categories"]),
    ...mapGetters("categoryMonth", [
      "categoriesData",
    ]),
    ...mapMutations("categoryMonth", ["SET_EDITED_MASTER_CATEGORY_ID"]),
    masterCategories: {
      get() {
        return this.$store.getters.masterCategories;
      },
      set(value) {
        this.$store.commit("REORDER_MASTER_CATEGORIES", value);
      },
    },
    masterCategoriesData: {
      get() {
        return this.masterCategories.map((master_category) => {
          return {
            id: master_category._id.slice(-ID_LENGTH.category),
            name: master_category.name,
          };
        });
      },
      set(values) {
        this.$store.dispatch("reorderMasterCategories", values);
      },
    },
  },
  mounted() {
    this.UPDATE_SELECTED_MONTH(this.$route.params.month);
  },
  beforeRouteUpdate(to, from, next) {
    this.UPDATE_SELECTED_MONTH(to.params.month);
    next();
  },
  methods: {
    ...mapMutations("categoryMonth", [
      "UPDATE_SELECTED_MONTH",
      "SET_EDITED_CATEGORY_BUDGET_ID",
      "SET_EDITED_CATEGORY_NAME_ID",
      "SET_EDITED_MASTER_CATEGORY_ID,",
    ]),
    ...mapActions("categoryMonth", [
      "onCategoryBudgetChanged",
      "onEditCategoryName",
      "onEditCategoryBudget",
    ]),

    
    

    // onSelectTarget(event) {
    //   // SAVE
    //   if (event.target) {
    //     event.target.select();
    //   }
    // },
  },
};
</script>

<style scoped>
.category-budgeted-input >>> input {
  text-align: right !important;
}
/* .budgeted-amount-neg >>> input {
} */
.budgeted-amount-pos >>> input {
  color: var(--v-primary-base);
}
.budgeted-amount-zero >>> input {
  color: grey;
}

/* .master-category-row */

.crud-actions {
  width: 200px;
  opacity: 0;
  transition: 0.2s ease-in-out;
}
tr:hover .crud-actions {
  opacity: 1;
}

.money-amount {
  text-align: right;
  min-width: 90px;
  width: 90px;
  max-width: 90px;
  padding-left: 0;
  padding-right: 5px;
}
.budgeted-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}
.spent-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}
.balance-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}

.header {
  text-align: right;
}
/* .category-row {
  border-bottom: 1px solid rgb(182, 182, 182);
  height: 30px;
} */

/* .masterCategory-row {
  padding: 5px 0px 5px 5px;
} */

.uncategorized-row {
  border-top: 1px solid rgb(182, 182, 182);
  height: 50px;
}

.budget-input-col {
  margin-top: -1px;
  height: 30px;
}
</style>
