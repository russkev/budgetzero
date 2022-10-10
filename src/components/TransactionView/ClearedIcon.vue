<template>
  <v-icon
    v-if="isCleared"
    :size="size"
    class="cleared-icon"
    color="success"
  >
    mdi-alpha-c-circle
  </v-icon>
  <v-icon
    v-else
    :size="size"
    class="cleared-icon"
    :color="hover ? 'background lighten-5' : 'transparent'"
  >
    mdi-alpha-c-circle
  </v-icon>
</template>

<script>

export default {
  props: {
    isCleared: {
      type: Boolean,
      required: true
    },
    size: {
      type: Number,
      default: 24
    },
    hover: {
      type: Boolean,
      default: false
    }
  }
}

</script>