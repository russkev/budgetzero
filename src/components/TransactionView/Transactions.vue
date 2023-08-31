<template>
  <div>
    <v-container fluid class="py-0">
      <v-sheet justify="center" class="mx-auto" color="transparent">
        <transactions-header :selected_account_id="accountId" />
        <div v-if="!isCompact">
          <v-row class="ma-0 pa-0">
            <v-col class="flex-sheet pa-1" :cols="8">
              <transactions-table />
            </v-col>
            <v-col :cols="4" class="pa-0">
              <transaction-details />
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <v-row class="ma-0 pa-0">
            <v-col class="flex-sheet pa-1" :cols="12">
              <transactions-table />
            </v-col>
          </v-row>
          <v-dialog v-model="dialog" fullscreen :scrim="false" transition="dialog-right-transition">
            <transaction-details />
          </v-dialog>
          <v-btn fab fixed bottom right color="primary darken" @click="toggleDetails">
            <v-icon color="background">{{ showDetails ? 'mdi-arrow-left' : 'mdi-arrow-right' }}</v-icon>
          </v-btn>
        </div>
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
    },
    dialog: {
      get() {
        return this.showDetails
      },
      set(value) {
        this.SET_SHOW_DETAILS(value)
      }
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

button.v-btn--fab {
  z-index: 99999 !important;
}
</style>
