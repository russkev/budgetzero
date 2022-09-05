<template>
  <select-amount-base :amount="amount" @apply="amountApply" v-on="$listeners" />
</template>

<script>
import { DEFAULT_TRANSACTION } from "../../constants";
import SelectAmountBase from "../Inputs/SelectAmountBase.vue";

export default {
  components: { SelectAmountBase },
  emits: ["update"],
  props: {
    item: {
      type: Object,
      default: DEFAULT_TRANSACTION,
    },
    editedItem: {
      type: Object,
      default: DEFAULT_TRANSACTION,
    },
    isOutflow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      displayValue: "",
    };
  },
  computed: {
    amount: {
      get() {
        if (this.displayValue === "" && !this.isBlank(this.editedItem.value)) {
          this.displayValue = (
            Math.round(this.parseCurrencyValue(this.editedItem.value)) / 100
          ).toFixed(2);
        } else if (this.displayValue !== "" && this.isBlank(this.editedItem.value)) {
          this.displayValue = ""
        }
        return this.displayValue;
      },
      set(inflow_value) {
        this.displayValue = inflow_value;
      },
    },
  },
  methods: {
    amountApply(event) {
      if (!event.target) {
        return;
      }

      const target_value = event.target.value;
      this.displayValue = target_value;
      const sanitized_value = Math.round(this.parseCurrencyValue(target_value) * 100);
      const emit_value = this.isOutflow ? -sanitized_value : sanitized_value
      if(!this.isBlank(emit_value)) {
        this.$emit("update", emit_value);
      }

      // Use timeout to ensure above is set before next step
      setTimeout(() => {
        if (this.isBlank(sanitized_value)) {
          this.displayValue = "";
        } else {
          this.displayValue = (sanitized_value / 100).toFixed(2);
        }
      });
    },
    isBlank(value) {
      if (this.isOutflow) {
        return value >= 0;
      } else {
        return value <= 0;
      }
    },
    parseCurrencyValue(input_currency) {
      let value = "";
      if (input_currency !== undefined) {
        // Remove all non-digit chars except for period
        value = input_currency.toString().replace(/[^0-9.]/g, "");
      }
      
      return value;
    },
  },
};
</script>
