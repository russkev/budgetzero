<template>
  <v-card class="ma-0 pa-0" elevation="0" color="transparent" width="250px">
    <v-row class="pa-0 ma-0">
      <!-- <v-col class="pa-0 ma-0" cols="auto"> -->
      <month-next-prev-button
        icon="mdi-chevron-left"
        :destination="`/budget/${prevMonth}`"
        data-testid="previous-month-button"
      />
      <!-- </v-col> -->
      <v-col class="pa-0 ma-0">
        <v-menu v-model="datePickerIsOpen" :close-on-content-click="false" min-width="auto">
          <template #activator="{ on, attrs }">
            <!-- <v-hover v-slot="{ hover}"> -->
            <!-- <v-card class="px-2" v-on="on" v-bind="attrs" color="transparent" elevation="0"> -->
            <v-btn
              class="text-none"
              height="auto"
              tile
              elevation="0"
              plain
              v-on="on"
              v-bind="attrs"
              width="100%"
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
            <!-- </v-card> -->
            <!-- </v-hover> -->
          </template>
          <v-date-picker v-model="date" type="month" @input="datePickerIsOpen = false" />
        </v-menu>
      </v-col>
      <!-- <v-col class="pa-0 ma-0" cols="auto"> -->
      <month-next-prev-button
        data-testid="next-month-button"
        icon="mdi-chevron-right"
        :destination="`/budget/${nextMonth}`"
      />
      <!-- </v-col> -->
    </v-row>
  </v-card>

  <!-- <v-row class="ma-0">
    <v-btn data-testid="previous-month-button" small :to="{ path: `/budget/${prevMonth}` }">
      <v-icon medium>mdi-chevron-left</v-icon> Previous month
    </v-btn>
    <v-btn data-testid="today-month-button" :to="{ path: `/budget/${thisMonth}` }"> Today </v-btn>
    <v-btn data-testid="next-month-button" small :to="{ path: `/budget/${nextMonth}` }">
      <v-icon medium>mdi-chevron-right</v-icon> Next month
    </v-btn>
  </v-row> -->
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
      // date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      //   .toISOString()
      //   .substr(0, 10),
    };
  },
  // watch:{
  //   // watch for change in date and update the store

  // }
  computed: {
    ...mapGetters("categoryMonth", ["prevMonth", "nextMonth", "thisMonth", "selectedMonth"]),
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
        // return `${this.selectedMonth}-01`
        return this.selectedMonth;
      },
      set(value) {
        this.$router.push(`/budget/${value}`);
      },
    },
    // onPrevMonthClicked() {
    //   return () => {
    //     this.$router.push(`/budget/${this.prevMonth}`);
    //   };
    // },
    // date: {
    //   get() {
    //     return new Date(this.selectedMonth);
    //   },
    //   set(date) {
    //     // convert date to YYYY-MM
    //     console.log(date)
    //   }
    // }
  },
  methods: {
    ...mapMutations("categoryMonth", ["UPDATE_SELECTED_MONTH"]),
  },
  // methods: {
  //   ...mapActions("categoryMonth", ["onPreviousMonth", "onNextMonth", "onThisMonth"]),
  //   // monthName(date) {
  //   //   return date.toLocaleString("default", { month: "long" }) + " " + date.getFullYear();
  //   // },
  // },
};
</script>
