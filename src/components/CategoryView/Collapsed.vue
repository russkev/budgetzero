<template>
  <v-expansion-panels flat multiple :value="expanded">
    <v-expansion-panel
      :class="`category-card ${background} rounded-1 ma-0 pa-0 mb-2 ${expansionPanelClass}`"
      style="box-shadow: none"
    >
      <slot name="header"></slot>
      <v-expansion-panel-content class="pa-0 ma-0" color="transparent">
        <slot name="body"></slot>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  name: 'Collapsed',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    background: {
      type: String,
      default: 'background lighten-1'
    },
    expansionPanelClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    expanded() {
      if (this.value) {
        return []
      } else {
        return [0]
      }
    }
  }
}
</script>
