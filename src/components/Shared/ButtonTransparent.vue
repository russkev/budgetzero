<template>
  <v-btn text :small="small" width="min-content" @click="$emit('click')" :disabled="disabled" v-on="on">
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
    },
    disabled: {
      type: Boolean,
      default: false
    },
    on: {
      type: Object,
      required: false,
      default: () => {}
    },
    small: {
      type: Boolean,
      default: false
    }
  }
}
</script>
