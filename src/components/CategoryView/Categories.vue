<template>
  <div>
    <v-container fluid class="py-0">
      <v-sheet
        max-width="1400px"
        justify="center"
        id="categories-container-sheet"
        class="mx-auto pa-2"
        color="transparent"
      >
        <categories-header style="width: 100%;" />
        <categories-list class="categories-full-height" style="width: 60%;" />
        <category-details class="categories-full-height" style="width: calc(40% - 8px);" />
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import CategoriesHeader from "./CategoriesHeader.vue";
import CategoryDetails from "./CategoryDetails.vue";
import CategoriesList from "./CategoriesList.vue";
import { mapMutations, mapActions } from "vuex";

export default {
  components: {
    CategoriesHeader,
    CategoryDetails,
    CategoriesList,
  },
  mounted() {
    this.UPDATE_SELECTED_MONTH(this.$route.params.month);
    this.getMonthTransactions();
  },
  beforeRouteUpdate(to, from) {
    this.UPDATE_SELECTED_MONTH(to.params.month);
    this.getMonthTransactions();
  },
  methods: {
    ...mapMutations("categoryMonth", ["UPDATE_SELECTED_MONTH"]),
    ...mapActions("categoryMonth", ["getMonthTransactions"]),
  },
};
</script>

<style>
.categories-full-height {
  height: calc(100vh - 90px);
}

#categories-container-sheet {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: calc(100vh - 1px);
}
</style>
