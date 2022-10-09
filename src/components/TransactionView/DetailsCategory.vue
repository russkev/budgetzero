<template>
  <div v-if="!isSplit">
    <category-menu :item="editedTransaction" @selected="onCategorySelected" />
    <v-card color="transparent" flat tile @click="onSplitCategoryAdd">
      <v-icon>mdi-plus</v-icon>
      Add split category
    </v-card>
  </div>
  <div v-else>
    <div class="splits-grid">
      <template v-for="(split, index) in splits">
        <category-menu
          :key="`category-${index}`"
          :item="split"
          @selected="
            (payload) => {
              onSplitCategorySelected(index, payload);
            }
          "
        />
        <splits-value :index="index" :key="`amount-${index}`" />
      </template>
      <v-card color="transparent" flat tile @click="onSplitCategoryAdd" class="splits-full-width">
        <v-icon>mdi-plus</v-icon>
        Add split category
      </v-card>
      <currency-input
        class="splits-full-width"
        :value="splitsSum"
        right
        disabled
      />
      <div v-if=" splitsSum !== Math.abs(editedTransaction.value)" class="splits-full-width">
        <v-alert color="error" text prominent class="text-h5 pa-1 pl-4">
          Splits must add up to the transaction value
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { NONE } from "../../constants";
import CurrencyInput from "./CurrencyInput.vue";
import SplitsValue from "./SplitsValue.vue";
import CategoryMenu from "./CategoryMenu.vue";

export default {
  components: { CurrencyInput, SplitsValue, CategoryMenu },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    isSplit() {
      return this.editedTransaction.splits && this.editedTransaction.splits.length > 1;
    },
    splits: {
      get() {
        return this.editedTransaction.splits;
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_SPLITS(value);
      },
    },
    splitsSum() {
      return this.editedTransaction.splits.reduce(
        (partial, split) => partial + Math.abs(split.value),
        0
      );
    },
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_CATEGORY",
      "PUSH_EDITED_TRANSACTION_SPLIT",
      "CLEAR_EDITED_TRANSACTION_SPLIT",
      "SET_EDITED_TRANSACTION_SPLIT_CATEGORY",
    ]),
    onCategorySelected(categoryId) {
      this.SET_EDITED_TRANSACTION_CATEGORY(categoryId);
    },
    onSplitCategoryAdd() {
      if (!this.isSplit) {
        this.PUSH_EDITED_TRANSACTION_SPLIT({
          category: this.editedTransaction.category,
          value: this.editedTransaction.value,
        });
      }
      this.PUSH_EDITED_TRANSACTION_SPLIT({ category: NONE._id, value: 0 });
    },
    onSplitCategorySelected(index, categoryId) {
      this.SET_EDITED_TRANSACTION_SPLIT_CATEGORY({ index, categoryId });
    },
  },
};
</script>

<style>
div.splits-grid {
  display: grid;
  grid-template-columns: minmax(50px, auto) 100px;
}
/* #add-split-category {
  grid-column: 1 / 3;
}
#splits-total {
  grid-column: 1 / 3;
} */
.splits-full-width {
  grid-column: 1 / 3;
}
</style>
