<template>
  <v-text-field
    dark
    dense
    flat
    solo
    :hide-details="!showDetails"
    :class="`ma-0 pa-0 text-${text}`"
    :id="id"
    :ref="id"
    :data-testid="dataTestid"
    :value="isEditing || !currency ? value : intlCurrency.format(value)"
    :suffix="currency && isEditing ? '$' : ''"
    :height="height"
    :background-color="isEditing ? activeBackgroundColor : 'transparent'"
    :disabled="loading || disabled"
    :placeholder="placeholder"
    :rules="rules"
    :reverse="(currency && isEditing) || (currency && !currencyLeft)"
    @focus="onFocus"
    @change="onApply"
    @blur="onBlur"
    @keyup.enter="onEnterPressed"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  emits: ['input', 'edit'],
  props: {
    isEditing: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    },
    dataTestid: {
      type: String,
      default: ''
    },
    currency: {
      type: Boolean,
      default: false
    },
    currencyLeft: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: 'body-1'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    activeBackgroundColor: {
      type: String,
      default: 'background lighten-2'
    },
    placeholder: {
      type: String,
      default: ''
    },
    rules: {
      type: Array,
      default: () => []
    },
    showDetails: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (this.isEditing) {
      this.onFocus()
    }
  },
  watch: {
    isEditing: {
      handler: function (new_value, old_value) {
        if (new_value && !old_value) {
          this.isFocused = false
          this.onFocus()
        }
      }
    },
    id: {
      handler: function (new_value, old_value) {
        if (this.isEditing && new_value !== old_value) {
          this.isFocused = false
          this.onFocus()
        }
      }
    }
  },
  data() {
    return {
      height: '26px',
      isHovering: false,
      isFocused: false,
      prevIsEditing: false,
      applyClickedDebounce: false
    }
  },
  computed: {
    ...mapGetters(['intlCurrency']),
    nonEditingBackgroundColor() {
      if (this.isHovering) {
        return this.activeBackgroundColor
      } else {
        return this.backgroundColor
      }
    }
  },
  methods: {
    onBlur(event) {
      this.onApply(event.target.value)
    },
    onApply(event) {
      this.isFocused = false
      if (this.applyClickedDebounce || !this.isEditing) {
        return
      }
      if (typeof event !== 'string' && !(event instanceof String)) {
        console.warn('StringInput: onApply called with non-string event', event)
        return
      }
      const element = document.getElementById(this.id)
      if (element) {
        element.blur()
      }
      this.$emit('input', event)
      this.applyClickedDebounce = true
      setTimeout(() => {
        this.applyClickedDebounce = false
      }, 10)
    },
    onFocus() {
      if (this.isEditing && this.isFocused) {
        return
      }
      this.$emit('edit')
      setTimeout(() => {
        const element = document.getElementById(this.id)
        if (element) {
          element.select()
        }
        this.isFocused = true
      }, 0)
    },
    onEnterPressed(event) {
      this.onApply(event.target.value)
    }
  }
}
</script>

<style>
.v-text-field .v-input__control .v-input__slot {
  min-height: 0px !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
}
.v-text-field .v-input__control {
  min-height: 0px !important;
}
</style>
