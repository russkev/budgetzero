<template>
  <v-list flat :class="mini ? 'ml-0 pl-0' : 'ml-3'" two-line>
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
