<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title ma-0 ml-2">
    <v-card-title class="primary darken-3 pa-3">Working</v-card-title>
    <categories-working />
    <v-card-title class="primary darken-3 pa-3">Transactions</v-card-title>
    <v-data-table :headers="transactionHeaders" :items="monthTransactions" dense>
      <template #item="{ item }">
        <tr>
          <td>
            {{ item.date }}
          </td>
          <td>
            <description-tooltip :item="item">
              <template #activator="{on}">
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
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import CategoriesWorking from './CategoriesWorking.vue'
import DescriptionTooltip from "../Shared/DescriptionTooltip.vue"
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CategoryDetails',
  components: {
    CategoriesWorking
  },
  mounted() {
    this.getMonthTransactions()
  },
  beforeRouteUpdate(to, from, next) {
    this.getMonthTransactions();
    next();
  },
  watch: {
    masterCategoriesById: {
      handler: function () {
        this.getMonthTransactions()
      }
    }
  },
  computed: {
    ...mapGetters(['masterCategoriesById', 'selectedBudgetId', 'intlCurrency']),
    ...mapGetters('categoryMonth', ['selectedMonth', 'transactionHeaders', 'monthTransactions']),
    transactions() {
      let mc = this.masterCategoriesById
      this.getMonthTransactions().then(() => {
        return this.monthTransactions
      })
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
