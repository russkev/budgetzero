<template>
  <v-sheet width="3px" :color="active ? 'primary lighten-2' : 'transparent'" />
</template>

<script>
export default {
  name: 'SidebarSelectIndicator',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>
