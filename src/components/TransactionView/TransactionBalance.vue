<template>
  <transaction-hover-container :hover="hover" :item="item">
    <row-element-wrapper @click="onTransactionDetailsClick(item)" class="text-right" right :disabled="tableIsDisabled">
      <span :class="`my-auto ${tableIsDisabled ? 'text-disabled' : ''}`">
        {{ intlCurrency.format(item.balance / 100) }}
      </span>
    </row-element-wrapper>
  </transaction-hover-container>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import RowElementWrapper from './RowElementWrapper.vue'
import TransactionHoverContainer from './TransactionHoverContainer.vue'

export default {
  props: {
    item: {
      type: Object
    },
    hover: {
      type: Boolean,
      default: false
    }
  },
  components: {
    RowElementWrapper,
    TransactionHoverContainer
  },
  computed: {
    ...mapGetters(['intlCurrency']),
    ...mapGetters('accountTransactions', ['tableIsDisabled'])
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
