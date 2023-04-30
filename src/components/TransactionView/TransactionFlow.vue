<template>
  <transaction-hover-container :hover="hover" :item="item">
    <row-element-wrapper @click="onTransactionDetailsClick(item)" right :disabled="tableIsDisabled">
      <span
        :class="`my-auto ellipsis text-body-1 ${
          tableIsDisabled ? 'text-disabled' : textColor + '--text text--lighten-3'
        }`"
      >
        {{ value }}
      </span>
    </row-element-wrapper>
  </transaction-hover-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowElementWrapper from './RowElementWrapper.vue'
import TransactionHoverContainer from './TransactionHoverContainer.vue'

export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    isOutflow: {
      type: Boolean,
      default: false,
      required: true
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
    ...mapGetters('accountTransactions', ['tableIsDisabled']),
    value() {
      if (this.isOutflow && this.item.value < 0) {
        return this.intlCurrency.format(Math.abs(this.item.value / 100))
      } else if (!this.isOutflow && this.item.value >= 0) {
        return this.intlCurrency.format(this.item.value / 100)
      } else {
        return ''
      }
    },
    textColor() {
      return this.isOutflow ? 'error' : 'success'
    }
  },
  methods: {
    ...mapActions('accountTransactions', ['onTransactionDetailsClick'])
  }
}
</script>
