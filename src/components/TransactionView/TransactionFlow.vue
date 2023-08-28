<template>
  <row-element-wrapper @click="onTransactionDetailsClick(item)" right :disabled="tableIsDisabled" :is-top="isTop">
    <span
      :class="`my-auto ellipsis text-body-1 ${tableIsDisabled ? 'text-disabled' : textColor}`"
      :style="`${big ? 'font-size: 1.25rem !important;' : ''}`"
    >
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
    },
    isBothDirections: {
      type: Boolean,
      default: false
    },
    isTop: {
      type: Boolean,
      default: false
    },
    big: {
      type: Boolean,
      default: false
    }
  },
  components: {
    RowElementWrapper
  },
  computed: {
    ...mapGetters(['intlCurrency']),
    ...mapGetters('accountTransactions', ['tableIsDisabled']),
    value() {
      if (this.isBothDirections) {
        return this.intlCurrency.format(this.item.value / 100)
      }

      if (this.isOutflow && this.item.value < 0) {
        return this.intlCurrency.format(Math.abs(this.item.value / 100))
      } else if (!this.isOutflow && this.item.value >= 0) {
        return this.intlCurrency.format(this.item.value / 100)
      } else {
        return ''
      }
    },
    textColor() {
      if (this.isBothDirections) {
        return valueColor(this.item.value)
      } else {
        return this.isOutflow ? valueColor(-1) : valueColor(1)
      }
    }
  },
  methods: {
    ...mapActions('accountTransactions', ['onTransactionDetailsClick'])
  }
}
</script>
