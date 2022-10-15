<template>
  <div class="checkbox-container pl-0" style="height: 100%;">
    <v-sheet width="3px" min-width="3px" :color="leftColor" height="100%" class="row-checkbox ml-0 mr-2" />
    <v-icon v-if="isSelected" :size="size" @click="toggleSelected" color="primary">
      mdi-checkbox-marked
    </v-icon>
    <v-icon
      v-else
      :size="size"
      @click="toggleSelected"
      :color="isVisible(hover) ? 'grey lighten-2' : 'background lighten-3'"
    >
      mdi-checkbox-blank-outline
    </v-icon>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { isUncategorized } from "../../store/modules/transaction-module";

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
    item: {
      type: Object,
    },
  },
  data() {
    return {
      size: 20,
    };
  },
  computed: {
    ...mapGetters("accountTransactions", ["selectedTransactions", "isCreatingNewTransaction"]),
    leftColor() {
      if (isUncategorized(this.item)) {
        return "primary darken-1";
      } else {
        return "transparent";
      }
    },
  },
  methods: {
    toggleSelected() {
      this.$emit("input", !this.isSelected);
    },
    isVisible(hover) {
      return !this.isCreatingNewTransaction && (hover || this.selectedTransactions.length > 0);
    },
  },
};
</script>

<style>
.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
