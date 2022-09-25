<template>
  <v-card class="my-2 background lighten-1 rounded-l" elevation="0" :width="width">
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