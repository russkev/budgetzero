<template>
  <div v-if="!readonly" @blur="onBlur">
    <div v-if="!isEditing">
      <v-hover v-slot="{ hover }">
        <!-- Not read only and not editing -->
        <v-text-field
          :class="`ma-0 pa-0 text-${text}`"
          dense
          flat
          solo
          :hide-details="!showDetails"
          readonly
          :id="id"
          :data-testid="dataTestid"
          :value="currency ? intlCurrency.format(value) : value"
          @focus="onClick"
          :reverse="currency && !currencyLeft"
          :background-color="hover ? activeBackgroundColor : 'transparent'"
          :height="height"
          :loading="loading"
          :disabled="loading"
          :placeholder="placeholder"
          :rules="rules"
        />
      </v-hover>
    </div>
    <!-- Not read only and editing -->
    <div v-else>
      <v-text-field
        :hide-details="!showDetails"
        dark
        dense
        flat
        solo
        autofocus
        :class="`ma-0 pa-0 text-${text}`"
        :id="id"
        :data-testid="dataTestid"
        :value="value"
        @change="onApply"
        @blur="onBlur"
        @keyup.enter="onEnterPressed"
        @click="onEditedClicked"
        :suffix="currency ? '$' : ''"
        :reverse="currency"
        :height="height"
        :background-color="activeBackgroundColor"
        :loading="loading"
        :disabled="loading"
        :placeholder="placeholder"
        :rules="rules"
      />
    </div>
  </div>
  <!-- Read only and editing -->
  <div v-else>
    <div>
      <v-text-field
        :class="`ma-0 pa-0 text-${text}`"
        dense
        flat
        solo
        :hide-details="!showDetails"
        readonly
        :id="id"
        :data-testid="dataTestid"
        :value="currency ? intlCurrency.format(value) : value"
        :reverse="currency || !currencyLeft"
        background-color="transparent"
        :height="height"
        :loading="loading"
        :disabled="loading"
        :placeholder="placeholder"
        :rules="rules"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { nextTick } from 'vue'

export default {
  emits: ['apply', 'edit', 'enter'],
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
  data() {
    return {
      isSelected: false,
      height: '26px',
      isHovering: false
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
      this.onApply(event)
    },
    onApply(event) {
      this.$emit('apply', event)
      this.isSelected = false
    },
    onClick() {
      this.$emit('edit')
      nextTick(() => {
        document.getElementById(this.id).select()
        this.isSelected = true
      })
    },
    onEnterPressed(event) {
      this.$emit('enter', event)
      this.onApply(event)
      this.isSelected = true
    },
    onEditedClicked(event) {
      if (!this.isSelected) {
        event.target.select()
        this.isSelected = true
      }
    },
    testChange(event) {
      console.log('TEST CHANGE')
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
