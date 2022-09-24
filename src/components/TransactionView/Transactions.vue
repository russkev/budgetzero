<template>
  <div>
    <transactions-header :selected_account_id="accountId" />
    <v-container>
      <v-sheet max-width="800px" justify="center">
        <transactions-table />
      </v-sheet>
    </v-container>
    <transactions-edit-multiple />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import TransactionsHeader from "./TransactionsHeader.vue";
import TransactionsTable from "./TransactionsTable.vue";
import TransactionsEditMultiple from "./TransactionsEditMultiple.vue";

export default {
  components: {
    TransactionsHeader,
    TransactionsTable,
    TransactionsEditMultiple,
  },
  data() {
    return {
      test_items: [{name: "John", age: 3}, {name: "Susan", age: 2}],
      items_per_page: 3
    }
  },
  beforeRouteUpdate(to, from, next) {
    console.log("ROUTE UPDATE", to.params.account_id)

    this.getTransactions(to.params.account_id)
    next();
  },
  created() {
    console.log("Before mount")
    this.getTransactions(this.$route.params.account_id)
  },
  watch: {
    accounts: {
      handler() {
        this.getTransactions()
      }
    }
  },
  computed: {
    ...mapGetters("accountTransactions", ["accountId"]),
    ...mapGetters(["accounts"])
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_ACCOUNT_ID"]),
    ...mapActions("accountTransactions", ["getTransactions"]),
  },
};
</script>
