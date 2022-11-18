<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title ma-0 ml-2">
    <v-card-title class="primary darken-3 pa-3">Working</v-card-title>
    <categories-working />
    <v-card-title class="primary darken-3 pa-3">Transactions</v-card-title>
    <v-data-table :headers="transactionHeaders" :items="transactions" dense>
      <template #item="{ item }">
        <tr>
          <!-- <td>
            {{ item.date }}
          </td> -->
          <td>
            <description-tooltip :item="item">
              <template #activator="{ on }">
                <div class="ellipsis" v-on="on">{{ item.memo }}</div>
              </template>
            </description-tooltip>
          </td>
          <td>
            {{ item.account }}
          </td>
          <td>
            {{ intlCurrency.format(item.amount / 100) }}
          </td>
          <td>
            {{ intlCurrency.format(item.balance / 100) }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import CategoriesWorking from './CategoriesWorking.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CategoryDetails',
  components: {
    CategoriesWorking
  },
  watch: {
    masterCategoriesById: {
      handler: function () {
        this.getMonthTransactions()
      }
    }
  },
  computed: {
    ...mapGetters(['masterCategoriesById', 'intlCurrency']),
    ...mapGetters('categoryMonth', ['transactionHeaders', 'monthTransactions', 'selectedCategory']),
    transactions() {
      // this.monthTransactions.reduce((partial, monthTransaction))
      let balance = 0
      return this.monthTransactions.reverse().reduce((partial, monthTransaction) => {
        if (!this.selectedCategory || monthTransaction.category === this.selectedCategory._id) {
          balance += monthTransaction.amount
          partial.push({
            ...monthTransaction,
            balance: balance,
          })
        }
        return partial
      }, []).reverse()

      // if (this.selectedCategory) {
      //   return this.monthTransactions.filter((transaction) => transaction.category === this.selectedCategory._id)
      // } else {
      //   return this.monthTransactions
      // }
    }
  },
  methods: {
    ...mapActions(['fetchTransactionsForMonth']),
    ...mapActions('categoryMonth', ['getMonthTransactions'])
  }
}
</script>

<style>
.category-details-title {
  width: 100%;
}
</style>
