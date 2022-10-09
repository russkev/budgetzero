<template>
  <div class="pl-2">

    <v-icon
    v-if="isSelected"
      :size="size"
      @click="toggleSelected"
      color="primary"
      >
      mdi-checkbox-marked
    </v-icon>
    <v-icon
      v-else
      :size="size"
      @click="toggleSelected"
      :color="isVisible(hover) ? 'grey lighten-2' : 'transparent'"
      >
      mdi-checkbox-blank-outline
    </v-icon>
</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    isSelected: {
      type: Boolean,
      default: false,
    },
    hover: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      size: 20,
    }
  },
  computed: {
    ...mapGetters("accountTransactions", ["selectedTransactions", "isCreatingNewTransaction"]),
  },
  methods: {
    toggleSelected() {
      // this.isSelected = !this.isSelected;
      this.$emit("input", !this.isSelected);
    },
    isVisible(hover) {
      return !this.isCreatingNewTransaction && (hover || this.selectedTransactions.length > 0);
      // return hover
    },
  },
};
</script>

<style>
/* .transaction-checkbox .v-icon {
  color: inherit !important;
} */
</style>
