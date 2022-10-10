<template>
  <!-- <v-btn icon @click="toggleCleared()" :disabled="selectedTransactions.length > 0"> -->
  <!-- <v-btn icon @click="toggleCleared()" v-if="selectedTransactions.length === 0"> -->
    <!-- <v-icon
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
    </v-icon> -->
    <!-- <cleared-icon 
      :isCleared="this.item.cleared"
      :hover="hover"
      :disabled="selectedTransactions.length > 0"
    /> -->
  <!-- </v-btn> -->
  <!-- <sheet v-else width="36px" height="36px">
        <cleared-icon 
      :isCleared="this.item.cleared"
      :hover="hover"
    />
  </sheet> -->
  <v-icon
    v-if="this.item.cleared"
    :size="size"
    class="cleared-icon px-1"
    color="success"
    @click="toggleCleared()"
    :disabled="disabled"
    :style="disabled ? 'color: var(--v-background-lighten5) !important;' : ''"
  >
    mdi-alpha-c-circle
  </v-icon>
  <v-icon
    v-else
    :size="size"
    class="cleared-icon px-1"
    :color="hover ? 'background lighten-5' : 'transparent'"
    :style="disabled ? 'color: transparent !important;' : ''"
    :disabled="disabled"
    @click="toggleCleared()"
    >
    mdi-alpha-c-circle
  </v-icon>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import ClearedIcon from "./ClearedIcon.vue";

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
  components: {
    ClearedIcon,
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
    disabled() {
      return this.selectedTransactions.length > 0;
    }
    // isCleared() {
    //   if(this.editedTransaction._id === this.item._id) {
    //     return this.editedTransaction.cleared
    //   } else {
    //     return this.item.cleared
    //   }
    // },
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
