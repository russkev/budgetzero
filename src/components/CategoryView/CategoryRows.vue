<template>
  <!-- <fragment> -->
            <v-container>
          <draggable
            class="categories-container"
            :data-testid="`categories-container-${masterCategory.id}`"
            :id="`categories-container-${masterCategory.id}`"
            :group="{ name: masterCategory.id, put: true }"
            @end="onCategoryOrderChanged"
            handle=".handle"
          >
    <v-row
      class="category-row"
      v-for="category in categoriesData[masterCategory.id]"
      :key="category.id"
    >
      <v-col :data-testid="`category-name-${category.id}`">
        <v-row>
          <v-col align-self="center" sm="1" class="mr-2">
            <v-icon class="handle" :data-testid="`drag-category-${category.id}`">
              mdi-drag-horizontal
            </v-icon>
          </v-col>
          <v-col>
            <category-grid-input
              class="category-name-input"
              :id="`category-name-input-${category.id}`"
              :data-testid="`category-name-input-${category.id}`"
              :is-editing="editedCategoryNameId == category.id"
              :value="category.name"
              @edit="onEditCategoryName(category.id)"
              @apply="onCategoryNameChange"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col :id="`category-budget-${category.id}`">
        <category-grid-input
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
      <v-col :data-testid="`category-spent-${category.id}`" align="right">
        {{ intlCurrency.format(category.spent / 100) }}
      </v-col>
      <v-col :data-testid="`category-balance-${category.id}`" align="right">
        {{ intlCurrency.format(category.balance / 100) }}
        <v-icon
          small
          right
          :data-testid="`btn-hide-category-${category.id}`"
          @click="onHideCategory(category.id)"
        >
          mdi-eye-off-outline
        </v-icon>
      </v-col>
    </v-row>
    </draggable>
    </v-container>
  <!-- </fragment> -->
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import draggable from "vuedraggable";
import { nextTick } from "vue";

export default {
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    categoriesForMaster: {
      type: Array,
    }
  },
    components: {
    draggable,
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
    ...mapMutations("categoryMonth", [
      "SET_EDITED_CATEGORY_BUDGET_ID",
    ]),
    ...mapActions("categoryMonth", [
      "onCategoryOrderChanged",
      "onCategoryNameChange",
      "onCategoryBudgetChanged",
      "onEditCategoryName",
      "onEditCategoryBudget",
      "onHideCategory",
    ]),
    onCategoryBudgetEnter(category, event) {
      this.onCategoryBudgetChanged({ category_id: category.id, event: event });
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
  },
};
</script>
