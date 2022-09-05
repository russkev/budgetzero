<template>
  <v-simple-checkbox 
    :value="isSelected"
    :ripple="false"
    :disabled="expanded.length > 0"
    v-on="$listeners"
  />
</template>

<script>
export default {
  props: {
    isSelected: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Array,
      default: []
    }
  },
};
</script>
