<template>
  <v-btn icon @click="toggleCleared()">
    <v-icon
      v-if="isCleared"
      :size="size"
      class="cleared-icon"
      color="success"
    >
      mdi-alpha-c-circle
    </v-icon>
    <v-icon
      v-else 
      :size="size"
      class="uncleared-icon" 
      :color="hover ? 'grey' : 'transparent'"
    >
      mdi-alpha-c-circle
    </v-icon>
  </v-btn>
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
    ]),
    isCleared() {
      if(this.editedTransaction._id === this.item._id) {
        return this.editedTransaction.cleared
      } else {
        return this.item.cleared
      }
    },
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
    isVisible(hover) {
      return hover || this.isCleared;
    },
  },
};
</script>
