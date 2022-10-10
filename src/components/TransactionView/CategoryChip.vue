<template>
  <v-tooltip bottom color="background" outlined>
    <template #activator="{ on: onTooltip, attrs }">
      <v-chip
        class="simple-ellipsis pl-0"
        small
        label
        pill
        v-bind="attrs"
        v-on="{ ...on, ...onTooltip }"
        :color="categoryBackgroundColor"
        :disabled="disabled"
      >
        <v-sheet
          width="5px"
          min-width="5px"
          :color="selectedCategoryColor"
          height="100%"
          class="mr-2"
        />
        <div class="simple-ellipsis">
          {{ selectedCategoryName }}
        </div>
      </v-chip>
    </template>
    <span> {{ selectedCategoryName }}</span>
  </v-tooltip>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    on: {
      type: Object,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(["categoryColors", "categoriesById"]),
    selectedCategoryColor() {
      const id = this.item.category;
      const color = this.categoryColors[id];
      if (color === undefined) {
        return "grey";
      }
      return color;
    },
    selectedCategoryName() {
      const id = this.item.category;
      const category = this.categoriesById[id];
      if (category === undefined) {
        return "None";
      }
      return category.name;
    },
    categoryBackgroundColor() {
      return `${this.selectedCategoryColor}55`;
    },
  },
};
</script>

<style>
.simple-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-chip {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
}
</style>
