<template>
  <v-row class="ma-0">
    <v-btn data-testid="previous-month-button" small :to="{ path: `/budget/${prevMonth}` }">
      <v-icon medium>mdi-chevron-left</v-icon> Previous month
    </v-btn>
    <v-btn data-testid="today-month-button" :to="{ path: `/budget/${thisMonth}` }"> Today </v-btn>
    <v-btn data-testid="next-month-button" small :to="{ path: `/budget/${nextMonth}` }">
      <v-icon medium>mdi-chevron-right</v-icon> Next month
    </v-btn>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters("categoryMonth", [
      "prevMonth",
      "nextMonth",
      "thisMonth",
    ]),
  }
}
</script>