<template>
  <div v-if="item._id !== editedTransaction._id">
    {{ intlCurrency.format(item.balance / 100) }}
  </div>
</template>

<script>
import { mapGetters } from "vuex";

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
};
</script>
