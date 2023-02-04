<template>
  <v-btn text width="min-content" @click="$emit('click')">
    <v-icon left>{{ icon }}</v-icon>
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: 'ButtonTransparent',
  props: {
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
