<template>
  <currency-input id="splits-total" v-model="splitValue" right :input-testid="inputTestid" />
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import CurrencyInput from '../Shared/CurrencyInput.vue'
import _ from 'lodash'

export default {
  components: { CurrencyInput },
  props: {
    index: {
      type: Number,
      required: true
    },
    inputTestid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      over: 0
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction']),
    splitValue: {
      get() {
        return _.get(this.editedTransaction, `splits[${this.index}].value`, 0)
      },
      set(value) {
        const negative = this.editedTransaction.value < 0 ? -1 : 1
        this.SET_EDITED_TRANSACTION_SPLIT_VALUE({ index: this.index, value: value * negative })
        this.recalculateSplits()
      }
    },
    editedTransactionValue() {
      return this.editedTransaction.value
    },
    editedSplitsLength() {
      return this.editedTransaction.splits.length
    }
  },
  watch: {
    editedTransactionValue() {
      this.recalculateSplits()
    },
    editedSplitsLength() {
      this.recalculateSplits()
    }
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_EDITED_TRANSACTION_SPLIT_VALUE']),
    recalculateSplits() {
      if (!this.editedTransaction.splits || this.editedTransaction.splits.length < 2) {
        return
      }
      const negative = this.editedTransaction.value < 0 ? -1 : 1
      const sum = this.editedTransaction.splits.reduce((partial, split) => partial + Math.abs(split.value), 0)
      let difference = Math.abs(this.editedTransaction.value) - sum
      if (difference === 0) {
        return
      }

      let i = this.index + 1
      while (difference !== 0) {
        if (i >= this.editedTransaction.splits.length) {
          i = 0
        }
        if (i === this.index) {
          break
        }
        const split_value = Math.abs(this.editedTransaction.splits[i].value)
        const new_value = Math.max(split_value + difference, 0)
        difference = difference - (new_value - split_value)
        this.SET_EDITED_TRANSACTION_SPLIT_VALUE({
          index: i,
          value: new_value * negative
        })
        i += 1
      }
      this.over = difference
    }
  }
}
</script>
