<template>
  <v-hover v-slot="{ hover }">
    <v-textarea
      v-model="note"
      class="text-body-1"
      dense
      flat
      solo
      hide-details
      @focus="isFocused = true"
      @blur="isFocused = false"
      :background-color="isFocused || hover ? 'background lighten-2' : 'transparent'"
      :readonly="!isFocused"
    />

  </v-hover>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  data() {
    return {
      isFocused: false,
    };
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    note: {
      get() {
        return this.editedTransaction.note;
      },
      set(note) {
        this.SET_EDITED_TRANSACTION_NOTE(note);
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_NOTE"]),
  }
}

</script>