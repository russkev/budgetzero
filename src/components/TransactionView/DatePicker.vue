<template>
  <v-text-field v-model="date_picker" :rules="[rules.date]">
    <template v-slot:append-outer>
      <v-menu v-model="menu_is_visible" offset-y :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" color="primary">mdi-calendar</v-icon>
        </template>
        <v-date-picker v-model="date_picker" @click="menu_is_visible = false" />
      </v-menu>
    </template>
  </v-text-field>
</template>

<script>
import moment from 'moment'
export default {
  props: {
    value: {
      type: String,
      default: moment(new Date()).format('YYYY-MM-DD')
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      menu_is_visible: false,
      rules: {
        date: (value) => {
          return this.$vm.validateDate(value) || 'Invalid date.'
        },
      }
    }
  },
  computed: {
    date_picker: {
      get() {
        return this.value
      },
      set(value) {
        this.menu_is_visible = false
        this.$emit('input', value)
      }
    }
  }
}
</script>
