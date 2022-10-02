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
      <v-expansion-panels data-testid="all-categories-container" flat multiple accordion v-model="masterCategoriesExpanded">
        <draggable v-model="masterCategoriesData" handle=".master-handle" style="width: inherit;">

          <!-- STANDARD -->
          <v-expansion-panel
            v-for="(master_category, master_index) in masterCategoriesData"
            :key="master_index"
            class="master-category-row category-card background lighten-1 rounded-1 ma-0 pa-0 mb-2"
            style="box-shadow: none;"
          >
            <master-category-row-standard
              :name-cols="nameCols"
              :master-category="master_category"
              :master-index="master_index"
            />
            <v-expansion-panel-content class="pa-0 ma-0" color="transparent">
              <category-rows :masterCategory="master_category" :nameCols="nameCols" />
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- HIDDEN -->
          <v-expansion-panel
            slot="footer"
            :key="masterCategoriesData.length"
            class="master-category-row category-card background lighten-1 ma-0 pa-0 mb-2"
            style="box-shadow: none;"
          >
            <master-category-row-hidden
              :name-cols="nameCols"
              :master-category="hiddenMasterData"
              :master-index="masterCategoriesData.length"
            />
            <v-expansion-panel-content class="pa-0 ma-0" color="transparent">
              <category-rows :masterCategory="hiddenMasterData" :nameCols="nameCols" />
            </v-expansion-panel-content>
          </v-expansion-panel>

        </draggable>
      </v-expansion-panels>
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
import CategoryRows from "./CategoryRows.vue";
import CategoryCard from "./CategoryCard.vue";
import UncategorizedRow from "./UncategorizedRow.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { ID_LENGTH, NONE, HIDDEN } from "../../constants";

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
  },
  data() {
    return {
      nameCols: 5,
    };
  },
  computed: {
    ...mapGetters(["masterHiddenCategory"]),
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
        const masterCategories = this.masterCategories.filter((masterCategory) => {
          // return masterCategory._id !== NONE._id;
          return ![HIDDEN._id, NONE._id].includes(masterCategory._id);
        });
        return masterCategories.map((master_category) => {
          return {
            id: master_category._id.slice(-ID_LENGTH.category),
            name: master_category.name,
            collapsed: master_category.collapsed,
          };
        });
      },
      set(values) {
        this.$store.dispatch("reorderMasterCategories", values);
      },
    },
    masterCategoriesExpanded: {
      get() {
        const data = this.masterCategoriesData.concat(this.hiddenMasterData);
        const expanded = data.reduce((partial, master_category, index) => {
          if (master_category.collapsed === undefined || !master_category.collapsed) {
            // partial.push(index + 1);
            partial.push(index);
          }
          return partial;
        }, []);
        return expanded;
      },
      set(indices) {
        console.log("main expanded", indices);
        this.setMasterCategoriesCollapsed(indices);
      },
    },
    hiddenMasterData() {
      return {
          id: this.masterHiddenCategory._id,
          name: this.masterHiddenCategory.name,
          collapsed: this.masterHiddenCategory.collapsed,
        }
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
  },
};

export function deleteIconColor(hover, deleteButtonHover) {
  if (hover) {
    if (deleteButtonHover) {
      return "delete_text";
    } else {
      return "white";
    }
  } else {
    return "transparent";
  }
}

export function unhideIconColor(hover, unhideButtonHover) {
  if (hover) {
    if (unhideButtonHover) {
      return "unhide_text";
    } else {
      return "white";
    }
  } else {
    return "transparent";
  }
}
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
