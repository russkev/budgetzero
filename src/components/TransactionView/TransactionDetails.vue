<template>
  <v-sheet width="100%" height="100%" color="background lighten-1">
    <div v-if="editedTransaction._id === DEFAULT_TRANSACTION._id"></div>
    <div class="transaction-details-grid" v-else>
      <div class="text-h5">Date</div>
      <!-- <div class="text-body-1">{{editedTransaction.date}}</div> -->
      <select-date />
      <div class="text-h5">Amount</div>
      <div class="text-body-1">{{editedTransaction.value / 100}}</div>
      <div class="text-h5">Category</div>
      <div class="text-body-1">{{editedTransaction.category}}</div>
      <div class="text-h5">Memo</div>
      <div class="text-body-1">{{editedTransaction.memo}}</div>
      <div class="text-h5">Note</div>
      <div class="text-body-1">{{editedTransaction.note}}</div>
    </div>
  </v-sheet>
</template>

<script>
import { mapGetters } from "vuex";
import { DEFAULT_TRANSACTION } from "../../constants";
import SelectDate from "./SelectDate.vue";

export default {
  components: {
    SelectDate,
  },
  data() {
    return {
      DEFAULT_TRANSACTION,
    };
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
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
