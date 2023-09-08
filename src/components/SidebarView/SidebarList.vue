<template>
  <v-list flat class="ml-0 pl-0">
    <slot></slot>
  </v-list>
</template>

<script>
export default {
  name: 'SidebarList',
  props: {
    mini: {
      type: Boolean,
      default: false
    }
  }
}
</script>
