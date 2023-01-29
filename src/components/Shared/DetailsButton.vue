<template>
  <v-btn
    text
    class="no-uppercase justify-start test-h5"
    width="140px"
    v-on="on"
    v-bind="attrs"
    @click="onClick"
    >
    <v-icon left>
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
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    on: {
      type: Object,
      required: false,
    },
    attrs: {
      type: Object,
      required: false,
    },
  },
  methods: {
    onClick(event) {
      this.$emit('click', event);
    },
  }
};
</script>

<style>
.no-uppercase {
  text-transform: unset !important;
}

.justify-start {
  justify-content: flex-start !important;
}
</style>
