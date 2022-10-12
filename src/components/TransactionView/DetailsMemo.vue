<template>
  <v-hover v-slot="{ hover }">
    <div>
      <v-textarea
        v-model="memo"
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
    </div>
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
    memo: {
      get() {
        return this.editedTransaction.memo;
      },
      set(memo) {
        this.SET_EDITED_TRANSACTION_MEMO(memo);
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_MEMO"]),
  },
};
</script>
