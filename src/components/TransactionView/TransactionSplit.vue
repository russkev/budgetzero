<template>
  <fragment>
    <td></td>
    <td></td>
    <td>
      <select-category
        :id="`split-category-input-${index}`"
        :data-testid="`split-category-input-${index}`"
        :category-id="split.category"
        @update="onSplitsCategoryUpdate"
      />
    </td>
    <td>
      <transaction-split-flow 
        :split="split"
        :index="index"
        :disabled="disabled"
        isOutflow
      />
    </td>
    <td>
      <transaction-split-flow 
        :split="split"
        :index="index"
        :disabled="disabled"
      />
    </td>
  </fragment>
</template>

<script>
import SelectCategory from "./SelectCategory.vue";
import TransactionSplitFlow from "./TransactionSplitFlow.vue";
import { mapMutations } from "vuex";

export default {
  components: { SelectCategory, TransactionSplitFlow },
  props: {
    split: {
      type: Object,
    },
    index: {
      type: Number,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_SPLIT_CATEGORY"]),
    onSplitsCategoryUpdate(category_id) {
      this.SET_EDITED_TRANSACTION_SPLIT_CATEGORY({index: this.index, category: category_id})
    }
  }
};
</script>
