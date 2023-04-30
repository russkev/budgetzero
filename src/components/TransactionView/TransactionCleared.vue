<template>
  <v-hover v-slot="{ hover }" v-if="this.item.cleared">
    <v-icon
      :size="size"
      class="cleared-icon mx-1"
      :color="`${hover ? 'success darken-3' : 'success'}`"
      @click="toggleCleared()"
      :disabled="isDisabled"
      :style="isDisabled ? 'color: var(--v-background-lighten5) !important;' : ''"
    >
      mdi-alpha-c-circle
    </v-icon>
  </v-hover>
  <v-hover v-slot="{ hover }" v-else>
    <v-icon
      :size="size"
      class="uncleared-icon mx-1"
      :color="`${hover ? 'white' : 'secondary darken-3'}`"
      :style="isDisabled ? 'color: transparent !important;' : ''"
      :disabled="isDisabled"
      @click="toggleCleared()"
    >
      mdi-alpha-c-circle
    </v-icon>
  </v-hover>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  props: {
    item: {
      type: Object
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      size: 20
    }
  },
  computed: {
    ...mapGetters('accountTransactions', [
      'editedTransactionIndex',
      'transactions',
      'editedTransaction',
      'selectedTransactions',
      'tableIsDisabled'
    ]),
    isDisabled() {
      return this.editedTransaction._id === this.item._id || this.tableIsDisabled
    }
  },
  methods: {
    ...mapMutations('accountTransactions', [
      'SET_EDITED_TRANSACTION_CLEARED',
      'SET_EDITED_TRANSACTION',
      'CLEAR_EDITED_TRANSACTION'
    ]),
    ...mapActions('accountTransactions', ['prepareEditedItem', 'getTransactions']),
    ...mapActions(['createOrUpdateTransaction']),
    toggleCleared() {
      if (this.editedTransaction._id === this.item._id) {
        this.SET_EDITED_TRANSACTION_CLEARED(!this.editedTransaction.cleared)
        return
      }

      this.SET_EDITED_TRANSACTION({ ...this.item, cleared: !this.item.cleared })
      this.prepareEditedItem()
      const payload = { current: this.editedTransaction, previous: this.item }
      this.createOrUpdateTransaction(payload).then(() => this.getTransactions())
      this.CLEAR_EDITED_TRANSACTION()
    }
  }
}
</script>
