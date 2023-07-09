<template>
  <v-sheet class="flex-table-container ma-0 pa-0">
    <v-data-table
      dense
      group-by="group"
      fixed-header
      disable-sort
      class="transactions-table flex-table-main background lighten-1"
      :items="transactions"
      :headers="transactionHeaders"
      :items-per-page="20"
      :page.sync="pageNumber"
      :footer-props="{
        'items-per-page-options': [5, 10, 20, 50, 100, 200],
        'items-per-page-text': 'rows'
      }"
      @keydown.esc.prevent="onEsc"
    >
      <template #group.header="{ items }">
        <td colspan="20" class="date-row background pl-1">
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
  </v-sheet>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { formatDate } from '../../helper'

export default {
  name: 'DetailsTable',
  computed: {
    ...mapGetters(['intlCurrency']),
    ...mapGetters('categoryMonth', ['transactionHeaders', 'monthTransactions', 'selectedCategory', 'tablePageNumber']),
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
    },
    pageNumber: {
      get() {
        return this.tablePageNumber
      },
      set(value) {
        this.onPageNumberChanged(value)
      }
    }
  },
  methods: {
    ...mapActions('categoryMonth', ['onPageNumberChanged']),
    formatDate: formatDate,
    // onPagination(paginationData) {
    //   console.log('onPagination', paginationData)
    // },
    onEsc() {
      this.$emit('esc')
    }
  }
}
</script>
