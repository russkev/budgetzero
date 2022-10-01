<template>
  <v-card class="mb-2 background lighten-1 category-card" elevation="0" :width="width">
    <!-- Template that acts as a wrapper -->
      <slot></slot>
  </v-card>
</template>

<script>
export default {
  name: "CategoryCard",
  props: {
    width: {
      type: String,
      default: "auto",
    },
  },
};
</script>