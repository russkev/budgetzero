<template>
  <details-button :icon="icon" :label="label" @click="click" :width="width" class="mb-2" :to="to" />
  <!-- <router-link :to="to">{{ label }}</router-link> -->
</template>

<script>
import DetailsButton from '../TransactionView/DetailsButtons.vue'

export default {
  name: 'LandingButton',
  components: {
    DetailsButton
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    to: {
      type: String | Object,
      required: true
    },
    width: {
      type: String,
      required: false,
      default: '240px'
    }
  },
  methods: {
    click() {
      this.$emit('click')
    }
  }
}
</script>
