<template>
  <div v-if="item._id !== editedTransaction._id" class="text-body-2">
    {{ intlCurrency.format(item.balance / 100) }}
  </div>
  <div v-else>
    <v-btn icon @click="toggleSplit" data-testid="splits-button">
      <v-icon>mdi-call-split</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { NONE } from "../../constants";

export default {
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    ...mapGetters(["intlCurrency"]),
  },
  methods: {
    ...mapMutations("accountTransactions", ["PUSH_EDITED_TRANSACTION_SPLIT", "CLEAR_EDITED_TRANSACTION_SPLIT"]),
    toggleSplit() {
      if(this.editedTransaction.splits.length < 1) {
        this.PUSH_EDITED_TRANSACTION_SPLIT({ category: this.editedTransaction.category, value: 0 })
        this.PUSH_EDITED_TRANSACTION_SPLIT({ category: NONE._id, value: this.editedTransaction.value })
      } else {
        this.CLEAR_EDITED_TRANSACTION_SPLIT()
      }
    }
  }
};
</script>