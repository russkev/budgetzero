<template>
  <div class="ma-0 pa-0" :key="category._id">
    <!-- <v-divider v-if="index == 0" /> -->
    <v-hover v-slot="{ hover }">
      <v-row class="ma-0 pa-0 category-row">
        <v-sheet
          width="20px"
          color="transparent"
          class="row-side-widget"
          :data-testid="`drag-category-${category._id}`"
        >
          <v-icon v-if="hover &&!freeze" small class="handle ma-auto">
            mdi-drag-vertical
          </v-icon>
        </v-sheet>
        <v-sheet width="3px" class="mr-2 color-swatch-container" color="transparent">
          <v-sheet
            width="3px"
            height="18px"
            :color="
              categoryColors[category._id] === undefined
                ? 'transparent'
                : categoryColors[category._id]
            "
          />
        </v-sheet>
        <v-col class="pa-0 ma-0">
          <v-row class="ma-0 pa-0">
            <v-col
              :cols="nameCols"
              class="pa-0 ma-0 my-1"
              :data-testid="`category-name-${category._id}`"
            >
              <category-grid-input
                class="category-name-input"
                :id="`category-name-input-${category._id}`"
                :data-testid="`category-name-input-${category._id}`"
                :is-editing="isEditingName(category._id)"
                :value="category.name"
                @edit="onEditCategoryName(category._id)"
                @apply="onCategoryNameChange"
              />
            </v-col>
            <v-col :id="`category-budget-${category._id}`" class="pa-0 my-1" v-if="!hideBudgeted">
              <category-grid-input
                class="category-budget-input"
                :id="`category-budget-input-${category._id}`"
                :data-testid="`category-budget-input-${category._id}`"
                :value="category.budgetDisplay"
                :is-editing="editedCategoryBudgetId == category._id"
                currency
                @edit="onEditCategoryBudget(category._id)"
                @apply="
                  (event) => {
                    onCategoryBudgetChanged({ category_id: category._id, event: event });
                  }
                "
                @enter="(event) => onCategoryBudgetEnter(category, event)"
              />
            </v-col>
            <v-col
              :data-testid="`category-spent-${category._id}`"
              align="right"
              class="pa-0 my-auto"
              v-if="!hideSpent"
            >
              {{ spentValue(category) }}
            </v-col>
            <v-col
              :data-testid="`category-balance-${category._id}`"
              align="right"
              :class="`pa-0 my-auto ${balanceColor(category)}`"
              v-if="!hideBalance"
            >
              {{ intlCurrency.format(category.balance / 100) }}
            </v-col>
          </v-row>
        </v-col>
        <category-hide v-if="!freeze" :masterCategory="masterCategory" :category="category" :hover="hover" />
        <v-sheet v-else width="20px" color="transparent" />
        <v-sheet width="20px" color="transparent" />
      </v-row>
    </v-hover>
  </div>
</template>


<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { NONE, INCOME } from "../../constants";

export default {
  props: {
    category: {
      type: Object,
      required: true,
    },
    freeze: {
      type: Boolean,
      default: false,
    },
    masterCategory: {
      type: Object,
      required: true,
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
    nameCols: {
      type: Number,
      default: 5,
    },
    isIncome: {
      type: Boolean,
      default: false,
    },
    // categoryColors: {
    //   type: Object,
    //   default: () => ({}),
    // },
    // editedCategoryBudgetId: {
    //   type: String,
    //   default: null,
    // },
  },
  computed: {
    ...mapGetters(["intlCurrency", "categoryColors", "categories"]),
    ...mapGetters("categoryMonth", [
      "editedCategoryBudgetId",
      // "editedCategoryNameId",
      "categoriesData",
    ]),
    negativeMultiplier() {
      return this.isIncome ? 1 : -1;
    },
  },
  methods: {
    ...mapMutations("categoryMonth", ["SET_EDITED_CATEGORY_BUDGET_ID"]),
    ...mapActions("categoryMonth", [
      // "onCategoryOrderChanged",
      "onCategoryNameChange",
      "onCategoryBudgetChanged",
      "onEditCategoryName",
      "onEditCategoryBudget",
      // "onHideCategory",
      // "onUnhideCategory",
      // "newCategory",
    ]),
    isEditingName(category_id) {
      if (category_id === NONE._id) {
        return false;
      } else {
        return category_id === this.editedCategoryNameId;
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
    balanceColor(category) {
      if (category.balance < 0) {
        return `error--text text--lighten-3`;
      } else if (category.balance > 0) {
        return `success--text text--lighten-3`;
      } else {
        return "";
      }
    },
    spentValue(category) {
      if (category.spent === 0) {
        return this.intlCurrency.format(0)
      } else {
        return this.intlCurrency.format(this.negativeMultiplier * category.spent / 100) 
      }
    },
  }
}
</script>