<template>
  <v-container class="pa-0 category-rows-container">
    <draggable
      class="categories-container"
      :data-testid="`categories-container-${masterCategory.id}`"
      :id="`categories-container-${masterCategory.id}`"
      :group="{ name: masterCategory.id, put: true }"
      @end="onCategoryOrderChanged"
      handle=".handle"
    >
      <div
        class="ma-0 pa-0"
        v-for="category in categoriesData[masterCategory.id]"
        :key="category.id"
      >
        <v-hover v-slot="{ hover }">
          <v-row class="ma-0 pa-0 category-row">
            <v-sheet
              width="20px"
              color="transparent"
              class="row-side-widget"
              :data-testid="`drag-category-${category.id}`"
            >
              <v-icon v-if="hover" small class="handle ma-auto">
                mdi-drag-vertical
              </v-icon>
            </v-sheet>
            <v-col class="pa-0 ma-0">
              <v-row class="ma-0 pa-0">
                <v-col
                  :cols="nameCols"
                  class="pa-0 ma-0 my-1"
                  :data-testid="`category-name-${category.id}`"
                >
                  <category-grid-input
                    :readonly="category.id === ':::'"
                    class="category-name-input"
                    :id="`category-name-input-${category.id}`"
                    :data-testid="`category-name-input-${category.id}`"
                    :is-editing="isEditingName(category.id)"
                    :value="category.name"
                    @edit="onEditCategoryName(category.id)"
                    @apply="onCategoryNameChange"
                  />
                </v-col>
                <v-col :id="`category-budget-${category.id}`" class="pa-0 my-1">
                  <category-grid-input
                    :readonly="category.id === ':::'"
                    class="category-budget-input"
                    :id="`category-budget-input-${category.id}`"
                    :data-testid="`category-budget-input-${category.id}`"
                    :value="category.budgetDisplay"
                    :is-editing="editedCategoryBudgetId == category.id"
                    currency
                    @edit="onEditCategoryBudget(category.id)"
                    @apply="
                      (event) => {
                        onCategoryBudgetChanged({ category_id: category.id, event: event });
                      }
                    "
                    @enter="(event) => onCategoryBudgetEnter(category, event)"
                  />
                </v-col>
                <v-col
                  :data-testid="`category-spent-${category.id}`"
                  align="right"
                  class="pa-0 my-auto"
                >
                  {{ intlCurrency.format(category.spent / 100) }}
                </v-col>
                <v-col
                  :data-testid="`category-balance-${category.id}`"
                  align="right"
                  class="pa-0 my-auto"
                >
                  {{ intlCurrency.format(category.balance / 100) }}
                </v-col>
              </v-row>
            </v-col>

            <button-hide-category v-if="isStandard()" :category="category" :hover="hover"/>
            <button-unhide-category v-else :category="category" :hover="hover"/>
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
          :data-testid="`btn-new-category-${masterCategory.id}`"
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
import ButtonHideCategory from "./ButtonHideCategory.vue";
import ButtonUnhideCategory from "./ButtonUnhideCategory.vue";
import { nextTick } from "vue";
import { NONE, HIDDEN } from "../../constants";

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
    ButtonHideCategory,
    ButtonUnhideCategory,
  },
  computed: {
    ...mapGetters(["intlCurrency", "categories"]),
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
      "newCategory",
    ]),
    onNewCategory(master_category) {
      // this.createCategory({ name: "Name", master_id: master_category.id }).then((id) => {
      //   this.SET_EDITED_CATEGORY_NAME_ID(id);
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
      // this.onCategoryBudgetChanged({ category_id: category.id, event: event });
      const next_id = this.categoryIdFromIndex(category.index + 1);
      document.activeElement.blur();
      if (next_id !== undefined) {
        this.SET_EDITED_CATEGORY_BUDGET_ID(next_id);
        const element_id = `category-budget-input-${next_id}`;
        const element = document.getElementById(element_id);
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
            return category_data.id;
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
    isStandard() {
      return !([HIDDEN._id, NONE._id].includes(this.masterCategory.id));
    },

  },
};
</script>