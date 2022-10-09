<template>
  <v-switch v-model="clearedStatus" flat inset dense :label="`Cleared: ${clearedStatus}`"/>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    clearedStatus: {
      get() {
        return this.editedTransaction.cleared;
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_CLEARED(value);
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_CLEARED"]),
  },
}
</script>