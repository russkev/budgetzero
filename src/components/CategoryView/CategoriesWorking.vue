<template>
  <div class="header-balance-grid ml-5">
    <div></div>
    <div :class="carryoverColor" data-testid="working-carryover">{{ intlCurrency.format(lastMonth / 100) }}</div>
    <div>Carryover</div>
    <div>+</div>
    <div :class="incomeColor" data-testid="working-income">{{ intlCurrency.format(income / 100) }}</div>
    <div>Income</div>
    <div v-if="includeSpent">-</div>
    <div v-if="includeSpent" :class="spentColor" data-testid="working-spent">
      {{ intlCurrency.format(spent / 100) }}
    </div>
    <div v-if="includeSpent">Spent</div>
    <div>{{ addBudgeted ? '+' : '-' }}</div>
    <div :class="budgetedColor" data-testid="working-budgeted">{{ intlCurrency.format(budgeted / 100) }}</div>
    <div>Budgeted</div>
    <div class="font-weight-bold">=</div>
    <div :class="`font-weight-medium text-h6 ${balanceColor}`" data-testid="working-available">
      {{ intlCurrency.format(available / 100) }}
    </div>
    <div class="font-weight-medium text-h6">{{ addBudgeted ? 'Balance' : 'Available' }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
      return this.valueColor(this.lastMonth)
    },
    incomeColor() {
      return this.valueColor(this.income)
    },
    spentColor() {
      return this.valueColor(-this.spent)
    },
    budgetedColor() {
      return this.addBudgeted ? this.valueColor(this.budgeted) : this.valueColor(-this.budgeted)
    },
    balanceColor() {
      return this.valueColor(this.available)
    }
  },
  methods: {
    valueColor(value) {
      if (value < 0) {
        return AMOUNT_RED
      } else if (value > 0) {
        return AMOUNT_GREEN
      } else {
        return ''
      }
    }
  }
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
  text-align: left;
  margin-left: 15px;
}
</style>
