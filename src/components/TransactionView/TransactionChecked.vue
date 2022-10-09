<template>
  <v-simple-checkbox 
    :value="isSelected"
    :ripple="false"
    :disabled="expandedTransactions.length > 0"
    v-on="$listeners"
  />
</template>

<script>
import { mapGetters } from "vuex"

export default {
  props: {
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["expandedTransactions"])
  }
};
</script>