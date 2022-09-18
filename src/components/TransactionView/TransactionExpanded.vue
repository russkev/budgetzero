<template>
  <td colspan="100">
    <div class="expanded-details">
      <span>
        Date
      </span>
      <select-date data-testid="edit-row-date" v-model="transactionDate" />
      <span>Details</span>
      <!-- <v-textarea
        data-testid="edit-row-memo"
        class="ma-0"
        v-model="editedTransaction.memo"
        rows="2"
        dense
        filled
        hide-details
      /> -->
      <transaction-text-area
        :value="editedTransaction.memo"
        :rows="2"
        dataTestid="edit-row-memo"
        @apply="onMemoApply"
      />
      <span>Notes</span>
      <v-textarea
        data-testid="edit-row-note"
        class="ma-0"
        v-model="editedTransaction.note"
        rows="2"
        dense
        filled
        hide-details
      />
    </div>
    <div>
      <v-btn data-testid="cancel-edit-button" small @click="cancel()">Cancel</v-btn>
      <v-btn data-testid="save-edit-button" small @click="save(item)" color="primary">Save</v-btn>
    </div>
  </td>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import SelectDate from "./SelectDate.vue";
import TransactionTextArea from "./TransactionTextArea.vue";

export default {
  components: { SelectDate, TransactionTextArea },
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),

    transactionDate: {
      get() {
        return this.editedTransaction.date;
      },
      set(date_value) {
        this.SET_EDITED_TRANSACTION_DATE(date_value)
      },
    },
  },
  methods: {
    ...mapActions("accountTransactions", ["cancel", "save"]),
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_MEMO",
      "SET_EDITED_TRANSACTION_NOTE",
      "SET_EDITED_TRANSACTION_DATE",
    ]),
    onMemoApply(event) {
      console.log("onmemoapply");
      if (!event.target) {
        return;
      }

      const target_value = event.target.value;
      this.SET_EDITED_TRANSACTION_MEMO(target_value);
    },
  },
};
</script>
