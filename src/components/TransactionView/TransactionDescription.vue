<template>
  <v-card
    :disabled="selectedTransactions.length > 0"
    class="px-0 py-1 ma-0"
    tile
    flat
    color="transparent"
    @click="onClick"
    :ripple="false"
  >
    <span class="ellipsis text-body-1">
      {{ previewDescription }}
    </span>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { DEFAULT_TRANSACTION } from "@/constants";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", [
      "selectedTransactions",
    ]),
    previewDescription() {
      if (this.item.note) {
        return this.item.note;
      } else if (this.item.payee) {
        return this.item.payee;
      } else if (this.item.memo) {
        return this.item.memo;
      } else {
        return "";
      }
    },
  },
  methods: {
    ...mapActions("accountTransactions", ["editTransaction"]),
    onClick() {
      this.editTransaction(this.item);
    },
  },
};
</script>

<style>
.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.transaction-row-card {
  display: flex;
}
</style>
