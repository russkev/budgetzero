<template>
  <v-container class="pt-0">
    <category-month-selector />
    <v-row justify="space-between" class="ma-0 pt-2">
      <v-col sm="auto" />
      <v-col sm="auto">
        <category-header />
      </v-col>
    </v-row>
    <draggable v-model="masterCategoriesData" handle=".master-handle">
      <v-row
        class="master-category-row ma-0 pa-0"
        v-for="(master_category, master_index) in masterCategoriesData"
        :key="master_category.id"
      >
        <!-- <v-card class="ma-2 background lighten-1" elevation="0" width="100%"> -->
          <category-card width="100%">

            <master-category-row
            :name-cols="nameCols"
            :master-category="master_category"
            :master-index="master_index"
            />
            <!-- <v-divider/> -->
            <v-progress-linear value="100" height="2" />
            <category-rows :masterCategory="master_category" :nameCols="nameCols" />
          </category-card>
        <!-- </v-card> -->
      </v-row>
    </draggable>
    <!-- <v-card class="ma-2 background lighten-1" elevation="0" width="auto"> -->
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
    <!-- </v-card> -->
  </v-container>
</template>
<!-- <v-btn small tile text class="text-none mx-auto" color="primary">
    <v-icon small>mdi-plus</v-icon>
    New Group
  </v-btn> -->

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
    onNewMasterCategory() {
      // this.createMasterCategory({ name: 'Name', is_income: false, sort: index - 0.5 }).then((id) => {
      //     this.SET_EDITED_MASTER_CATEGORY_ID(id)
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
