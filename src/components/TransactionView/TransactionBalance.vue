<template>
  <row-element-wrapper @click="onTransactionDetailsClick(item)" class="text-right" right :disabled="tableIsDisabled">
    <span :class="`my-auto ${tableIsDisabled ? 'text-disabled' : ''}`">
      {{ intlCurrency.format((item.balance + initialBalance) / 100) }}
    </span>
  </row-element-wrapper>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import RowElementWrapper from './RowElementWrapper.vue'

export default {
  props: {
    item: {
      type: Object
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
