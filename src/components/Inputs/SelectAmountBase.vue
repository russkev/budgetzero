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
      console.log("ON BLUR CALLED")
      this.isSelected = false
    },
    onSave() {
      this.$emit('save')
      this.isSelected = false
    },
    onClick(event) {
      // console.log("Start", event.target.selectionStart)
      // console.log("End", event.target.selectionEnd)
      
      if (!this.isSelected) {
        event.target.select()
        this.isSelected = true
      }

    }
  }
}
</script>