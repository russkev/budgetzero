<template>
  <div>
    <v-container fluid class="pt-0">
      <v-sheet justify="center" class="mx-auto" color="transparent">
        <transactions-header :selected_account_id="accountId" />
        <v-row class="ma-0 pa-0">

          <!-- <div class="flex-sheet"> -->
          <v-col class="flex-sheet" cols="8">
            <transactions-table />
          </v-col>
          <v-col cols="4">
            <transaction-details />
          </v-col>
          <!-- </div> -->
        </v-row>
        <transactions-edit-multiple />
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import TransactionsHeader from "./TransactionsHeader.vue";
import TransactionsTable from "./TransactionsTable.vue";
import TransactionsEditMultiple from "./TransactionsEditMultiple.vue";
import TransactionDetails from "./TransactionDetails.vue";

export default {
  components: {
    TransactionsHeader,
    TransactionsTable,
    TransactionsEditMultiple,
    TransactionDetails,
  },
  data() {
    return {
      test_items: [
        { name: "John", age: 3 },
        { name: "Susan", age: 2 },
      ],
      items_per_page: 3,
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.getTransactions(to.params.account_id);
    next();
  },
  created() {
    this.getTransactions(this.$route.params.account_id);
  },
  watch: {
    accounts: {
      handler() {
        this.getTransactions();
      },
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["accountId"]),
    ...mapGetters(["accounts"]),
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_ACCOUNT_ID"]),
    ...mapActions("accountTransactions", ["getTransactions"]),
  },
};
</script>

<style scoped>
.flex-sheet {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}


</style>