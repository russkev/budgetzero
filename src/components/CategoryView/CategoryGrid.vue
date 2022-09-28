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
      <v-expansion-panels flat multiple accordion v-model="masterCategoriesExpanded">
        <draggable v-model="masterCategoriesData" handle=".master-handle" style="width: inherit;">
          <v-expansion-panel
            v-for="(master_category, master_index) in masterCategoriesData"
            :key="master_category.id"
            class="master-category-row background lighten-1 ma-0 pa-0 my-1"
            style="box-shadow: none;"
          >
            <!-- <v-expansion-panel-header class="pa-0 ma-0" expand-icon="mdi-menu-down"> -->
              <master-category-row
                :name-cols="nameCols"
                :master-category="master_category"
                :master-index="master_index"
                @click.native.stop
              />
              <!-- <v-divider /> -->
            <!-- </v-expansion-panel-header> -->
            <v-expansion-panel-content class="pa-0 ma-0" color="transparent">
              <category-rows :masterCategory="master_category" :nameCols="nameCols" />
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
import { mapMutations, mapActions } from "vuex";
import { nextTick } from "vue";
import CategoryHeader from "./CategoryHeader.vue";
import CategoryMonthSelector from "./CategoryMonthSelector.vue";
import MasterCategoryRow from "./MasterCategoryRow.vue";
import CategoryRows from "./CategoryRows.vue";
import CategoryCard from "./CategoryCard.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { ID_LENGTH } from "../../constants";

export default {
  name: "CategoryGrid",
  components: {
    draggable,
    CategoryHeader,
    CategoryMonthSelector,
    MasterCategoryRow,
    CategoryRows,
    CategoryCard,
  },
  data() {
    return {
      nameCols: 5,
    };
  },
  computed: {
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
    masterCategoriesExpanded: {
      get() {
        return this.masterCategories.reduce((partial, master_category, index) => {
          if (master_category.collapsed === undefined || !master_category.collapsed) {
            partial.push(index);
          }
          return partial;
        }, []);
      },
      set(indices) {
        this.setMasterCategoriesExpanded(indices);
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
    ...mapActions(["setMasterCategoriesExpanded"]),
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
</script>

<style>
.v-expansion-panel {
  /* background-color: transparent !important; */
  border: none;
  box-shadow: none;
}

.v-expansion-panel-content__wrap {
  padding: 0 !important;
  padding-right: 24px !important;
}

.v-expansion-panel::before {
  box-shadow: none;
}

.master-category-row .v-expansion-panel-header {
  min-height: 0;
}

/*
.category-budgeted-input >>> input {
  text-align: right !important;
}
.budgeted-amount-neg >>> input {
} 
.budgeted-amount-pos >>> input {
  color: var(--v-primary-base);
}
.budgeted-amount-zero >>> input {
  color: grey;
}


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
.category-row {
  border-bottom: 1px solid rgb(182, 182, 182);
  height: 30px;
} 

.masterCategory-row {
  padding: 5px 0px 5px 5px;
} 

.uncategorized-row {
  border-top: 1px solid rgb(182, 182, 182);
  height: 50px;
}

.budget-input-col {
  margin-top: -1px;
  height: 30px;
}
*/
</style>
