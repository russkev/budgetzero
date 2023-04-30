<template>
  <fragment>
    <slot></slot>
  </fragment>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'TransactionHoverContainer',
  props: {
    hover: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      required: true
    }
  },
  watch: {
    hover(val) {
      if (val) {
        this.SET_HOVER_ID(this.item._id)
      } else {
        this.CLEAR_HOVER_ID()
      }
    }
  },
  methods: {
    ...mapMutations('accountTransactions', ['SET_HOVER_ID', 'CLEAR_HOVER_ID'])
  }
}
</script>
