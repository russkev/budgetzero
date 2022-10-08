<template>
  <v-hover v-slot="{ hover }">
    <v-text-field
      v-model="valueData"
      ref="amount"
      class="ma-0 pa-0 text-body-1"
      dense
      flat
      solo
      hide-details
      :disabled="disabled"
      :readonly="readonly"
      :reverse="right"
      :prefix="!right && isFocused ? '$' : ''"
      :suffix="right && isFocused ? '$' : ''"
      @focus="onFocus"
      @blur="onBlur"
      :background-color="isFocused || hover ? 'background lighten-2' : 'transparent'"
    />
  </v-hover>
</template>

<script>
import { nextTick } from "vue";
import { mapGetters } from "vuex";

export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    right: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFocused: false,
      justFocused: false,
      valueRegex: /[0-9]+\.[0-9]+/g,
    };
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    valueData: {
      get() {
        const edited_value = Math.abs(this.value / 100);
        if (this.isFocused) {
          if (this.justFocused) {
            this.justFocused = false;
            return edited_value.toFixed(2);
          } else {
            return edited_value;
          }
        } else {
          return this.intlCurrency.format(edited_value);
        }
      },
      set(input_value) {
        let result_value = this.parseCurrencyValue(input_value);
        result_value = parseInt(result_value * 100);
        if (!isNaN(result_value)) {
          this.$emit("input", result_value);
        }
      },
    },
  },
  methods: {
    onFocus(event) {
      if (!this.isFocused) {
        this.isFocused = true;
        this.justFocused = true;
        nextTick(() => {
          event.target.select();
        });
      }
    },
    onBlur() {
      this.isFocused = false;
      this.justFocused = false;
    },
    parseCurrencyValue(input_currency) {
      let currency_value = "";
      if (input_currency !== undefined) {
        // Remove all non-digit chars except for period
        currency_value = input_currency.toString().replace(/[^0-9.]/g, "");
      }

      return currency_value;
    },
  },
};
</script>
