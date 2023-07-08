<template>
  <v-hover v-slot="{ hover }">
    <div data-testid="details-note">
      <v-textarea
        v-model="note"
        class="text-body-1"
        dense
        flat
        solo
        hide-details
        :background-color="isFocused || hover ? 'background lighten-2' : 'transparent'"
        :readonly="!isFocused"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.enter.ctrl.exact.prevent="onCtrlEnter"
        @keydown.esc.prevent="onEsc"
      />
    </div>
  </v-hover>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      isFocused: false
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction']),
    note: {
      get() {
        return this.editedTransaction.note
      },
      set(note) {
        this.SET_EDITED_TRANSACTION_NOTE(note)
      }
    }
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_EDITED_TRANSACTION_NOTE']),
    onCtrlEnter() {
      this.$emit('ctrl-enter')
    },
    onEsc() {
      this.$emit('esc')
    }
  }
}
</script>
