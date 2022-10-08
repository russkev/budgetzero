<template>
  <v-sheet width="100%" height="100%" color="background lighten-1">
    <div v-if="editedTransaction._id === DEFAULT_TRANSACTION._id"></div>
    <div class="transaction-details-grid" v-else>
      <div class="text-h5">Date</div>
      <!-- <div class="text-body-1">{{editedTransaction.date}}</div> -->
      <select-date data-testid="edit-row-date" v-model="transactionDate" />
      <div class="text-h5">Amount</div>
      <!-- <div class="text-body-1">{{editedTransaction.value / 100}}</div> -->
      <select-amount />
      <div class="text-h5">Category</div>
      <!-- <div class="text-body-1">{{editedTransaction.category}}</div> -->
      <div>
        <transaction-category :item="editedTransaction" @selected="onCategorySelected"/>
      </div>
      <div class="text-h5">Memo</div>
      <!-- <div class="text-body-1">{{editedTransaction.memo}}</div> -->
      <transaction-memo />
      <div class="text-h5">Note</div>
      <div class="text-body-1">{{editedTransaction.note}}</div>
    </div>
  </v-sheet>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { DEFAULT_TRANSACTION } from "../../constants";
import SelectDate from "./SelectDate.vue";
import SelectAmount from "./SelectAmount.vue"
import TransactionCategory from "./TransactionCategory.vue";
import TransactionMemo from "./TransactionMemo.vue";

export default {
  components: {
    SelectDate,
    SelectAmount,
    TransactionCategory,
    TransactionMemo,
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
    ]),
    onCategorySelected({item, categoryId}) {
      console.log("CAT", categoryId)
      this.SET_EDITED_TRANSACTION_CATEGORY(categoryId);
    },
  },
}
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
</style>
