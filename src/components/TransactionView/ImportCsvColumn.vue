<template>
  <div>
    <div class="d-flex flex-row align-center">
      <v-menu offset-y :disabled="disabled">
        <template #activator="{ attrs, on }">
          <v-btn small text :disabled="disabled" v-bind="attrs" v-on="on" style="flex: 1">
            <span style="font-size: 1rem"> {{ value }} </span><v-spacer /><v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense color="background darken-2" :data-testid="`import-csv-column-list-${name}`">
          <v-list-item-subtitle v-if="csvExample" class="px-4 py-1">
            <span class="row-column-example-label"> Sample from file:&nbsp;</span>
            <span class="row-column-item-example">{{ csvExample }}</span>
          </v-list-item-subtitle>
          <v-list-item
            v-for="row of rows"
            :key="row.data"
            link
            class="csv-column-item"
            @click="$emit('input', row.data)"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ row.data }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ csvExample ? 'Example:&nbsp;' : 'Example from file:&nbsp;' }}
                <span class="row-column-item-example">{{ row.example }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
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
    rows: {
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
    },
    name: {
      type: String,
      default: ''
    },
    csvExample: {
      type: String,
      default: ''
    }
  },
  computed: {
    parsedRows() {
      return this.rows
    }
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}

.row-column-item-example {
  color: var(--v-primary-base);
}
.row-column-example-label {
  color: #ffffffb3;
}
</style>
