<template>
  <div>
    <currency-input autofocus input-testid="details-value" v-model="valueData" class="pb-2" />
    <details-flow-direction />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import CurrencyInput from '../Shared/CurrencyInput.vue'

export default {
  components: {
    CurrencyInput
  },
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction']),
    valueData: {
      get() {
        return this.editedTransaction.value
      },
      set(value) {
        if (this.isInflow) {
          this.SET_EDITED_TRANSACTION_VALUE(value)
        } else {
          this.SET_EDITED_TRANSACTION_VALUE(-value)
        }
      }
    },
    isInflow() {
      return this.editedTransaction.value >= 0
    }
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_EDITED_TRANSACTION_VALUE'])
  }
}
</script>
