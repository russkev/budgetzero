<template>
  <v-text-field
    :value="amount"
    suffix="$"
    reverse
    dense
    hide-details
    :rules="[currencyRule]"
    @click="onClick($event)"
    @blur="
      onApply($event)
      onBlur()
    "
    @change="onApply($event)"
    @mousedown="onApply($event)"
    @keyup.enter="
      onApply($event)
      onSave()
    "
    :disabled="disabled"
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
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      currencyRule: (value) => {
        return value !== undefined && (value.length === 0 || !isNaN(value));
      },
      isSelected: false
    }
  },
  methods: {
    onApply(event) {
      this.$emit('apply', event)
    },
    onBlur() {
      this.isSelected = false
    },
    onSave() {
      this.$emit('save')
      this.isSelected = false
    },
    onClick(event) {
      if (!this.isSelected) {
        event.target.select()
        this.isSelected = true
      }

    }
  }
}
</script>