<template>
  <div>
    <v-icon :data-testid="dataTestid" left small :color="selected ? 'primary' : ''" @click="$emit('click')">
      {{ selected ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
    </v-icon>
    <slot> Selected </slot>
  </div>
</template>

<script>
export default {
  name: 'DetailsRadio',
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
