<template>
  <v-card class="ma-0 pa-0" elevation="0" color="transparent" width="250px" min-width="250px">
    <v-row class="pa-0 ma-0">
      <month-next-prev-button
        icon="mdi-chevron-left"
        :destination="`/budget/${prevMonth}`"
        data-testid="previous-month-button"
      />
      <v-col class="pa-0 ma-0">
        <v-menu v-model="datePickerIsOpen" :close-on-content-click="false" min-width="auto">
          <template #activator="{ on, attrs }">
            <v-btn
              class="text-none"
              height="auto"
              tile
              elevation="0"
              plain
              v-on="on"
              v-bind="attrs"
              width="100%"
              data-testid="month-selector-button"
            >
              <v-row class="pa-0 ma-0">
                <v-col class="pa-0 ma-0" align="left">
                  <span class="text-h5">{{ year }}</span>
                  <br />
                  <span class="text-h3">{{ monthName }} </span>
                </v-col>
                <v-icon class="pl-3">mdi-menu-down</v-icon>
              </v-row>
            </v-btn>
          </template>
          <v-date-picker
            v-model="date"
            type="month"
            @input="datePickerIsOpen = false"
            color="primary darken-2"
            header-color="background lighten-1"
          />
        </v-menu>
      </v-col>
      <month-next-prev-button
        data-testid="next-month-button"
        icon="mdi-chevron-right"
        :destination="`/budget/${nextMonth}`"
      />
    </v-row>
  </v-card>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import MonthNextPrevButton from "./MonthNextPrevButton.vue";

export default {
  components: {
    MonthNextPrevButton,
  },
  data() {
    return {
      datePickerIsOpen: false,
    };
  },

  computed: {
    ...mapGetters("categoryMonth", ["prevMonth", "nextMonth", "selectedMonth"]),
    monthName() {
      const date = new Date(this.selectedMonth);

      // Convert date to month name, year
      return date.toLocaleString("default", { month: "long" });
    },
    year() {
      const date = new Date(this.selectedMonth);
      return date.getFullYear();
    },
    date: {
      get() {
        return this.selectedMonth;
      },
      set(value) {
        this.$router.push(`/budget/${value}`);
      },
    },
  },
  methods: {
    ...mapMutations("categoryMonth", ["UPDATE_SELECTED_MONTH"]),
  },
};
</script>

<style>
.theme--dark.v-picker__body {
  background-color: var(--v-background-base);
}
</style>
