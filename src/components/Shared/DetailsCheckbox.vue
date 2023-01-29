<template>
  <div>
    <v-icon :data-testid="dataTestid" left small :color="selected ? 'primary' : ''" @click="$emit('click')">
      {{ selected ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank' }}
    </v-icon>
    <slot> Selected </slot>
  </div>
</template>

<script>
export default {
  name: 'DetailsCheckbox',
  emits: ['click'],
  props: {
    selected: {
      type: Boolean,
      default: true
    },
    dataTestid: {
      type: String,
      default: ''
    }
  }
}
</script>
