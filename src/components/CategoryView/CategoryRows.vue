<template>
  <v-container class="pa-0 category-rows-container">
    <draggable
      class="categories-container"
      :data-testid="`categories-container-${masterCategory._id}`"
      :id="`categories-container-${masterCategory._id}`"
      :group="{ name: masterCategory._id, put: true }"
      @end="onCategoryOrderChanged"
      handle=".handle"
    >
      <div
        class="ma-0 pa-0"
        v-for="(category, index) in categoriesData[masterCategory._id]"
        :key="category._id"
      >
        <v-divider v-if="index == 0" />
        <v-hover v-slot="{ hover }">
          <v-row class="ma-0 pa-0 category-row">
            <v-sheet
              width="20px"
              color="transparent"
              class="row-side-widget"
              :data-testid="`drag-category-${category._id}`"
            >
              <v-icon v-if="hover" small class="handle ma-auto">
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
                <v-col :id="`category-budget-${category._id}`" class="pa-0 my-1">
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
                >
                  {{ intlCurrency.format(category.spent / 100) }}
                </v-col>
                <v-col
                  :data-testid="`category-balance-${category._id}`"
                  align="right"
                  :class="`pa-0 my-auto ${balanceColor(category)}`"
                >
                  {{ intlCurrency.format(category.balance / 100) }}
                </v-col>
              </v-row>
            </v-col>
            <category-hide :masterCategory="masterCategory" :category="category" :hover="hover"/>
            <v-sheet width="20px" color="transparent" />
          </v-row>
        </v-hover>
      </div>
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
          <v-icon small class="ma-1" color="primary">mdi-plus</v-icon>
          <span class="primary--text">
            New Category
          </span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import draggable from "vuedraggable";
import { nextTick } from "vue";
import { NONE, HIDDEN } from "../../constants";
import CategoryHide from "./CategoryHide.vue";

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
  },
  components: {
    draggable,
    CategoryHide,
  },
  computed: {
    ...mapGetters(["intlCurrency", "categories", "categoryColors"]),
    ...mapGetters("categoryMonth", [
      "editedCategoryBudgetId",
      "editedCategoryNameId",
      "categoriesData",
    ]),
  },
  methods: {
    ...mapMutations("categoryMonth", ["SET_EDITED_CATEGORY_BUDGET_ID"]),
    ...mapActions("categoryMonth", [
      "onCategoryOrderChanged",
      "onCategoryNameChange",
      "onCategoryBudgetChanged",
      "onEditCategoryName",
      "onEditCategoryBudget",
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
    isEditingName(category_id) {
      if (category_id === NONE._id) {
        return false;
      } else {
        return category_id === this.editedCategoryNameId;
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

  },
};
</script>

<style>
.color-swatch-container {
  display: flex;
  align-items: center;
}
</style>
