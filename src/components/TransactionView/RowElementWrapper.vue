<template>
    <v-sheet
    :disabled="selectedTransactions.length > 0"
    class="px-0 py-1 ma-0 transaction-row-sheet"
    tile
    flat
    color="transparent"
    @click="$emit('click')"
    :ripple="false"
    :style="right ? 'justifyContent: flex-end' : ''"
  >
  <slot></slot>
  </v-sheet>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    right: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    ...mapGetters("accountTransactions", [
      "selectedTransactions",
    ]),
  },
};
</script>


<style>
.transaction-row-sheet {
  cursor: default;
  height: 100%;
  display: flex;

}
</style>