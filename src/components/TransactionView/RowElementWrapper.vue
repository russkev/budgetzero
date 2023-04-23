<template>
  <v-sheet
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
import { mapGetters } from 'vuex'

export default {
  props: {
    right: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['selectedTransactions'])
  },
  methods: {
    onClick() {
      if (!this.disabled && this.selectedTransactions.length === 0) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style>
.transaction-row-sheet {
  cursor: default;
  height: 100%;
  display: flex;
}
</style>
