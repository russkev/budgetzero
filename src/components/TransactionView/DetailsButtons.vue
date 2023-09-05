<template>
  <!-- <div class="details-buttons-container">
    <v-icon x-large class="pb-3">{{icon}}</v-icon>
    <span class="mb-5">{{ subtitle }}</span>
    <slot>

    </slot>
  </div> -->
  <div class="details-button-container">{{ subtitle }}</div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>
.details-buttons-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
