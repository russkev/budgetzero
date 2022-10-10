<template>
  <span>
    {{ intlCurrency.format(item.balance / 100) }}
  </span>
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
    ...mapGetters(["intlCurrency"]),
  },
};
</script>
