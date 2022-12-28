<template>
  <div>
    <category-grid-input
      class="category-budget-input"
      :id="`category-move-input-${selectedCategory._id}`"
      :data-testid="`category-move-input-${selectedCategory._id}`"
      :value="(selectedCategory.moveAmount / 100).toString()"
      :is-editing="isEditingValue"
      @edit="isEditingValue = true"
      currency
      currency-left
    />
    <span class="category-radio-group">
      <details-radio
        :selected="selectedCategory.isMovingTo"
        testid="details-moving-to-button"
        @click="onMovingToClicked"
      >
        to
      </details-radio>
      <details-radio
        class="pl-4"
        :selected="!selectedCategory.isMovingTo"
        testid="details-moving-from-button"
        @click="onMovingFromClicked"
      >
        from
      </details-radio>
    </span>
    <category-menu 
      :category-id="selectedCategory.moveDestination" 
      show-balance 
      @selected="onMoveDestinationChanged"
    />
      <div class="my-2">
        <v-btn data-testid="details-move-save-button" elevation="0" text small block>Send</v-btn>
      </div>
  </div>
</template>

<script>
import DetailsRadio from "../Shared/DetailsRadio.vue";
import CategoryMenu from "../Shared/CategoryMenu.vue";
import CategoryGridInput from "./CategoryGridInput.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "DetailsMove",
  components: {
    CategoryGridInput,
    DetailsRadio,
    CategoryMenu,
  },
  data() {
    return {
      isEditingValue: false,
    };
  },
  computed: {
    ...mapGetters("categoryMonth", ["selectedCategory", "categoriesDataSortedByBalance"]),
  },
  methods: {
    ...mapActions("categoryMonth", ["onMovingToClicked", "onMovingFromClicked", "onMoveDestinationChanged"]),
  },
};
</script>

<style scoped>
.category-radio-group {
  display: flex;
  flex-direction: row;
  /* justify-content: space-between; */
  align-items: center;
  width: 100%;
}
</style>
