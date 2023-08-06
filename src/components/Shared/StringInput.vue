<template>
  <v-text-field
    dark
    dense
    flat
    solo
    :hide-details="!showDetails"
    :class="`ma-0 pa-0 text-${text}`"
    :id="id"
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
  <!-- :reverse="currency && !currencyLeft && isEditing" -->
</template>

<script>
import { mapGetters } from 'vuex'
import { nextTick } from 'vue'

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
    console.log('onMounted', this.isEditing, this.id)
    if (this.isEditing) {
      this.onFocus()
    }
  },
  watch: {
    isEditing: {
      handler: function (new_value, old_value) {
        console.log('isEditing changed', new_value, old_value)
        if (new_value && !old_value) {
          this.isFocused = false
          this.onFocus()
        }
      }
    },
    id: {
      handler: function (new_value, old_value) {
        console.log('id handler')
        if (this.isEditing && new_value !== old_value) {
          console.log('id changed', new_value, old_value)
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
      this.$emit('input', event)
      this.applyClickedDebounce = true
      setTimeout(() => {
        this.applyClickedDebounce = false
      }, 10)
    },
    onFocus(event) {
      console.log('onFocus')
      if (this.isEditing && this.isFocused) {
        return
      }
      this.$emit('edit')
      nextTick(() => {
        console.log('selecting')
        console.log(document.getElementById(this.id))
        document.getElementById(this.id).select()
        this.isFocused = true
      })

      // if (this.isFocused) {
      //   return
      // } else {
      //   // if (!this.isEditing) {
      //   //   this.$emit('edit')
      //   // }
      //   this.isFocused = true
      //   nextTick(() => {
      //     const element = document.getElementById(this.id)
      //     if (element) {
      //       element.select()
      //     }
      //   })
      // }

      // const element = document.getElementById(this.id)
      // // console.log('id', this.id)
      // if (!element) {
      //   if (event && event.target) {
      //     element = event.target
      //   } else {
      //     return
      //   }
      // }
      // if (this.isEditing) {
      //   this.isFocused = true
      //   element.select()
      // }

      // // // console.log('Element', element)
      // // // console.log('isEditing', this.isEditing)
      // // // if (!this.isEditing) {
      // // //   if (document.activeElement === element) {
      // // //     element.blur()
      // // //     this.isFocused = false
      // // //   }
      // // //   return
      // // // }
      // // // console.log('a')
      // // // if (this.isFocused && document.activeElement === element) {
      // // //   return
      // // // }
      // // if (this.isFocused) {
      // //   return
      // // }
      // // // console.log('b')
      // // this.isFocused = true
      // // this.$emit('edit')
      // // nextTick(() => {
      // //   // console.log('Selecting element')
      // //   element.select()
      // // })
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
