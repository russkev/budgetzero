<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title ma-0 ml-2">
    <v-card-title class="primary darken-3 pa-3">Working</v-card-title>
    <categories-working />
    <v-card-title class="primary darken-3 pa-3">Transactions</v-card-title>
    <v-data-table :headers="transactionHeaders" :items="transactions" dense group-by="group" disable-sort>
      <template #group.header="{ items }">
        <td colspan="20">
          {{ formatDate(items[0].date) }}
        </td>
      </template>
      <template #item="{ item }">
        <tr>
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
import { formatDate } from '../../helper'
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
      let balance = 0
      let monthTransactions = JSON.parse(JSON.stringify(this.monthTransactions))
      const length = monthTransactions.length
      let result = []
      for (let i = length - 1; i >= 0; i--) {
        const monthTransaction = monthTransactions[i]
        if (!this.selectedCategory || monthTransaction.category === this.selectedCategory._id) {
          balance += monthTransaction.amount
          result.push({
            ...monthTransaction,
            balance: balance
          })
        }
      }
      return result.reverse()
    }
  },
  methods: {
    ...mapActions(['fetchTransactionsForMonth']),
    ...mapActions('categoryMonth', ['getMonthTransactions']),
    formatDate: formatDate
  }
}
</script>

<style>
.category-details-title {
  width: 100%;
  overflow-y: auto;
}
</style>
