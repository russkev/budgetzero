<template>
  <v-container class="pa-0 category-rows-container">
    <v-divider/>
    <category-row 
      v-if="freezeFirstRow && frozenCategory"
      :category="frozenCategory"
      :master-category="masterCategory"
      freeze
      :hideBudgeted="hideBudgeted"
      :hideSpent="hideSpent"
      :hideBalance="hideBalance"
      :isIncome="isIncome"
    />
    <draggable
      class="categories-container"
      :data-testid="`categories-container-${masterCategory._id}`"
      :id="`categories-container-${masterCategory._id}`"
      :group="{ name: masterCategory._id, put: true }"
      @end="onCategoryOrderChanged"
      handle=".handle"
    >
      <category-row 
        v-for="(category, index) in draggableCategories" 
        :key="index"
        :category="category"
        :master-category="masterCategory"
        :hideBudgeted="hideBudgeted"
        :hideSpent="hideSpent"
        :hideBalance="hideBalance"
        :isIncome="isIncome"
      /> 
    </draggable>
    <v-row class="ma-0 pa-0">
      <v-sheet width="20px" color="transparent" class="row-side-widget" />
      <v-col class="ma-0 pa-0">
        <v-btn
          small
          tile
          text
          class="text-none"
          :data-testid="`btn-new-category-${masterCategory._id}`"
          @click="onNewCategory(masterCategory)"
        >
          <v-icon small class="ma-1" color="secondary lighten-3">mdi-plus</v-icon>
          <span class="secondary--text text--lighten-3">
            New Category
          </span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import draggable from "vuedraggable";
import { nextTick } from "vue";
import CategoryHide from "./CategoryHide.vue";
import CategoryRow from "./CategoryRow.vue";

export default {
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    nameCols: {
      type: Number,
      default: 5,
    },
    hideBudgeted: {
      type: Boolean,
      default: false,
    },
    hideSpent: {
      type: Boolean,
      default: false,
    },
    hideBalance: {
      type: Boolean,
      default: false,
    },
    isIncome: {
      type: Boolean,
      default: false,
    },
    freezeFirstRow: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    draggable,
    CategoryHide,
  },
  computed: {
    ...mapGetters(["categories"]),
    ...mapGetters("categoryMonth", [
      "editedCategoryBudgetId",
      "editedCategoryNameId",
      "categoriesData",
    ]),
    draggableCategories() {
      if (!this.freezeFirstRow) {
        return this.categoriesData[this.masterCategory._id]
      } else {
        return this.categoriesData[this.masterCategory._id].slice(1)
      }
    },
    frozenCategory() {
      if (this.freezeFirstRow && this.categoriesData[this.masterCategory._id].length > 0) {
        return this.categoriesData[this.masterCategory._id][0]
      } else {
        return null
      }
    }
  },
  methods: {
    // ...mapMutations("categoryMonth", ["SET_EDITED_CATEGORY_BUDGET_ID"]),
    ...mapActions("categoryMonth", [
      "onCategoryOrderChanged",
      // "onCategoryNameChange",
      // "onCategoryBudgetChanged",
      // "onEditCategoryName",
      // "onEditCategoryBudget",
      "onHideCategory",
      "onUnhideCategory",
      "newCategory",
    ]),
    onNewCategory(master_category) {
      this.newCategory(master_category).then((id) => {
        const element_id = `category-name-input-${id}`;

        nextTick(() => {
          const new_element = document.getElementById(element_id);
          if (!new_element) {
            return;
          }
          new_element.focus();
          new_element.select();
        });
      });
    },
    onCategoryBudgetEnter(category, event) {
      // this.onCategoryBudgetChanged({ category_id: category._id, event: event });
      const next_id = this.categoryIdFromIndex(category.index + 1);
      document.activeElement.blur();
      if (next_id !== undefined) {
        this.SET_EDITED_CATEGORY_BUDGET_ID(next_id);
        const element_id = `category-budget-input-${next_id}`;
        const element = document.getElementById(element_id);
        if (!element) {
          return;
        }
        element.focus();
        nextTick().then(() => {
          element.select();
        });
      }
    },
    categoryIdFromIndex(index) {
      if (index >= this.categories.length) {
        return undefined;
      }
      for (let categories_from_master of Object.values(this.categoriesData)) {
        for (let category_data of categories_from_master) {
          if (category_data.index === index) {
            return category_data._id;
          }
        }
      }
      return undefined;
    },
    // spentValue(category) {
    //   if (category.spent === 0) {
    //     return this.intlCurrency.format(0)
    //   } else {
    //     return this.intlCurrency.format(this.negativeMultiplier * category.spent / 100) 
    //   }
    // },
    
    // balanceColor(category) {
    //   if (category.balance < 0) {
    //     return `error--text text--lighten-3`;
    //   } else if (category.balance > 0) {
    //     return `success--text text--lighten-3`;
    //   } else {
    //     return "";
    //   }
    // },
    canDrag(hover, index) {
      if(!hover) {
        return false;
      }
      if (this.freezeFirstRow) {
        return index > 0;
      } else {
        return true;
      }
    },
  },
};
</script>

<style>
.color-swatch-container {
  display: flex;
  align-items: center;
}
</style>
