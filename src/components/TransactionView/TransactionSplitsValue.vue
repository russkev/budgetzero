<template>
  <div>
    <currency-input id="splits-total" v-model="splitValue" right />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import CurrencyInput from "./CurrencyInput.vue";

export default {
  components: { CurrencyInput },
  props: {
    index: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    splitValue: {
      get() {
        return _.get(this.editedTransaction, `splits[${this.index}].value`, 0);
      },
      set(value) {
        console.log("SET SPLIT VALUE", value);
        const negative = this.editedTransaction.value < 0 ? -1 : 1;
        this.SET_EDITED_TRANSACTION_SPLIT_VALUE({ index: this.index, value: value * negative });
        if (!this.editedTransaction.splits || this.editedTransaction.splits.length < 2) {
          return;
        }
        console.log("editedTransaction", JSON.parse(JSON.stringify(this.editedTransaction.splits)));
        const sum = this.editedTransaction.splits.reduce(
          (partial, split) => partial + split.value,
          0
        );
        const difference = this.editedTransaction.value - sum;
        if (difference === 0) {
          return;
        }
        let target_index = this.index === 0 ? 1 : 0;

        const existing_value = this.editedTransaction.splits[target_index].value;
        this.SET_EDITED_TRANSACTION_SPLIT_VALUE({
          index: target_index,
          value: existing_value + difference,
        });
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_SPLIT_VALUE"]),
  },
};
</script>
