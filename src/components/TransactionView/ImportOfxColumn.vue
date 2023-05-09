<template>
  <div>
    <!-- <div style="display: flex; flex-direction: row; align-items: center"> -->
    <div class="d-flex flex-row align-center">
      <v-menu offset-y :disabled="disabled">
        <template #activator="{ attrs, on }">
          <v-btn small text v-bind="attrs" v-on="on" style="flex: 1">
            <span style="font-size: 1rem"> {{ value }} </span><v-spacer /><v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="header in headerOptions" :key="header" link>
            <v-list-item-title @click="$emit('input', header)">{{ header }} </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-if="errorText">
        <v-tooltip bottom class="pa-0" color="transparent">
          <template v-slot:activator="{ on }">
            <v-icon color="error" v-on="on"> mdi-alert-circle-outline </v-icon>
          </template>
          <v-card
            max-width="400px"
            flat
            outlined
            color="outline background"
            class="transaction-description ma-0 px-4 py-1"
          >
            <v-card-subtitle class="ma-0 pa-0">Error: </v-card-subtitle>
            {{ errorText }}
          </v-card>
        </v-tooltip>
      </template>
      <template v-else>
        <v-icon color="success" style="visibility: hidden"> mdi-circle-small </v-icon>
      </template>
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
    // label: {
    //   type: String,
    //   required: true
    // },
    headerOptions: {
      type: Array,
      required: true
    },
    errorText: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
