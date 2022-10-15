<template>
  <v-hover v-slot="{ hover }">
    <div data-testId="details-date">
      <v-text-field
        v-model="date_picker"
        :rules="[rules.date]"
        dense
        flat
        solo
        class="text-body-1 date-text-field"
        id="date-input"
        hide-details
        @focus="isFocused = true"
        @blur="isFocused = false"
        :background-color="isFocused || hover ? 'background lighten-2' : 'transparent'"
      >
        <template v-slot:append-outer>
          <v-menu v-model="menu_is_visible" offset-y :close-on-content-click="false">
            <template v-slot:activator="{ on }">
              <v-icon small v-on="on">mdi-calendar</v-icon>
            </template>
            <v-date-picker v-model="date_picker" @click="menu_is_visible = false" />
          </v-menu>
        </template>
      </v-text-field>
    </div>
  </v-hover>
</template>

<script>
import moment from "moment";

export default {
  props: {
    value: {
      type: String,
      default: moment(new Date()).format("YYYY-MM-DD"),
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menu_is_visible: false,
      isFocused: false,
      rules: {
        date: (value) => {
          return this.$vm.validateDate(value) || "Invalid date.";
        },
      },
    };
  },
  computed: {
    date_picker: {
      get() {
        return this.value;
      },
      set(value) {
        this.menu_is_visible = false;
        this.$emit("input", value);
      },
    },
  },
};
</script>

<style>
.date-text-field {
  max-width: 150px;
}
</style>
