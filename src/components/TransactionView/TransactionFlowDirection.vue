<template>
  <v-radio-group dense hide-details v-model="isInflow" column class="pa-0 ma-0 small-radio">
    <template #label="{ label }">
      <span class="text-body-1">{{ label }}</span>
    </template>
    <v-radio small :value="true">
      <template #label>
        <span class="text-body-1">Inflow</span>
      </template>
    </v-radio>
    <v-radio label="Outflow" :value="false">
      <template #label>
        <span class="text-body-1">Outflow</span>
      </template>
    </v-radio>
  </v-radio-group>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  props: {
    value: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    isInflow: {
      get() {
        return this.editedTransaction.value >= 0;
      },
      set(value) {
        if (value && this.editedTransaction.value < 0) {
          this.SET_EDITED_TRANSACTION_VALUE(Math.abs(this.editedTransaction.value));
          this.REVERSE_EDITED_TRANSACTION_SPLIT_VALUES();
        } else if (!value && this.editedTransaction.value > 0) {
          this.SET_EDITED_TRANSACTION_VALUE(-Math.abs(this.editedTransaction.value));
          this.REVERSE_EDITED_TRANSACTION_SPLIT_VALUES();
        }
        this.$emit("input", value);
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_VALUE",
      "REVERSE_EDITED_TRANSACTION_SPLIT_VALUES",
    ]),
  },
};
</script>

<style>
.small-radio i.v-icon.v-icon--dense {
  font-size: 1rem;
}

.small-radio div.v-input--selection-controls__input > div.v-input--selection-controls__ripple {
  margin: 0;
  width: 23px;
  height: 23px;
  top: 0 !important;
  left: 1px;
}
</style>
