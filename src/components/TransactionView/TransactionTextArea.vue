<template>
  <v-textarea
    dense
    flat
    hide-details
    filled
    :data-testid="dataTestid"
    :value="value"
    @blur="onApply"
    @change="onApply"
    @keyup.enter="onApply"
    class="mas-0"
    :rows="rows"
  />
</template>

<script>

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 2,
    },
    dataTestid: {
      type: String,
      default: '',
    }
  },
  methods: {
    onApply(event) {
      this.$emit("apply", event)
    }
  }
}
</script>