<template>
  <div>

    <delete-confirm @confirm="onDeleteTransaction()">
      <template #activator="{on}">
        
        <v-btn v-on="on" text width="min-content" color="error lighten-1">
          <v-icon small left>mdi-delete</v-icon>
          Delete
        </v-btn>
      </template>
    </delete-confirm>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import DeleteConfirm from "../Shared/DeleteConfirm.vue";


export default {
  components: { DeleteConfirm },
  computed: {
    ...mapGetters("accountTransactions", ["transactions", "editedTransactionIndex"]),
    item() {
      return this.transactions[this.editedTransactionIndex];
    },
  },
  methods: {
    ...mapActions("accountTransactions", ["deleteTransaction"]),
    ...mapMutations("accountTransactions", ["CLEAR_EDITED_TRANSACTION"]),
    onDeleteTransaction() {
      this.deleteTransaction(this.item);
      this.CLEAR_EDITED_TRANSACTION()
    },
  },
};
</script>
