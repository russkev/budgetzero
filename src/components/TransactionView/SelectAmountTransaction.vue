<template>
    <v-text-field
    :value="amount"
    suffix="$"
    reverse
    dense
    hide-details
    :rules="[currencyRule]"
    @click="onClick($event)"
    @blur="
      onApply($event)
      onBlur()
    "
    @change="onApply($event)"
    @mousedown="onApply($event)"
    @keyup.enter="
      onApply($event)
      onSave()
    "
    :disabled="disabled"
    :data-testid="dataTestid"
  />
</template>

<script>
import { DEFAULT_TRANSACTION } from "../../constants";

export default {
  emits: ["update"],
  props: {
    editedItem: {
      type: Object,
      default: DEFAULT_TRANSACTION,
    },
    isOutflow: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dataTestid: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      displayValue: "",
      currencyRule: (value) => {
        return value !== undefined && (value.length === 0 || !isNaN(value));
      },
      isSelected: false,
    };
  },
  computed: {
    amount: {
      get() {
        if (this.isBlank(this.editedItem.value)) {
          this.displayValue = ""
        } else {
          this.displayValue = (
            Math.round(this.parseCurrencyValue(this.editedItem.value)) / 100
          ).toFixed(2);
        }
        return this.displayValue;
      },

      set(inflow_value) {
        this.displayValue = inflow_value;
      },
    },
  },
  methods: {
    onBlur() {
      this.isSelected = false
    },
    onClick(event) {
      if (!this.isSelected) {
        event.target.select()
        this.isSelected = true
      }
    },
    onApply(event) {
      if (!event.target) {
        return;
      }

      const target_value = event.target.value;
      if (isNaN(target_value)) {
        // this.displayValue = this.amount
        this.amount = this.displayValue
        return
      }

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
    onSave() {
      this.$emit('save')
      this.isSelected = false
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
