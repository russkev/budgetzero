<template>
  <v-icon
    v-if="this.item.cleared"
    :size="size"
    class="cleared-icon mx-1"
    color="success"
    @click="toggleCleared()"
    :disabled="isDisabled"
    :style="isDisabled ? 'color: var(--v-background-lighten5) !important;' : ''"
  >
    mdi-alpha-c-circle
  </v-icon>
  <v-icon
    v-else
    :size="size"
    class="cleared-icon px-1"
    :color="hover ? 'background lighten-5' : 'transparent'"
    :style="isDisabled ? 'color: transparent !important;' : ''"
    :disabled="isDisabled"
    @click="toggleCleared()"
    >
    mdi-alpha-c-circle
  </v-icon>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";

export default {
  props: {
    item: {
      type: Object
    },
    hover: {
      type: Boolean,
      default: false,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      size: 20,
    }
  },
  computed: {
    ...mapGetters("accountTransactions", [
      "editedTransactionIndex",
      "transactions",
      "editedTransaction",
      "selectedTransactions",
    ]),
    isDisabled() {
      // return this.highlighted || this.selectedTransactions.length > 0;
      return this.editedTransaction._id === this.item._id;
    }
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_CLEARED",
      "SET_EDITED_TRANSACTION",
      "CLEAR_EDITED_TRANSACTION",
    ]),
    ...mapActions("accountTransactions", ["prepareEditedItem", "getTransactions"]),
    ...mapActions(["createOrUpdateTransaction"]),
    toggleCleared() {
      // if (this.editedTransactionIndex === this.transactions.indexOf(item)) {
      if(this.editedTransaction._id === this.item._id) {
        this.SET_EDITED_TRANSACTION_CLEARED(!this.editedTransaction.cleared);
        return;
      }

      this.SET_EDITED_TRANSACTION({ ...this.item, cleared: !this.item.cleared });
      this.prepareEditedItem();
      const payload = { current: this.editedTransaction, previous: this.item }
      this.createOrUpdateTransaction(payload).then(() =>
        this.getTransactions()
      );
      this.CLEAR_EDITED_TRANSACTION()
    },
  },
};
</script>
