<template>
  <v-container fluid class="pt-0">
    <v-sheet max-width="800px" justify="center" class="mx-auto pa-2" color="transparent">
      <v-row class="ma-0 pa-0" style="flex-wrap: nowrap; justify-content: space-between;">
        <v-col class="ma-0 mr-auto pa-0 mb-2" cols="auto">
          <category-month-selector />
        </v-col>
        <v-col class="ma-0 pa-0" cols="auto" style="flex: 0 1 250px;">
          <category-header />
        </v-col>
      </v-row>
      <uncategorized-row />

      <!-- INCOME -->
      <collapsed :master-category="masterIncomeCategory">
        <template #header>
          <master-category-row-income :name-cols="nameCols" />
        </template>
        <template #body>
          <category-rows
            :master-category="masterIncomeCategory"
            :name-cols="nameCols"
            hide-budgeted
            hide-balance
            is-income
            freeze-first-row
          />
        </template>
      </collapsed>

      <!-- STANDARD -->
      <draggable
        v-model="draggableMasterCategories"
        handle=".master-handle"
        style="width: inherit;"
        :move="checkMove"
        :group="{ name: 'master-categories' }"
      >
        <collapsed
          v-for="(master_category, master_index) in draggableMasterCategories"
          :key="master_index"
          :master-category="master_category"
          class="master-categories"
        >
          <template #header>
            <master-category-row-standard
              :name-cols="nameCols"
              :master-category="master_category"
              :master-index="master_index"
            />
          </template>
          <template #body>
            <category-rows :masterCategory="master_category" :nameCols="nameCols" />
          </template>
        </collapsed>
      </draggable>

      <!-- HIDDEN -->
      <collapsed :master-category="masterHiddenCategory">
        <template #header>
          <master-category-row-hidden />
        </template>
        <template #body>
          <category-rows :masterCategory="masterHiddenCategory" :nameCols="nameCols" />
        </template>
      </collapsed>

      <category-card>
        <v-row class="ma-0 pa-0">
          <v-col class="pa-0 ma-0" align="center">
            <v-btn
              tile
              text
              class="text-none my-2"
              :data-testid="`btn-new-master-category`"
              @click="onNewMasterCategory()"
            >
              <v-icon color="primary" class="mr-2">
                mdi-plus
              </v-icon>
              New Group
            </v-btn>
          </v-col>
        </v-row>
      </category-card>
    </v-sheet>
  </v-container>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from "vuex";
import { nextTick } from "vue";
import CategoryHeader from "./CategoryHeader.vue";
import CategoryMonthSelector from "./CategoryMonthSelector.vue";
import MasterCategoryRowHidden from "./MasterCategoryRowHidden.vue";
import MasterCategoryRowStandard from "./MasterCategoryRowStandard.vue";
import MasterCategoryRowIncome from "./MasterCategoryRowIncome.vue";
import Collapsed from "./Collapsed.vue";
import CategoryRows from "./CategoryRows.vue";
import CategoryCard from "./CategoryCard.vue";
import UncategorizedRow from "./UncategorizedRow.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { ID_LENGTH, NONE, HIDDEN, INCOME } from "../../constants";

export default {
  name: "CategoryGrid",
  components: {
    draggable,
    CategoryHeader,
    CategoryMonthSelector,
    CategoryRows,
    CategoryCard,
    UncategorizedRow,
    MasterCategoryRowHidden,
    MasterCategoryRowStandard,
    MasterCategoryRowIncome,
    Collapsed,
  },
  data() {
    return {
      nameCols: 5,
      draggableMasterCategoriesData: [],
      counter: 0,
    };
  },
  watch: {
    masterCategories: {
      handler: function (value) {
        const masterCategories = value.filter((masterCategory) => {
          return ![HIDDEN._id, NONE._id, INCOME._id].includes(masterCategory._id);
        });
        this.draggableMasterCategoriesData = masterCategories.map((master_category) => {
          return {
            _id: master_category._id.slice(-ID_LENGTH.category),
            name: master_category.name,
            collapsed: master_category.collapsed,
            color: master_category.color,
          };
        });
      },
      deep: true,
    },
  },
  computed: {
    ...mapGetters(["masterHiddenCategory", "masterIncomeCategory", "masterCategoriesById"]),
    masterCategories: {
      get() {
        return this.$store.getters.masterCategories;
      },
      set(value) {
        this.$store.commit("REORDER_MASTER_CATEGORIES", value);
      },
    },
    draggableMasterCategories: {
      get() {
        return this.draggableMasterCategoriesData;
      },
      set(values) {
        console.log("VALUES", values);
        this.draggableMasterCategoriesData = values;
        this.counter += 1;
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
    ...mapMutations("categoryMonth", ["UPDATE_SELECTED_MONTH"]),
    ...mapActions("categoryMonth", ["reorderMasterCategories", "newMasterCategory"]),
    ...mapActions(["setMasterCategoriesCollapsed"]),
    onNewMasterCategory() {
      this.newMasterCategory().then((id) => {
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
    checkMove(event, originalEvent) {
      return originalEvent.target.classList.contains("master-categories"); 
    }
  },
};
</script>

<style>
.v-expansion-panel.master-category-row {
  border: none;
  box-shadow: none;
}

.v-expansion-panel.master-category-row:not(:first-child)::after {
  border: none;
}

.v-expansion-panel-content__wrap {
  padding: 0 !important;
}

.v-expansion-panel::before {
  box-shadow: none;
}

.master-category-row .v-expansion-panel-header {
  min-height: 0;
}

.category-card {
  border-radius: 4px;
}
</style>
