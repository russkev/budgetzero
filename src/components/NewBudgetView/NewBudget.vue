<template>
  <div>
    <v-container fluid class="py-0">
      <page-heading title="New Budget" />
      <v-sheet max-width="800px" justify="center" id="new-budgets-sheet" class="mx-auto pa-2" color="transparent">
        <div class="transaction-details-grid pa-2 pb-0 mt-3">
          <div class="text-h5">Budget Name</div>
          <div>
            <v-card flat color="background lighten-2" class="pa-2 mb-4">
              <div class="budgets-details">
                <div class="mb-2">Enter a name for the new budget</div>
                <v-text-field
                  solo
                  flat
                  prepend-icon="mdi-file-document"
                  color="secondary lighten-2"
                  background-color="background lighten-3"
                  v-model="budgetName"
                  @change="onBudgetNameChange"
                  class="mx-2 text-body-1"
                  :error="Boolean(budgetNameError)"
                  :error-messages="budgetNameError"
                />
                <!-- <button-transparent icon="mdi-file-document" :disabled="!createButtonIsEnabled" @click="onCreate">
                  Create
                </button-transparent> -->
              </div>
            </v-card>
          </div>
          <div>Categories</div>
          <div>
            <div v-for="masterCategory in Object.keys(selectedCategories)" :key="masterCategory" class="py-3">
              <v-checkbox
                v-model="selectedMasterCategories"
                :value="masterCategory"
                color="secondary lighten-2"
                class="pa-0 ma-0 mb-2"
                :indeterminate="masterIntermediateState(masterCategory)"
                hide-details
              >
                <template #label>
                  <div class="text-h6">{{ masterCategory }}</div>
                </template>
              </v-checkbox>
              <v-card flat color="background lighten-2" class="pa-2 mb-4">
                <v-row>
                  <v-col v-for="category in starterCategories[masterCategory]" :key="category" cols="4">
                    <v-checkbox
                      v-model="selectedCategories[masterCategory]"
                      :value="category"
                      color="secondary lighten-2"
                      dense
                      class="pa-0 ma-0"
                      hide-details
                    >
                      <template #label>
                        <div class="text-body-1">{{ category }}</div>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </div>
        </div>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeading from '../Shared/PageHeading.vue'

export default {
  name: 'NewBudget',
  components: {
    PageHeading
  },
  data() {
    return {
      budgetName: '',
      budgetNameError: '',
      // defaultCategories: {
      // 'Everyday Expenses'
      // Food: false,
      // Clothing: false,
      // Housing: false,
      // Transportation: false,
      // Utilities: false,
      // Medical: false,
      // Insurance: false,
      // Personal: false,
      // Debt: false,
      // Savings: false,
      // Entertainment: false,
      // Miscellaneous: false
      starterCategories: {
        Giving: ['Tithing', 'Charitable'],
        'Everyday Expenses': ['Restaurants', 'Groceries', 'Household Goods', 'Spending Money'],
        'Monthly Bills': [
          'Medical/Dental',
          'Internet',
          'Rent/Mortgage',
          'Clothing',
          'Water',
          'Renters Insurance',
          'Car Insurance',
          'Phone',
          'Fuel',
          'Car Maintenance',
          'Electricity',
          'Cable TV'
        ],
        Debt: ['Student Loan Payment', 'Car Payment'],
        'Savings Goals': [
          'Rainy Day Funds',
          'Christmas',
          'Birthdays',
          'Emergency Fund',
          'Car Replacement',
          'Retirement',
          'Vacation'
        ]
      },
      selectedCategories: {}
    }
  },
  created() {
    ;(this.selectedCategories = JSON.parse(JSON.stringify(this.starterCategories))),
      (this.selectedMasterCategories = Object.keys(this.starterCategories).reduce((partial, category) => {
        partial[category] = false
        return partial
      }, {}))
  },
  computed: {
    createButtonIsEnabled() {
      return this.budgetName.length > 0
    },
    selectedMasterCategories: {
      get() {
        return Object.entries(this.starterCategories).reduce((partial, [masterCategory, categories]) => {
          if (this.selectedCategories[masterCategory].length === categories.length) {
            partial.push(masterCategory)
          }
          return partial
        }, [])
      },
      set(selected) {
        if (!Array.isArray(selected)) selected = Object.keys(selected)
        Object.keys(this.starterCategories).forEach((masterCategory) => {
          if (selected.includes(masterCategory)) {
            this.selectedCategories[masterCategory] = this.starterCategories[masterCategory]
          } else {
            this.selectedCategories[masterCategory] = []
          }
        })
      }
    }
  },
  methods: {
    onBudgetNameChange() {
      console.log('onBudgetNameChange')
    },
    masterIntermediateState(masterCategory) {
      return (
        this.selectedCategories[masterCategory].length > 0 &&
        this.selectedCategories[masterCategory].length < this.starterCategories[masterCategory].length
      )
    }
  }
}
</script>
