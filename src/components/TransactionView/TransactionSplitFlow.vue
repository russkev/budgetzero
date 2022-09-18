<template>
  <select-amount-transaction 
    :is-outflow="isOutflow"
    :data-testid="testId"
    :id="inputId"
    :edited-item="split"
    @update="onEditUpdate"
    :disabled="disabled"
    />
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import SelectAmountTransaction from './SelectAmountTransaction.vue';

export default {
  components: { SelectAmountTransaction },
  props: {
    split: {
      type: Object
    },
    index: {
      type: Number
    },
    isOutflow: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputId: this.isOutflow ? `outflow-split-${this.index}-input` :  `inflow-split-${this.index}-input`,
      testId: this.isOutflow ? `edit-row-split-${this.index}-outflow` : `edit-row-split-${this.index}-inflow`,
    }
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    itemValue() {
      if (this.isOutflow && this.item.value < 0) {
        return this.intlCurrency.format(-this.item.value / 100)
      } else if (!this.isOutflow && this.item.value > 0) {
        return this.intlCurrency.format(this.item.value / 100)
      } else {
        return ""
      }
    }
  },
  methods: {
    ...mapActions("accountTransactions", ["setEditedTransactionSplitValue"]),

    onEditUpdate(value) {
      this.setEditedTransactionSplitValue({index: this.index, value: value})
    }
  }
}
</script>