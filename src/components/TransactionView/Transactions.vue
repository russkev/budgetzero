<template>
  <div>
    <v-container fluid class="py-0">
      <v-sheet justify="center" class="mx-auto" color="transparent">
        <transactions-header :selected_account_id="accountId" />
        <v-row class="ma-0 pa-0">
          <v-col class="flex-sheet pa-1" cols="8">
            <transactions-table />
          </v-col>
          <v-col cols="4" class="pa-0">
            <transaction-details />
          </v-col>
        </v-row>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import TransactionsHeader from './TransactionsHeader.vue'
import TransactionsTable from './TransactionsTable.vue'
import TransactionDetails from './DetailsT.vue'

export default {
  components: {
    TransactionsHeader,
    TransactionsTable,
    TransactionDetails
  },
  data() {
    return {
      test_items: [
        { name: 'John', age: 3 },
        { name: 'Susan', age: 2 }
      ],
      items_per_page: 3
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.account_id) {
      this.SET_ACCOUNT_ID(to.params.account_id)
    }
    next()
  },
  created() {
    this.SET_ACCOUNT_ID(this.$route.params.account_id)
  },
  watch: {
    accountsById: {
      handler(new_value, old_value) {
        this.getTransactions()
        // if (!old_value[this.accountId] || !new_value[this.accountId]) {
        //   /* If either new or old account is not defined, update will be handled elsewhere */
        //   return
        // }

        // /* Check whether anything in the active account has changed */
        // let thisAccountIsChanged = false

        // const new_keys = Object.keys(new_value[this.accountId])
        // const old_keys = Object.keys(old_value[this.accountId])

        // if (new_keys.length !== old_keys.length) {
        //   thisAccountIsChanged = true
        // } else {
        //   for (let i = 0; i < new_keys.length; i++) {
        //     if (new_value[this.accountId][new_keys[i]] !== old_value[this.accountId][new_keys[i]]) {
        //       thisAccountIsChanged = true
        //       break
        //     }
        //   }
        // }

        // if (thisAccountIsChanged) {
        //   console.log('ACCOUNTS WATCHER: Account changed')
        //   this.getTransactions()
        // }
      }
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['accountId']),
    ...mapGetters(['accountsById'])
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_ACCOUNT_ID']),
    ...mapActions('accountTransactions', ['getTransactions'])
  }
}
</script>

<style>
.flex-sheet {
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
}
</style>
