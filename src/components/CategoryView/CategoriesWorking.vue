<template>
  <div class="header-balance-grid ml-5 mb-3 text-body-2">
    <div></div>
    <div>Carryover</div>
    <div :class="carryoverColor" data-testid="working-carryover">{{ intlCurrency.format(lastMonth / 100) }}</div>
    <div>+</div>
    <div>Income</div>
    <div :class="incomeColor" data-testid="working-income">{{ intlCurrency.format(income / 100) }}</div>
    <div v-if="includeSpent">-</div>
    <div v-if="includeSpent">Spent</div>
    <div v-if="includeSpent" :class="spentColor" data-testid="working-spent">
      {{ intlCurrency.format(spent / 100) }}
    </div>
    <div>{{ addBudgeted ? '+' : '-' }}</div>
    <div>Budgeted</div>
    <div :class="budgetedColor" data-testid="working-budgeted">{{ intlCurrency.format(budgeted / 100) }}</div>
    <div class="font-weight-bold">=</div>
    <div class="font-weight-medium">{{ addBudgeted ? 'Balance' : 'Available' }}</div>
    <div :class="`font-weight-medium ${balanceColor}`" data-testid="working-available">
      {{ intlCurrency.format(available / 100) }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { valueColor } from '../../helper'
import { AMOUNT_RED, AMOUNT_GREEN } from '../../constants'

export default {
  props: {
    lastMonth: {
      type: Number,
      default: 0
    },
    income: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    budgeted: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    },
    addBudgeted: {
      type: Boolean,
      default: false
    },
    includeSpent: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['intlCurrency']),
    ...mapGetters('categoryMonth', ['monthStats']),
    carryoverColor() {
      return valueColor(this.lastMonth)
    },
    incomeColor() {
      return valueColor(this.income)
    },
    spentColor() {
      return valueColor(-this.spent)
    },
    budgetedColor() {
      return this.addBudgeted ? valueColor(this.budgeted) : valueColor(-this.budgeted)
    },
    balanceColor() {
      return valueColor(this.available)
    }
  },
  methods: {}
}
</script>

<style>
div.header-balance-grid {
  max-width: max-content;
  display: grid;
  grid-template-columns: auto auto auto;
  line-height: normal;
}

div.header-balance-grid > :nth-child(3n + 2) {
  text-align: right;
  margin-left: 15px;
  width: 90px;
}

div.header-balance-grid > :nth-child(3n) {
  text-align: right;
  margin-left: 15px;
}
</style>
