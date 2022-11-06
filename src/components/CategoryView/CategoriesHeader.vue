<template>
  <v-row class="ma-0 pa-0" style="flex-wrap: nowrap; justify-content: space-between;">
    <v-col class="ma-0 mr-auto pa-0 mb-2" cols="auto">
      <category-month-selector />
    </v-col>
    <v-col class="ma-0 pa-0" cols="auto" style="flex: 0 1 250px;">
      <categories-amount />
    </v-col>
  </v-row>
</template>

<script>
import CategoriesAmount from './CategoriesAmount.vue';
import CategoryMonthSelector from './CategoryMonthSelector.vue';

export default {
  components: {
    CategoriesAmount,
    CategoryMonthSelector,
  },
};
</script>