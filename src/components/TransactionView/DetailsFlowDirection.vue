<template>
  <div class="ml-3">
    <!-- <div class="pb-2">
      <v-icon data-testid="details-inflow-button" left small :color="isInflow ? 'primary' : ''" @click="isInflow = true">
        {{ isInflow ? "mdi-radiobox-marked" : "mdi-radiobox-blank" }}
      </v-icon>
      Inflow
    </div>
    <div>
      <v-icon data-testid="details-outflow-button" left small :color="isInflow ? '' : 'primary'" @click="isInflow = false">
        {{ isInflow ? "mdi-radiobox-blank" : "mdi-radiobox-marked" }}
      </v-icon>
      Outflow
    </div> -->
    <details-radio :selected="isInflow" data-testid="details-inflow-button" @click="isInflow = true" class="pb-2">
      Inflow
    </details-radio>
    <details-radio :selected="!isInflow" data-testid="details-outflow-button" @click="isInflow = false" class="pb-2">
      Outflow
    </details-radio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import DetailsRadio from '../Shared/DetailsRadio.vue'

export default {
  props: {
    value: {
      type: Boolean,
      default: true
    }
  },
  components: {
    DetailsRadio
  },
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction']),
    isInflow: {
      get() {
        return this.editedTransaction.value >= 0
      },
      set(value) {
        if (value && this.editedTransaction.value < 0) {
          this.SET_EDITED_TRANSACTION_VALUE(Math.abs(this.editedTransaction.value))
          this.REVERSE_EDITED_TRANSACTION_SPLIT_VALUES()
        } else if (!value && this.editedTransaction.value > 0) {
          this.SET_EDITED_TRANSACTION_VALUE(-Math.abs(this.editedTransaction.value))
          this.REVERSE_EDITED_TRANSACTION_SPLIT_VALUES()
        }
        this.$emit('input', value)
      }
    }
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_EDITED_TRANSACTION_VALUE', 'REVERSE_EDITED_TRANSACTION_SPLIT_VALUES'])
  }
}
</script>

<style>
.small-radio i.v-icon.v-icon--dense {
  font-size: 1rem;
}

.small-radio div.v-input--selection-controls__input > div.v-input--selection-controls__ripple {
  margin: 0;
  width: 23px;
  height: 23px;
  top: 0 !important;
  left: 1px;
}
</style>
