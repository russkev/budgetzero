<template>
  <div v-if="!isSplit">
    <transaction-category :item="editedTransaction" @selected="onCategorySelected" />
    <v-card color="transparent" flat tile @click="onSplitCategoryAdd">
      <v-icon>mdi-plus</v-icon>
      Add split category
    </v-card>
  </div>
  <div v-else>
    <div class="splits-grid">
      <template v-for="(split, index) in splits">
        <transaction-category
          :key="`category-${index}`"
          :item="split"
          @selected="
            (payload) => {
              onSplitCategorySelected(index, payload);
            }
          "
        />
        <transaction-splits-value :index="index" :key="`amount-${index}`"/>
      </template>
      <v-card color="transparent" flat tile @click="onSplitCategoryAdd" id="add-split-category">
        <v-icon>mdi-plus</v-icon>
        Add split category
      </v-card>
      <currency-input id="splits-total" v-model="editedTransaction.value" right disabled/>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { NONE } from "../../constants";
import CurrencyInput from "./CurrencyInput.vue";
import TransactionSplitsValue from "./TransactionSplitsValue.vue";

export default {
  components: { CurrencyInput, TransactionSplitsValue },
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
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_CATEGORY",
      "PUSH_EDITED_TRANSACTION_SPLIT",
      "CLEAR_EDITED_TRANSACTION_SPLIT",
      "SET_EDITED_TRANSACTION_SPLIT_CATEGORY",
    ]),
    onCategorySelected({ item, categoryId }) {
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
    onSplitCategorySelected(index, { item, categoryId }) {
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
#add-split-category {
  grid-column: 1 / 3;
}
#splits-total {
  grid-column: 2 / 3;
}
</style>
