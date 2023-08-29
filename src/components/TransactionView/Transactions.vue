<template>
  <div>
    <v-container fluid class="py-0">
      <v-sheet justify="center" class="mx-auto" color="transparent">
        <transactions-header :selected_account_id="accountId" />
        <v-row class="ma-0 pa-0">
          <v-col
            class="flex-sheet pa-1"
            :cols="isCompact ? 12 : 8"
            :style="!isCompact || !showDetails ? '' : 'display: none;'"
          >
            <transactions-table />
          </v-col>
          <v-col :cols="isCompact ? 12 : 4" class="pa-0" :style="!isCompact || showDetails ? '' : 'display: none;'">
            <transaction-details />
          </v-col>
        </v-row>
        <v-btn v-if="isCompact" fab fixed bottom right color="primary darken" @click="toggleDetails">
          <v-icon color="background">{{ showDetails ? 'mdi-arrow-left' : 'mdi-arrow-right' }}</v-icon>
        </v-btn>
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
      }
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['accountId', 'showDetails']),
    ...mapGetters(['accountsById']),
    isCompact() {
      return this.$vuetify.breakpoint.mobile || this.$vuetify.breakpoint.smAndDown
    }
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_ACCOUNT_ID', 'SET_SHOW_DETAILS']),
    ...mapActions('accountTransactions', ['getTransactions']),
    toggleDetails() {
      this.SET_SHOW_DETAILS(!this.showDetails)
    }
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
