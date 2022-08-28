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
        <BudgetHeader />
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
            <v-col :data-testid="`master-category-name-${master_category.id}`" v-if="editedMasterCategoryId==master_category.id">
              <v-text-field
                :data-testid="`master-category-name-input-${master_category.id}`"
                :value="master_category.name"
                hide-details
                dark
                dense
                flat
                solo
                @blur="onMasterCategoryNameChange(master_category.name)"
                @change="onMasterCategoryNameChange(master_category.name)"
                background-color="primary"
              >
                <template v-slot:prepend>
                  <v-icon class="handle" :id="`drag-master-category-${master_category.id}`">
                    mdi-drag-horizontal
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col :data-testid="`master-category-name-${master_category.id}`" v-else>
              <v-text-field
                :data-testid="`master-category-name-input-${master_category.id}`"
                :value="master_category.name"
                @click="editedMasterCategoryId = master_category.id"
                @focus="editedMasterCategoryId = master_category.id"
                dark
                dense
                flat
                solo
                hide-details
                readonly
                background-color="primary lighten-2"
              >
                <template v-slot:prepend>
                  <v-icon class="handle" :id="`drag-master-category-${master_category.id}`">
                    mdi-drag-horizontal
                  </v-icon>
                </template>
              </v-text-field>
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
                @click="newMasterCategory(master_index)"
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
                @click="newCategory(master_category)"
              >
                mdi-note-plus-outline
              </v-icon>
            </v-col>
          </v-row>
        </v-container>
        <v-container>
          <draggable
            :class="master_category.id"
            :group="{ name: master_category.id, put: true }"
            @end="onCategoryOrderChanged"
            handle=".handle"
          >
            <v-row
              class="category-row"
              v-for="category in categoriesData[master_category.id]"
              :key="category.id"
            >
              <v-col :data-testid="`category-name-${category.id}`" v-if="editedCategoryNameId==category.id">
                <v-text-field
                  :data-testid="`category-name-input-${category.id}`"
                  :value="category.name"
                  hide-details
                  dense
                  flat
                  solo
                  @blur="onCategoryNameChange(category.name)"
                  @change="onCategoryNameChange(category.name)"
                  background-color="grey lighten-3"
                >
                  <template v-slot:prepend>
                    <v-icon class="handle" :data-testid="`drag-category-${category.id}`">
                      mdi-drag-horizontal
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col :data-testid="`category-name-${category.id}`" v-else>
                <v-text-field
                  :data-testid="`category-name-input-${category.id}`"
                  @click="editedCategoryNameId = category.id"
                  @focus="editedCategoryNameId = category.id"
                  :value="category.name"
                  readonly
                  hide-details
                  dense
                  flat
                  solo
                >
                  <template v-slot:prepend>
                    <v-icon class="handle" :data-testid="`drag-category-${category.id}`">
                      mdi-drag-horizontal
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col :id="`category-budget-${category.id}`" v-if="editedCategoryBudgetId==category.id">
                <v-text-field
                  class="category-budget-input"
                  :id="`category-budget-input-${category.id}`"
                  :data-testid="`category-budget-input-${category.id}`"
                  :ref="`category-budget-input-${category.id}`"
                  :value="category.budgetDisplay"
                  hide-details
                  dense
                  flat
                  solo
                  reverse
                  @click="$event.target.select()"
                  @change="onCategoryBudgetChanged(category.id, $event)"
                  @blur="onCategoryBudgetChanged(category.id, $event)"
                  @keyup.enter="onCategoryBudgetEnter(category, $event)"
                  background-color="grey lighten-3"
                  suffix="$"
                />
              </v-col>
              <v-col v-else>
                <v-text-field
                  class="category-budget-input"
                  :data-testid="`category-budget-input-${category.id}`"
                  :id="`category-budget-input-${category.id}`"
                  :ref="`category-budget-input-${category.id}`"
                  @click="editedCategoryBudgetId = category.id"
                  @focus="editedCategoryBudgetId = category.id"
                  :value="intlCurrency.format(category.budgetDisplay)"
                  readonly
                  hide-details
                  dense
                  flat
                  solo
                  reverse
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
import { mapGetters, mapActions } from "vuex";
import BaseDialogModalComponent from "../Modals/BaseDialogModalComponent.vue";
import BudgetHeader from "./BudgetHeader.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { DEFAULT_MONTH_CATEGORY, ID_LENGTH, ID_NAME, NONE } from "../../constants";
import { prevMonth, nextMonth } from "../../helper";
import { getCarryover } from "@/store/modules/category-module";
import moment from "moment";
import { nextTick } from "vue";

export default {
  name: "BudgetGrid",
  components: {
    draggable,
    BaseDialogModalComponent,
    BudgetHeader,
  },
  data() {
    return {
      ID_LENGTH,
      intlCurrency: new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }),
      isReorderingCategories: false,
      category_name: "",
      isModalVisibleMasterCat: false,
      isModalVisibleCategory: false,
      isModalVisibleEditCategory: false,
      isModalVisibleCreateSubCategory: false,
      masterCategoryId: "",
      editedMasterCategoryId: "",
      editedCategoryNameId: "",
      editedCategoryBudgetId: "",
      editedCategoryBudgetValue: "",
      editedCategory: {},
      isEditing: true,
      // selectedMonth: this.$store.selectedMonth,
      headers: [
        {
          text: "Category name",
          align: "left",
          value: "name",
        },
        // { text: "Category", value: "id" },
        { text: "Budgeted", value: "budgeted", width: "25px" },
        { text: "Spent", value: "spent", width: "25px" },
        { text: "Balance", value: "balance", width: "25px" },
        // { text: "masterCategory", value: "masterCategory" }
      ],
    };
  },
  computed: {
    ...mapGetters([
      "selectedBudgetId",
      "categoriesById",
      "masterCategories",
      "masterCategoriesById",
      "allCategoryBalances",
      "selectedMonth",
      "monthsInUse",
      "categoriesByMaster",
      "categories"
    ]),
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
    masterCategoriesStats() {
      return Object.entries(this.categoriesData).reduce((partial, [master_id, category_docs]) => {
        partial[master_id] = category_docs.reduce(
          (sum_partial, category) => {
            sum_partial.budget += category.budget;
            sum_partial.spent += category.spent;
            sum_partial.balance += category.balance;
            return sum_partial;
          },
          { budget: 0, spent: 0, carryover: 0, balance: 0 }
        );
        return partial;
      }, {});
    },
    categoriesData() {
      let index = 0
      return this.masterCategories.reduce((partial, master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category);

        if (!Array.isArray(this.categoriesByMaster[master_id])) {
          return partial;
        }

        partial[master_id] = this.categoriesByMaster[master_id]
          .sort((a, b) => a.sort - b.sort)
          .map((category) => {
            const category_id = category._id.slice(-ID_LENGTH.category);
            const budget = _.get(
              this.allCategoryBalances,
              [this.selectedMonth, master_id, category_id, "doc", "budget"],
              0
            );
            const spent = _.get(
              this.allCategoryBalances,
              [this.selectedMonth, master_id, category_id, "spent"],
              0
            );
            const carryover = getCarryover(
              this.allCategoryBalances,
              this.selectedMonth,
              master_id,
              category_id
            );
            const name = _.get(this.categoriesById, [category_id, "name"], "");
            const budget_display = (budget / 100).toFixed(2);
            const result = {
              id: category_id,
              name: name,
              budget: budget,
              budgetDisplay: budget_display,
              spent: spent,
              carryover: carryover,
              balance: budget + spent + carryover,
              index: index,
            };
            index += 1;
            return result
          });
        return partial;
      }, {});
    },
    // categoryIdsSorted() {
    //   return this.masterCategories.reduce((partial, master_category) => {
    //     const master_id = master_category._id.slice(-ID_LENGTH.category)

    //   }, [])
    // },
    prevMonth() {
      return prevMonth(this.selectedMonth);
    },
    nextMonth() {
      return nextMonth(this.selectedMonth);
    },
    thisMonth() {
      return moment(new Date()).format("YYYY-MM");
    },
  },
  mounted() {
    this.$store.commit("UPDATE_SELECTED_MONTH", this.$route.params.month);
  },
  beforeRouteUpdate(to, from, next) {
    this.$store.commit("UPDATE_SELECTED_MONTH", to.params.month);
    next();
  },
  methods: {
    ...mapActions(["updateMonthCategory", "deleteDocFromPouch", "deleteMasterCategory"]),

    onCategoryBudgetChanged(category_id, event) {
      if (!event.target) {
        return;
      }
      const target_value = event.target.value;

      const month = this.selectedMonth;
      const master_id = _.get(this.categoriesById, [category_id, "masterCategory"], "");

      if (master_id === "") {
        return;
      }

      let budget_value = parseInt(parseFloat(target_value) * 100);
      let current = null;
      if (isNaN(budget_value)) {
        console.warn("Budget value is NaN");
        return;
      }

      const previous = _.get(
        this.allCategoryBalances,
        [this.selectedMonth, master_id, category_id, "doc"],
        null
      );

      if (previous === null) {
        current = {
          ...DEFAULT_MONTH_CATEGORY,
          _id: `b_${this.selectedBudgetId}${ID_NAME.monthCategory}${month}_${category_id}`,
          budget: budget_value,
        };
      } else {
        current = {
          ...previous,
          budget: budget_value,
        };
      }
      this.$store.dispatch("updateMonthCategory", { current, previous });
      this.editedCategoryBudgetId = ''
    },
    onCategoryBudgetEnter(category, event) {
      this.onCategoryBudgetChanged(category.id, event)
      const next_id = this.categoryIdFromIndex(category.index + 1)
      document.activeElement.blur()
      if (next_id !== undefined) {
        this.editedCategoryBudgetId = this.categoryIdFromIndex(category.index + 1)
        const element_id = `category-budget-input-${next_id}`
        this.$refs[element_id][0].focus()
        nextTick().then(() => document.getElementById(element_id).select())
      }
    },
    onMasterCategoryNameChange(name) {
      const doc = this.masterCategoriesById[this.editedMasterCategoryId];
      this.editedMasterCategoryId = "";
      if (doc !== undefined) {
        this.$store.dispatch("commitDocToPouchAndVuex", {
          current: { ...doc, name: name },
          previous: doc,
        });
      }
    },
    categoryIdFromIndex(index) {
      if (index >= this.categories.length) {
        return undefined
      }
      for(let categories_from_master of Object.values(this.categoriesData)) {
        for(let category_data of categories_from_master) {
          if (category_data.index === index) {
            return category_data.id
          }
        }
      }
      return undefined
    },
    newMasterCategory(index) {
      this.$store.dispatch("createMasterCategory", { name: "", is_income: false, sort: index });
    },
    deleteMasterCategory(master_category) {
      this.$store.dispatch("deleteMasterCategory", master_category.id);
    },
    newCategory(master_category) {
      this.$store
        .dispatch("createCategory", { name: "", master_id: master_category.id })
        .then((id) => {
          this.editedCategoryNameId = id;
          // this.getCategoriesData()
        });
    },
    onSelectTarget(event) {
      if (event.target) {
        event.target.select()
      }
    },

    onCategoryNameChange(name) {
      const doc = this.categoriesById[this.editedCategoryNameId];
      this.editedCategoryNameId = "";
      if (doc !== undefined) {
        this.$store.dispatch("commitDocToPouchAndVuex", {
          current: { ...doc, name: name },
          previous: doc,
        });
      }
    },
    onHideCategory(category_id) {
      const doc = this.categoriesById[category_id];
      if (doc !== undefined) {
        this.$store.dispatch("commitDocToPouchAndVuex", {
          current: { ...doc, masterCategory: NONE._id },
          previous: doc,
        });
      }
    },
    onCategoryOrderChanged(event) {
      this.$store.dispatch("reorderCategory", event);
    },
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
