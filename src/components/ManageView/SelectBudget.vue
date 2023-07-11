<template>
  <v-radio-group v-model="selectedBudget">
    <v-radio
      v-for="budget in availableBudgets"
      :key="budget._id.slice(-ID_LENGTH.budget)"
      :label="budget.name"
      :value="budget._id.slice(-ID_LENGTH.budget)"
      :data-testid="`budget-select-${budget._id.slice(-ID_LENGTH.budget)}`"
    />
  </v-radio-group>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ID_LENGTH } from '../../constants'

export default {
  name: 'SelectBudget',
  data() {
    return {
      ID_LENGTH: ID_LENGTH
    }
  },
  computed: {
    ...mapGetters(['allBudgets', 'selectedBudgetId']),
    selectedBudget: {
      get() {
        return this.selectedBudgetId
      },
      set(value) {
        this.setSelectedBudgetID(value)
      }
    },
    availableBudgets() {
      return [...this.allBudgets].sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    }
  },
  methods: {
    ...mapActions(['setSelectedBudgetID'])
  }
}
</script>
