<template>
  <v-btn
    small
    min-width="20px"
    elevation="0"
    tile
    class="pa-0 ma-0"
    height="auto"
    plain
    :to="{ path: destination}"
  >
    <v-icon>
      {{icon}}
    </v-icon>
  </v-btn>
</template>

<script>
export default {
  emits: ['click'],
  name: "MonthNextPrevButton",
  props: {
    icon: {
      type: String,
      default: "mdi-chevron-left",
    },
    destination: {
      type: String,
      default: "/",
    },
  },
};
</script>