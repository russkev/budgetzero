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
      :prefix="isFocused ? '$' : ''"
      @focus="onFocus"
      @blur="onBlur"
      :background-color="isFocused || hover ? activeBackgroundColor : 'transparent'"
    />
  </v-hover>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { nextTick } from "vue";

export default {
  props: {
    activeBackgroundColor: {
      type: String,
      default: "background lighten-2",
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
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    valueData: {
      get() {
        if (this.isFocused) {
          if (this.justFocused) {
            this.justFocused = false;
            return (this.editedTransaction.value / 100).toFixed(2);
          } else {
            console.log("AMOUNT", this.editedTransaction.value);
            return this.editedTransaction.value / 100;
          }
        } else {
          return this.intlCurrency.format(this.editedTransaction.value / 100);
        }
      },
      set(value) {
        let result_value = this.parseCurrencyValue(value);
        result_value = parseInt(result_value * 100);
        if (!isNaN(result_value)) {
          this.SET_EDITED_TRANSACTION_VALUE(result_value);
        }
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_VALUE"]),
    parseCurrencyValue(input_currency) {
      let value = "";
      if (input_currency !== undefined) {
        // Remove all non-digit chars except for period
        value = input_currency.toString().replace(/[^0-9.]/g, "");
      }

      return value;
    },
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
  },
};
</script>
