<template>
  <v-sheet
    :class="`px-0 ${py} ma-0 transaction-row-sheet`"
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
    },
    isTop: {
      type: Boolean,
      default: false
    },
    isBottom: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['selectedTransactions']),
    py() {
      if (this.isTop) {
        return 'pt-1'
      } else if (this.isBottom) {
        return 'pb-1'
      } else {
        return 'py-1'
      }
    }
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
