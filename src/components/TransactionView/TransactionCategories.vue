<template>
  <div
    v-if="!isSplit"
    class="transaction-categories-container mr-2"
    :style="`grid-template-columns: ${templateColumns}`"
  >
    <category-menu
      :item="item"
      @selected="onCategorySelected"
      :disabled="isDisabled"
    />
  </div>
  <div
    v-else
    class="transaction-categories-container mr-2"
    :style="`grid-template-columns: ${templateColumns}`"
  >
    <template v-for="(split, index) in this.item.splits">
      <category-menu
        :key="`category-${index}`"
        :item="split"
        :disabled="isDisabled"
        @selected="
          (categoryId) => {
            onSplitCategorySelected(index, categoryId);
          }
        "
      />
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import CategoryMenu from "./CategoryMenu.vue";

export default {
  props: {
    item: {
      type: Object,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
  },
  components: { CategoryMenu },
  computed: {
    ...mapGetters("accountTransactions", ["selectedTransactions", "editedTransaction"]),
    templateColumns() {
      return this.isSplit ? `repeat(${this.item.splits.length}, 1fr)` : "1fr";
    },
    isSplit() {
      return this.item.splits && this.item.splits.length > 1;
    },
    isDisabled() {
      // return this.highlighted || this.selectedTransactions.length > 0;
      return this.editedTransaction._id === this.item._id;
    },
  },
  methods: {
    ...mapActions("accountTransactions", ["getTransactions"]),
    ...mapActions(["commitDocToPouchAndVuex"]),
    onCategorySelected(categoryId) {
      const current = { ...this.item, category: categoryId };
      const previous = this.item;
      this.commitDocToPouchAndVuex({ current, previous }).then(() => {
        this.getTransactions();
      });
    },
    onSplitCategorySelected(index, categoryId) {
      const splits = this.item.splits.map((split, i) => {
        if (i === index) {
          return { ...split, category: categoryId };
        } else {
          return split;
        }
      });
      const current = { ...this.item, splits };
      const previous = this.item;
      this.commitDocToPouchAndVuex({ current, previous }).then(() => {
        this.getTransactions();
      });
    },
  },
};
</script>

<style>
.transaction-categories-container {
  display: grid;
  grid-gap: 0.5rem;
  width: 150px;
}
</style>
