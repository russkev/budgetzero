<template>
  <row-element-wrapper @click="onTransactionDetailsClick(item)" right :disabled="tableIsDisabled">
    <span :class="`my-auto ellipsis text-body-1 ${tableIsDisabled ? 'text-disabled' : textColor}`">
      {{ value }}
    </span>
  </row-element-wrapper>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowElementWrapper from './RowElementWrapper.vue'
import { valueColor } from '../../helper'

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
    }
  },
  components: {
    RowElementWrapper
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
      return this.isOutflow ? valueColor(-1) : valueColor(1)
    }
  },
  methods: {
    ...mapActions('accountTransactions', ['onTransactionDetailsClick'])
  }
}
</script>
