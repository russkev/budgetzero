<template>
  <v-row class="ma-0 px-0 py-1 mb-2 category-card background lighten-1">
    <header-row>
      <template #title>
        <span class="text-h4 ml-3 amber--text" data-testid="uncategorized-name"> Uncategorized </span>
      </template>
      <template #spent>
        <div data-testid="uncategorized-spent">
          <span class="text-h5"> Spent </span>
          <br />
          <span class="text-body-1">
            {{ intlCurrency.format(spent / 100) }}
          </span>
        </div>
      </template>
      <template #balance>
        <div data-testid="uncategorized-balance">
          <span class="text-h5"> Balance </span>
          <br />
          <span class="text-body-1">
            {{ intlCurrency.format(balance / 100) }}
          </span>
        </div>
      </template>
    </header-row>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import HeaderRow from './HeaderRow.vue'
import { NONE } from '../../constants'
import _ from 'lodash'

export default {
  components: {
    HeaderRow
  },
  data() {
    return {
      id: NONE._id
    }
  },
  computed: {
    ...mapGetters(['intlCurrency']),
    ...mapGetters('categoryMonth', ['masterCategoriesStats']),
    spent() {
      const value =
        _.get(this.masterCategoriesStats, [this.id, 'expense'], 0) -
        _.get(this.masterCategoriesStats, [this.id, 'income'], 0)

      return value
    },
    balance() {
      return _.get(this.masterCategoriesStats, [this.id, 'balance'], 0)
    }
  }
}
</script>
