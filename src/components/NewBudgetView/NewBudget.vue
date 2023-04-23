<template>
  <div>
    <v-container fluid class="py-0">
      <v-sheet max-width="800px" justify="center" id="new-budgets-sheet" class="mx-auto pa-2" color="transparent">
        <div class="transaction-details-grid pb-0 mt-3">
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
                  class="mx-2 text-body-1"
                  :error="Boolean(budgetNameError)"
                  :error-messages="budgetNameError"
                  data-testid="budget-name-field"
                />
              </div>
            </v-card>
          </div>
          <div>Categories</div>
          <div style="max-height: 300px; overflow-y: scroll; overflow-x: hidden">
            <v-list
              dense
              color="background lighten-2"
              v-for="(masterCategory, index) in Object.keys(selectedCategories)"
              :key="masterCategory"
              id="start-list"
              :class="`pa-0 ${index === 0 ? 'pt-3' : ''}`"
            >
              <v-list-group :value="true">
                <template #activator>
                  <v-list-item-action>
                    <v-checkbox
                      dense
                      v-model="selectedMasterCategories"
                      :value="masterCategory"
                      :indeterminate="masterIntermediateState(masterCategory)"
                      class="pa-0 ma-0 pr-3"
                      hide-details
                      :data-testid="`master-checkbox-${masterCategory}`"
                      @click.stop
                    />
                  </v-list-item-action>
                  <v-list-item-content>
                    {{ masterCategory }}
                  </v-list-item-content>
                </template>
                <v-list-item
                  v-for="category in starterCategories[masterCategory]"
                  :key="category"
                  class="start-category-item"
                >
                  <v-list-item-action class="ml-4">
                    <v-checkbox
                      v-model="selectedCategories[masterCategory]"
                      :value="category"
                      dense
                      class="pr-3"
                      hide-details
                      :data-testid="`checkbox-${category}`"
                    />
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ category }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </v-list>
          </div>
          <div>Create</div>
          <div>
            <button-transparent
              icon="mdi-file-document"
              :disabled="!createButtonIsEnabled"
              @click="onCreate"
              data-testid="create-budget-button"
            >
              Create
            </button-transparent>
          </div>
        </div>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
      selectedCategories: {},
      expandedMasterCategories: {}
    }
  },
  created() {
    this.selectedCategories = JSON.parse(JSON.stringify(this.starterCategories))
    this.selectedMasterCategories = Object.keys(this.starterCategories).reduce((partial, category) => {
      partial[category] = false
      return partial
    }, {})
    this.expandedMasterCategories = Object.keys(this.starterCategories).reduce((partial, category) => {
      partial[category] = false
      return partial
    }, {})
  },
  computed: {
    createButtonIsEnabled() {
      return this.budgetName.length > 0
    },
    selectedMasterCategories: {
      get() {
        // Only return the master categories that have all of their children selected
        return Object.keys(this.starterCategories).reduce((partial, masterCategory) => {
          if (this.selectedCategories[masterCategory].length === this.starterCategories[masterCategory].length) {
            partial.push(masterCategory)
          }
          return partial
        }, [])
      },
      set(selected) {
        if (!Array.isArray(selected)) selected = Object.keys(selected)
        const items_disabled = this.selectedMasterCategories.filter((item) => !selected.includes(item))
        const items_enabled = selected.filter((item) => !this.selectedMasterCategories.includes(item))

        items_disabled.forEach((masterCategory) => {
          this.selectedCategories[masterCategory] = []
        })
        items_enabled.forEach((masterCategory) => {
          this.selectedCategories[masterCategory] = this.starterCategories[masterCategory]
        })
      }
    }
  },
  methods: {
    ...mapActions(['createBudget']),
    masterIntermediateState(masterCategory) {
      return (
        this.selectedCategories[masterCategory].length > 0 &&
        this.selectedCategories[masterCategory].length < this.starterCategories[masterCategory].length
      )
    },
    onCreate() {
      // Only send the master categories that have at least one child selected
      const masterCategories = Object.entries(this.selectedCategories).reduce(
        (partial, [masterCategory, categories]) => {
          if (categories.length > 0) {
            partial.push(masterCategory)
          }
          return partial
        },
        []
      )
      this.createBudget({
        name: this.budgetName,
        masterCategories: masterCategories,
        categories: this.selectedCategories
      })
        .then(() => {
          this.$router.push({ path: '/categories' })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style>
.checkbox-list .v-list-item {
  min-height: 0px;
}

.v-list-item.start-category-item {
  min-height: 20px;
}

.v-list-item.start-category-item .v-list-item__content {
  padding: 2px 5px;
}

#start-list .v-list-group__header {
  min-height: 0px !important;
}

#start-list .v-list-item__action,
#start-list .v-list-item__content,
#start-list .v-list-item__icon {
  margin: 0;
  padding: 0;
}
</style>
