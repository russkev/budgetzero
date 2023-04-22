<template>
  <v-overlay opacity="1" z-index="10000" color="background" :value="value">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <div style="position: relative">
          <v-icon large> $custom</v-icon>
          <v-progress-circular
            indeterminate
            color="#F86E9F"
            size="80"
            width="3"
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
          ></v-progress-circular>
        </div>
      </v-layout>
    </v-container>
  </v-overlay>
</template>

<script>
export default {
  name: 'LoadingFullScreen',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  }
}
</script>
