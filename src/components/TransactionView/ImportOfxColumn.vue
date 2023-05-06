<template>
  <div>
    <div style="display: flex; flex-direction: row; align-items: center">
      <span class="primary--text text--lighten-1">{{ label }}</span>
      <v-menu offset-y>
        <template #activator="{ attrs, on }">
          <v-btn small text v-bind="attrs" v-on="on">
            <span style="font-size: 1rem"> {{ value }} </span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="header in headerOptions" :key="header" link>
            <v-list-item-title @click="$emit('input', header)">{{ header }} </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- <v-spacer /> -->
      <v-icon :color="errorText ? 'error' : 'success'">{{
        errorText ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'
      }}</v-icon>
    </div>
    <div class="error--text" style="min-height: 18px">
      {{ errorText }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String | Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    headerOptions: {
      type: Array,
      required: true
    },
    errorText: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
