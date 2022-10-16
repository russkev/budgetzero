<template>
  <v-expansion-panels flat multiple :value="expanded">
    <v-expansion-panel
      class="category-card background lighten-1 rounded-1 ma-0 pa-0 mb-2"
      style="box-shadow: none;"
    >
      <slot name="header"></slot>
      <v-expansion-panel-content class="pa-0 ma-0" color="transparent">
        <slot name="body"></slot>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  name: "Collapsed",
  props: {
    masterCategory: {
      type: Object,
    },
  },
  computed: {
    expanded() {
      if (this.masterCategory.collapsed) {
        return [];
      } else {
        return [0];
      }
    },
  },
};
</script>
