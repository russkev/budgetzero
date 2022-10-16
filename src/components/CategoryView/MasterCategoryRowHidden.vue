<template>
  <header-row
    :drag-id="`drag-master-category-${masterHiddenCategory._id}`"
    :title-id="`master-category-name-${masterHiddenCategory._id}`"
    :budgeted-id="`master-category-budget-${masterHiddenCategory._id}`"
    :spent-id="`master-category-spent-${masterHiddenCategory._id}`"
    :balance-id="`master-category-balance-${masterHiddenCategory._id}`"
  >
    <template #title>
      <span class="text-h4 ml-3 secondary--text text--lighten-2">
        {{ masterHiddenCategory.name }}
      </span>
    </template>
    <template #budgeted>
      <div class="secondary--text text--lighten-2">
        <span class="text-h5">
          Budgeted
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(masterCategoriesStats[masterHiddenCategory._id].budget / 100) }}
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
          {{ intlCurrency.format(masterCategoriesStats[masterHiddenCategory._id].spent / 100) }}
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
          {{ intlCurrency.format(masterCategoriesStats[masterHiddenCategory._id].balance / 100) }}
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
        :data-testid="`btn-expand-${masterHiddenCategory._id}`"
        @click="toggleMasterCategoryCollapsed(masterHiddenCategory._id)"
      >
        <v-icon small>
          {{ masterHiddenCategory.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
        </v-icon>
      </v-btn>
    </template>
  </header-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import HeaderRow from "./HeaderRow.vue";

export default {
  components: {
    HeaderRow,
  },
  computed: {
    ...mapGetters(["intlCurrency", "masterHiddenCategory"]),
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
