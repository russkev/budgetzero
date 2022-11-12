<template>
    <div id="categories-list-container">
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
    </div>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from "vuex";
import { nextTick } from "vue";
import CategoriesHeader from "./CategoriesHeader.vue";
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
  name: "CategoriesList",
  components: {
    draggable,
    CategoriesHeader,
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
      handler: function (masterCategories) {
        this.updateDraggableMasterCategories(masterCategories);
      },
      deep: true,
    },
  },
  created() {
    this.updateDraggableMasterCategories(this.masterCategories);
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
        this.draggableMasterCategoriesData = values;
        this.counter += 1;
        this.$store.dispatch("reorderMasterCategories", values);
      },
    },
  },
  methods: {
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
    updateDraggableMasterCategories(masterCategories) {
      const masterCategoriesComplete = masterCategories.filter((masterCategory) => {
        return ![HIDDEN._id, NONE._id, INCOME._id].includes(masterCategory._id);
      });
      this.draggableMasterCategoriesData = masterCategoriesComplete.map((master_category) => {
        return {
          _id: master_category._id.slice(-ID_LENGTH.category),
          name: master_category.name,
          collapsed: master_category.collapsed,
          color: master_category.color,
          sort: master_category.sort,
        };
      });
    },
    checkMove(event, originalEvent) {
      return originalEvent.target.classList.contains("master-categories");
    },
  },
};
</script>

<style>
.v-expansion-panel-content__wrap {
  padding: 0 !important;
}

.v-expansion-panel::before {
  box-shadow: none;
}

.category-card {
  border-radius: 4px;
}



#categories-list-container {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
