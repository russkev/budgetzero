<template>
  <v-container class="pt-0">
    <v-row class="ma-0">
      <v-btn data-testid="previous-month-button" small :to="{ path: `/budget/${prevMonth}` }">
        <v-icon medium>mdi-chevron-left</v-icon> Previous month
      </v-btn>
      <v-btn data-testid="today-month-button" :to="{ path: `/budget/${thisMonth}` }"> Today </v-btn>
      <v-btn data-testid="next-month-button" small :to="{ path: `/budget/${nextMonth}` }">
        <v-icon medium>mdi-chevron-right</v-icon> Next month
      </v-btn>
    </v-row>
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
    <draggable v-model="masterCategoriesData" handle=".handle">
      <v-row
        class="master-category-row ma-0 pa-0"
        v-for="(master_category, master_index) in masterCategoriesData"
        :key="master_category.id"
      >
        <v-container class="primary lighten-2">
          <v-row class="master-row white--text">
            <v-col :data-testid="`master-category-name-${master_category.id}`">
              <v-row>
                <v-col align-self="center" sm="1" class="mr-2">
                  <v-icon
                    class="handle"
                    :data-testid="`drag-master-category-${master_category.id}`"
                  >
                    mdi-drag-horizontal
                  </v-icon>
                </v-col>
                <v-col>
                  <category-grid-input
                    :id="`master-category-name-input-${master_category.id}`"
                    :data-testid="`master-category-name-input-${master_category.id}`"
                    :is-editing="editedMasterCategoryId == master_category.id"
                    :value="master_category.name"
                    @edit="onEditMasterCategoryName(master_category.id)"
                    @apply="onMasterCategoryNameChange"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col :data-testid="`master-category-budget-${master_category.id}`" align="right">
              {{ intlCurrency.format(masterCategoriesStats[master_category.id].budget / 100) }}
            </v-col>
            <v-col :data-testid="`master-category-spent-${master_category.id}`" align="right">
              {{ intlCurrency.format(masterCategoriesStats[master_category.id].spent / 100) }}
            </v-col>
            <v-col :data-testid="`master-category-balance-${master_category.id}`" align="right">
              {{ intlCurrency.format(masterCategoriesStats[master_category.id].balance / 100) }}
              <v-icon
                dark
                small
                right
                :data-testid="`btn-new-master-category-${master_category.id}`"
                @click="onNewMasterCategory(master_index)"
              >
                mdi-plus-circle-outline
              </v-icon>
              <v-icon
                dark
                small
                right
                :data-testid="`btn-delete-master-category-${master_category.id}`"
                @click="deleteMasterCategory(master_category)"
              >
                mdi-delete-circle-outline
              </v-icon>
              <v-icon
                dark
                small
                right
                :data-testid="`btn-new-category-${master_category.id}`"
                @click="onNewCategory(master_category)"
              >
                mdi-note-plus-outline
              </v-icon>
            </v-col>
          </v-row>
        </v-container>
        <v-container>
          <draggable
            class="categories-container"
            :data-testid="`categories-container-${master_category.id}`"
            :id="`categories-container-${master_category.id}`"
            :group="{ name: master_category.id, put: true }"
            @end="onCategoryOrderChanged"
            handle=".handle"
          >
            <v-row
              class="category-row"
              v-for="category in categoriesData[master_category.id]"
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
                  @apply="(event) => {
                    onCategoryBudgetChanged({ category_id: category.id, event: event })
                  }"
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
      </v-row>
    </draggable>
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import BaseDialogModalComponent from "../Modals/BaseDialogModalComponent.vue";
import CategoryHeader from "./CategoryHeader.vue";
import CategoryGridInput from "./CategoryGridInput.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { nextTick } from "vue";
import { ID_LENGTH } from "../../constants";

export default {
  name: "CategoryGrid",
  components: {
    draggable,
    BaseDialogModalComponent,
    CategoryHeader,
    CategoryGridInput,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["intlCurrency", "categories"]),
    ...mapGetters("categoryMonth", [
      "editedMasterCategoryId",
      "editedCategoryBudgetId",
      "editedCategoryNameId",
      "prevMonth",
      "nextMonth",
      "thisMonth",
      "categoriesData",
      "masterCategoriesStats",
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
      "onMasterCategoryNameChange",
      "onMasterCategoryNameChange",
      "categoryIdFromIndex",
      "deleteMasterCategory",
      "onCategoryNameChange",
      "onHideCategory",
      "onCategoryOrderChanged",
      "onEditMasterCategoryName",
      "onEditCategoryName",
      "newMasterCategory",
      "newCategory",
      "onEditCategoryBudget",
    ]),
    onCategoryBudgetEnter(category, event) {
      this.onCategoryBudgetChanged({ category_id: category.id, event: event });
      const next_id = this.categoryIdFromIndex(category.index + 1);
      document.activeElement.blur();
      if (next_id !== undefined) {
        this.SET_EDITED_CATEGORY_BUDGET_ID(next_id);
        const element_id = `category-budget-input-${next_id}`;
        const element = document.getElementById(element_id)
        element.focus()
        nextTick().then(() => {
          element.select()
        })
      }
    },
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
    onNewMasterCategory(index) {
      // this.createMasterCategory({ name: 'Name', is_income: false, sort: index - 0.5 }).then((id) => {
      //     this.SET_EDITED_MASTER_CATEGORY_ID(id)
      this.newMasterCategory(index).then((id) => {
        const element_id = `master-category-name-input-${id}`;

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
    onSelectTarget(event) {
      // SAVE
      if (event.target) {
        event.target.select();
      }
    },
    lg(msg) {
      console.log(msg)
    }
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
