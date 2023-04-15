<template>
  <details-button :icon="icon" :label="label" @click="click" width="240px" class="mb-2" />
</template>

<script>
import DetailsButton from '../TransactionView/DetailsButtons.vue'

export default {
  name: 'LandingPageButton',
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
    }
  },
  methods: {
    click() {
      this.$emit('click')
    }
  }
}
</script>
