<template>
  <v-btn 
    icon
    v-on="$listeners"
  >
    <v-icon v-if="isCleared" class="cleared-icon" color="primary">mdi-alpha-c-circle</v-icon>
    <v-icon v-else class="uncleared-icon" color="grey">mdi-alpha-c-circle-outline</v-icon>
  </v-btn> 
</template>

<script>
export default {
  props: {
    isCleared: {
      type: Boolean,
      default: false,
    }
  }
}
</script>