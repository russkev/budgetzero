<template>
  <row-element-wrapper
    right
    :class="`text-right my-auto ${tableIsDisabled ? 'text-disabled' : ''}`"
    :disabled="tableIsDisabled"
    :is-bottom="isBottom"
    @click="onTransactionDetailsClick(item)"
  >
    {{ intlCurrency.format((item.balance + initialBalance) / 100) }}
  </row-element-wrapper>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowElementWrapper from './RowElementWrapper.vue'

export default {
  props: {
    item: {
      type: Object
    },
    isBottom: {
      type: Boolean,
      default: false
    }
  },
  components: {
    RowElementWrapper
  },
  computed: {
    ...mapGetters(['intlCurrency']),
    ...mapGetters('accountTransactions', ['tableIsDisabled', 'initialBalance'])
  },
  methods: {
    ...mapActions('accountTransactions', ['onTransactionDetailsClick'])
  }
}
</script>

<style>
.text-right {
  text-align: right;
}
</style>
