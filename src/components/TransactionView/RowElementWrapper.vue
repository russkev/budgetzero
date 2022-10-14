<template>
    <v-sheet
    :disabled="selectedTransactions.length > 0"
    class="px-0 py-1 ma-0 transaction-row-sheet"
    tile
    flat
    color="transparent"
    @click="onClick"
    :ripple="false"
    :style="right ? 'justifyContent: flex-end' : ''"
  >
  <slot></slot>
  </v-sheet>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { nextTick } from "vue";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
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
  methods: {
    ...mapActions("accountTransactions", ["editTransaction"]),
    ...mapMutations("accountTransactions", ["CLEAR_SELECTED_TRANSACTIONS"]),
    onClick() {
      if (this.selectedTransactions.length > 0) {
        this.CLEAR_SELECTED_TRANSACTIONS();
        nextTick(() => {
          this.editTransaction(this.item);
        });
      } else {
        this.editTransaction(this.item);
      }
    },
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