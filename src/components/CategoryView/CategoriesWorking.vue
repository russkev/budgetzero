<template>
  <div class="header-balance-grid ml-5">
    <div></div>
    <div>{{ intlCurrency.format(monthStats.available_last_month / 100) }}</div>
    <div>Left over from last month</div>
    <div>+</div>
    <div>{{ intlCurrency.format(monthStats.income_this_month / 100) }}</div>
    <div>Income this month</div>
    <div>-</div>
    <div>{{ intlCurrency.format(monthStats.budgeted_this_month / 100) }}</div>
    <div>Budgeted this month</div>
    <div>=</div>
    <div>{{ intlCurrency.format(monthStats.available_this_month / 100) }}</div>
    <div>Available to budget</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
        ...mapGetters([
      "intlCurrency",
    ]),
    ...mapGetters("categoryMonth", ["monthStats"]),

  }
}
</script>

<style>
div.header-balance-grid {
  max-width: max-content;
  display: grid;
  grid-template-columns: auto auto auto;

}

div.header-balance-grid > :nth-child(3n+2) {
  text-align: right;
  margin-left: 15px;
}

div.header-balance-grid > :nth-child(3n) {
  text-align: left;
  margin-left: 15px;
}


</style>