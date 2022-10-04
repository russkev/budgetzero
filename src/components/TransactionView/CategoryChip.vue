<template>
  <v-chip class="category-chip pl-0" small label pill v-on="on" :color="categoryBackgroundColor">
    <v-sheet width="5px" :color="selectedCategoryColor" height="100%" class="mr-2" />
    {{ item.category_name }}
  </v-chip>
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
  },
  computed: {
    ...mapGetters([
      "categoryColors",
    ]),
    selectedCategoryColor() {
      const id = this.item.category;
      const color = this.categoryColors[id];
      if (color === undefined) {
        return "grey";
      }
      return color;
    },
    categoryBackgroundColor() {
      return `${this.selectedCategoryColor}55`;
    },
  },
};
</script>
