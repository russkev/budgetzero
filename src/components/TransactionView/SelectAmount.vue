<template>
  <v-text-field
    :value="amount"
    suffix="$"
    reverse
    dense
    hide-details
    :rules="[currencyRule]"
    @blur="onApply($event)"
    @change="onApply($event)"
    @mousedown="onApply($event)"
    @keyup.enter="
      onApply($event)
      onSave()
    "
  />
</template>

<script>
export default {
  emits: ["apply", "save"],
  props: {
    amount: {
      type: String,
      default: "",
    },
    // item: {
    //   type: Object,
    //   default: {}
    // },
    // onApply: {
    //   type: Function,
    //   default: null,
    // },
    // onSave: {
    //   type: Function,
    //   default: null,
    // }
  },
  data() {
    return {
      currencyRule: (value) => {
        return value !== undefined && (value.length === 0 || !isNaN(value));
      }
    }
  },
  methods: {
    onApply(event) {
      this.$emit('apply', event)
    },
    onSave() {
      this.$emit('save')
    },
  }
}
</script>