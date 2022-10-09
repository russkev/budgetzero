<template>
  <header-row
    :drag-id="`drag-master-category-${masterCategory.id}`"
    :title-id="`master-category-name-${masterCategory.id}`"
    :budgeted-id="`master-category-budget-${masterCategory.id}`"
    :spent-id="`master-category-spent-${masterCategory.id}`"
    :balance-id="`master-category-balance-${masterCategory.id}`"
  >
    <template #title>
      <span class="text-h4 ml-3 secondary--text text--lighten-2">
        {{ masterCategory.name }}
      </span>
    </template>
    <template #budgeted>
      <div class="secondary--text text--lighten-2">
        <span class="text-h5">
          Budgeted
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].budget / 100) }}
        </span>
      </div>
    </template>
    <template #spent>
      <div class="secondary--text text--lighten-2">
        <span class="text-h5">
          Spent
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].spent / 100) }}
        </span>
      </div>
    </template>
    <template #balance>
      <div class="secondary--text text--lighten-2">
        <span class="text-h5">
          Balance
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].balance / 100) }}
        </span>
      </div>
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
        :data-testid="`btn-expand-${masterCategory.id}`"
        @click="toggleMasterCategoryCollapsed(masterCategory.id)"
      >
        <v-icon small>
          {{ masterCategory.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
        </v-icon>
      </v-btn>
    </template>
  </header-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import HeaderRow from "./HeaderRow.vue";

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
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    ...mapGetters("categoryMonth", ["editedMasterCategoryId", "masterCategoriesStats"]),
    data() {
      return "data";
    },
  },
  methods: {
    ...mapActions(["toggleMasterCategoryCollapsed"]),
    ...mapActions("categoryMonth", [
      "onDeleteMasterCategory",
      "onMasterCategoryNameChange",
      "onEditMasterCategoryName",
      "newMasterCategory",
      "newCategory",
    ]),
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
