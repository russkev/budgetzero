<template>
  <v-sheet width="100%" height="100%" color="background lighten-1">
    <div v-if="editedTransaction._id === DEFAULT_TRANSACTION._id"></div>
    <div v-else>
      <div class="transaction-details-grid">
        <div class="text-h5">Date</div>
        <select-date data-testid="edit-row-date" v-model="transactionDate" />
        <div class="text-h5">Amount</div>
        <select-amount />
        <div class="text-h5">Status</div>
        <transaction-status />
        <div class="text-h5">Category</div>
        <transaction-category-container />
        <div class="text-h5">Memo</div>
        <transaction-memo />
        <div class="text-h5">Note</div>
        <transaction-note />
      </div>
      <div class="save-cancel-container">
        <v-btn text small @click="onCancel">
          Cancel
        </v-btn>
        <v-btn small elevation="0" color="primary darken-1" @click="onSave">
          Save
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { DEFAULT_TRANSACTION } from "../../constants";
import SelectDate from "./SelectDate.vue";
import SelectAmount from "./SelectAmount.vue";
import TransactionCategoryContainer from "./TransactionCategoryContainer.vue";
import TransactionMemo from "./TransactionMemo.vue";
import TransactionNote from "./TransactionNote.vue";
import TransactionFlowDirection from "./TransactionFlowDirection.vue";
import TransactionStatus from "./TransactionStatus.vue";

export default {
  components: {
    SelectDate,
    SelectAmount,
    TransactionCategoryContainer,
    TransactionMemo,
    TransactionNote,
    TransactionFlowDirection,
    TransactionStatus,
  },
  props: {
    item: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      DEFAULT_TRANSACTION,
    };
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    transactionDate: {
      get() {
        return this.editedTransaction.date;
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_DATE(value);
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_MEMO",
      "SET_EDITED_TRANSACTION_NOTE",
      "SET_EDITED_TRANSACTION_DATE",
      "SET_EDITED_TRANSACTION_CATEGORY",
      "CLEAR_EDITED_TRANSACTION",
    ]),
    ...mapActions("accountTransactions", ["save"]),
    onSave() {
      this.save(this.item);
    },
    onCancel() {
      this.CLEAR_EDITED_TRANSACTION();
    },
  },
};
</script>

<style>
div.transaction-details-grid {
  display: grid;
  grid-template-columns: 70px auto;
  grid-gap: 0px 10px;
}

.v-application div.transaction-details-grid > div {
  line-height: 1.9rem;
}

.transaction-details-grid > :nth-child(2n-1) {
  text-align: right;
  border-right: 1px solid var(--v-secondary-darken1);
  padding-right: 5px;
  padding-bottom: 5px;
}

.save-cancel-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
