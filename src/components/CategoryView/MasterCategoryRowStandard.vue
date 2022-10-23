<template>
  <header-row
    :drag-id="`drag-master-category-${masterCategory._id}`"
    :title-id="`master-category-name-${masterCategory._id}`"
    :budgeted-id="`master-category-budget-${masterCategory._id}`"
    :spent-id="`master-category-spent-${masterCategory._id}`"
    :balance-id="`master-category-balance-${masterCategory._id}`"
  >
    <template #drag="{hover}">
      <v-icon v-if="hover" small class="master-handle ma-auto">
        mdi-drag-vertical
      </v-icon>
    </template>
    <template #color>
      <master-category-color :color="masterCategoryColor" @updated="onColorChange" />
    </template>
    <template #title>
      <category-grid-input
        background-color="background lighten-1"
        :id="`master-category-name-input-${masterCategory._id}`"
        :data-testid="`master-category-name-input-${masterCategory._id}`"
        :is-editing="editedMasterCategoryId == masterCategory._id"
        :value="masterCategory.name"
        @edit="onEditMasterCategoryName(masterCategory._id)"
        @apply="onMasterCategoryNameChange"
        text="h4"
      />
    </template>
    <template #budgeted>
      <span class="text-h5">
        Budgeted
      </span>
      <br />
      <span class="text-body-1">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory._id].budget / 100) }}
      </span>
    </template>
    <template #spent>
      <span class="text-h5">
        Spent
      </span>
      <br />
      <span class="text-body-1">
        {{ spentValue }}
      </span>
    </template>
    <template #balance>
      <span class="text-h5">
        Balance
      </span>
      <br />
      <span :class="`text-body-1 ${balanceColor}`">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory._id].balance / 100) }}
      </span>
    </template>
    <template #delete="{hover}">
      <master-category-delete :hover="hover" :master-category="masterCategory" />
    </template>
    <template #collapse>
      <v-btn
        tile
        elevation="0"
        small
        class="pa-0 ma-0"
        min-width="20px"
        height="auto"
        color="transparent"
        :data-testid="`btn-expand-${masterCategory._id}`"
        @click="toggleMasterCategoryCollapsed(masterCategory._id)"
      >
        <v-icon small>
          {{ masterCategory.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
        </v-icon>
      </v-btn>
    </template>
  </header-row>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import HeaderRow from "./HeaderRow.vue";
import MasterCategoryColor from "./MasterCategoryColor.vue";
import MasterCategoryDelete from "./MasterCategoryDelete.vue";
import { NONE } from "../../constants"
import _ from "lodash";

export default {
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    masterIndex: {
      type: Number,
      default: 0,
    },
    nameCols: {
      type: Number,
      default: 5,
    },
  },
  components: {
    HeaderRow,
    MasterCategoryColor,
    MasterCategoryDelete,
  },
  data() {
    return {
      selectedColor: { hex: "#FF0000" },
      colorIsOpen: false,
    };
  },
  computed: {
    ...mapGetters(["intlCurrency", "colorSwatches", "masterCategoriesById", "masterCategories", "categoryColors"]),
    ...mapGetters("categoryMonth", ["editedMasterCategoryId", "masterCategoriesStats"]),
    data() {
      return "data";
    },

    masterCategoryDoc() {
      return this.masterCategoriesById[this.masterCategory._id];
    },
    masterCategoryColor() {
      return _.get(this, ['masterCategory', 'color', 'hex'], NONE.hexColor)
    },
    balanceColor() {
      const balance = this.masterCategoriesStats[this.masterCategory._id].balance;
      if (balance < 0) {
        return `error--text text--lighten-3`;
      } else if (balance > 0) {
        return `success--text text--lighten-3`;
      } else {
        return "";
      }
    },
    spentValue() {
      const value =
        // this.masterCategoriesStats[this.masterCategory._id].expense -
        // this.masterCategoriesStats[this.masterCategory._id].income;

        _.get(this.masterCategoriesStats, [this.masterCategory._id, "expense"], 0)
        - _.get(this.masterCategoriesStats, [this.masterCategory._id, "income"], 0);
      if (value === 0) {
        return this.intlCurrency.format(0);
      } else {
        return this.intlCurrency.format(value / 100);
      }
    },
  },
  methods: {
    ...mapMutations(["SET_MASTER_CATEGORY_COLOR"]),
    ...mapActions(["toggleMasterCategoryCollapsed", "updateMasterColor"]),
    ...mapActions("categoryMonth", [
      "onDeleteMasterCategory",
      "onMasterCategoryNameChange",
      "onEditMasterCategoryName",
      "newMasterCategory",
      "newCategory",
    ]),
    onColorChange(color) {
      this.updateMasterColor({ masterId: this.masterCategory._id, colorObject: color });
    },
  },
};
</script>

<style>
.master-handle,
.handle {
  cursor: move;
}
.row-side-widget {
  display: flex;
}

.delete-button {
  transition: background-color 0.3s;
}
</style>
