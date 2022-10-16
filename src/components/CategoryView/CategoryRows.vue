<template>
  <v-container class="pa-0 category-rows-container">
    <v-divider/>
    <category-row 
      v-if="freezeFirstRow && frozenCategory"
      :category="frozenCategory"
      :master-category="masterCategory"
      freeze
      :hideBudgeted="hideBudgeted"
      :hideSpent="hideSpent"
      :hideBalance="hideBalance"
      :isIncome="isIncome"
    />
    <draggable
      class="categories-container"
      :data-testid="`categories-container-${masterCategory._id}`"
      :id="`categories-container-${masterCategory._id}`"
      :group="{ name: masterCategory._id, put: true }"
      @end="onCategoryOrderChanged"
      handle=".handle"
    >
      <category-row 
        v-for="(category, index) in draggableCategories" 
        :key="index"
        :category="category"
        :master-category="masterCategory"
        :hideBudgeted="hideBudgeted"
        :hideSpent="hideSpent"
        :hideBalance="hideBalance"
        :isIncome="isIncome"
      /> 
    </draggable>
    <v-row class="ma-0 pa-0">
      <v-sheet width="20px" color="transparent" class="row-side-widget" />
      <v-col class="ma-0 pa-0">
        <v-btn
          small
          tile
          text
          class="text-none"
          :data-testid="`btn-new-category-${masterCategory._id}`"
          @click="onNewCategory(masterCategory)"
        >
          <v-icon small class="ma-1" color="secondary lighten-3">mdi-plus</v-icon>
          <span class="secondary--text text--lighten-3">
            New Category
          </span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import draggable from "vuedraggable";
import { nextTick } from "vue";
import CategoryHide from "./CategoryHide.vue";

export default {
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    nameCols: {
      type: Number,
      default: 5,
    },
    hideBudgeted: {
      type: Boolean,
      default: false,
    },
    hideSpent: {
      type: Boolean,
      default: false,
    },
    hideBalance: {
      type: Boolean,
      default: false,
    },
    isIncome: {
      type: Boolean,
      default: false,
    },
    freezeFirstRow: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    draggable,
    CategoryHide,
  },
  computed: {
    ...mapGetters(["categories"]),
    ...mapGetters("categoryMonth", [
      "editedCategoryBudgetId",
      "editedCategoryNameId",
      "categoriesData",
    ]),
    draggableCategories() {
      if (!this.freezeFirstRow) {
        return this.categoriesData[this.masterCategory._id]
      } else {
        return this.categoriesData[this.masterCategory._id].slice(1)
      }
    },
    frozenCategory() {
      if (this.freezeFirstRow && this.categoriesData[this.masterCategory._id].length > 0) {
        return this.categoriesData[this.masterCategory._id][0]
      } else {
        return null
      }
    }
  },
  methods: {
    ...mapActions("categoryMonth", [
      "onCategoryOrderChanged",
      "newCategory",
    ]),
    onNewCategory(master_category) {
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
  },
};
</script>

<style>
.color-swatch-container {
  display: flex;
  align-items: center;
}
</style>
