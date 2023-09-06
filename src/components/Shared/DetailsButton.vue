<template>
  <v-btn
    :to="to"
    text
    class="no-uppercase justify-start test-h5"
    :width="width"
    v-on="on"
    v-bind="attrs"
    @click="onClick"
    exact
    :loading="loading"
    :disabled="disabled"
  >
    <v-icon left :size="iconSize">
      {{ icon }}
    </v-icon>
    {{ label }}
  </v-btn>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    on: {
      type: Object,
      required: false
    },
    attrs: {
      type: Object,
      required: false
    },
    width: {
      type: String,
      required: false,
      default: '140px'
    },
    iconSize: {
      type: String,
      required: false,
      default: 'default'
    },
    to: {
      type: Object,
      required: false,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    onClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style>
.no-uppercase {
  text-transform: unset !important;
}

.justify-start {
  justify-content: flex-start !important;
}
</style>
