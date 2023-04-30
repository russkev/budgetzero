<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title flex-sheet ma-0 ml-2">
    <!-- <v-card-title class="primary darken-3 pa-3">{{ title }}</v-card-title> -->
    <v-card-title v-if="selectedCategory" class="background lighten-2 pa-3">
      Update Selected
      <v-icon @click="onUnselectCategory" class="ml-auto">mdi-close</v-icon>
    </v-card-title>
    <v-divider v-if="selectedCategory" :style="`border-bottom: 2px solid ${categoryColors[selectedCategory._id]};`" />
    <v-card-title v-else class="background lighten-1 pa-3"> All Categories </v-card-title>
    <div v-if="selectedCategory" class="transaction-details-grid pa-2 pb-0">
      <div class="text-h5">Name</div>
      <div>
        <string-input
          class="category-name-input"
          :id="`category-name-input-${selectedCategory._id}`"
          :data-testid="`category-name-input-${selectedCategory._id}`"
          :is-editing="isEditingName(selectedCategory._id)"
          :value="selectedCategory.name"
          @edit="onEditCategoryName(selectedCategory._id)"
          @apply="onCategoryNameChange"
          :loading="editedCategoryNameLoading"
        />
      </div>

      <div class="text-h5">Budgeted</div>
      <div>
        <string-input
          class="category-budget-input"
          :id="`category-budget-input-${selectedCategory._id}`"
          :data-testid="`category-budget-input-${selectedCategory._id}`"
          :value="selectedCategory.budgetDisplay"
          currency
          :is-editing="editedCategoryBudgetId == selectedCategory._id"
          @edit="onEditCategoryBudget(selectedCategory._id)"
          @apply="
            (event) => {
              onCategoryBudgetChanged({ category_id: selectedCategory._id, event: event })
            }
          "
          :loading="editedCategoryBudgetLoading"
          currency-left
        />
      </div>
      <div>Move</div>
      <div>
        <details-move />
      </div>
      <div class="text-h5">Working</div>
      <div>
        <categories-working
          :last-month="selectedCategory.carryover"
          :income="selectedCategory.income"
          :spent="selectedCategory.expense"
          :budgeted="selectedCategory.budget"
          :available="selectedCategory.balance"
          add-budgeted
        />
      </div>
    </div>
    <div v-else class="transaction-details-grid pa-2 pb-0">
      <div class="text-h5">Working</div>
      <div>
        <categories-working
          :last-month="monthStats.available_last_month"
          :income="monthStats.income_this_month"
          :budgeted="monthStats.budgeted_this_month"
          :available="monthStats.available_this_month"
        />
      </div>
    </div>
    <div style="width: 100%" class="mb-4"></div>
    <details-table />
  </v-card>
</template>

<script>
import CategoriesWorking from './CategoriesWorking.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import CurrencyInput from '../Shared/CurrencyInput.vue'
import DetailsTable from './DetailsTable.vue'
import { ID_LENGTH, NONE } from '../../constants'
import StringInput from '../Shared/StringInput.vue'
import DetailsMove from './DetailsMove.vue'

export default {
  name: 'CategoryDetails',
  components: {
    CategoriesWorking,
    CurrencyInput,
    DetailsTable,
    StringInput,
    DetailsMove
  },
  watch: {
    masterCategoriesById: {
      handler: function () {
        this.getMonthTransactions()
      }
    }
  },
  computed: {
    ...mapGetters(['masterCategoriesById', 'categoriesById', 'categoryColors', 'categories']),
    ...mapGetters('categoryMonth', [
      'selectedCategory',
      'monthStats',
      'editedCategoryBudgetId',
      'editedCategoryNameId',
      'editedCategoryBudgetLoading',
      'editedCategoryNameLoading',
      'categoriesDataSortedByBalance'
    ])
  },
  methods: {
    ...mapActions(['fetchTransactionsForMonth']),
    ...mapActions('categoryMonth', [
      'getMonthTransactions',
      'onCategoryNameChange',
      'onCategoryBudgetChanged',
      'onEditCategoryName',
      'onEditCategoryBudget',
      'onMovingToClicked',
      'onMovingFromClicked'
    ]),
    ...mapMutations('categoryMonth', ['RESET_SELECTED_CATEGORY']),
    onUnselectCategory() {
      this.RESET_SELECTED_CATEGORY()
    },
    isEditingName() {
      if (this.selectedCategory._id.slice(ID_LENGTH.category) === NONE._id) {
        return false
      } else {
        return this.selectedCategory._id === this.editedCategoryNameId
      }
    }
  }
}
</script>

<style>
.category-details-title {
  width: 100%;
  overflow-y: auto;
}

.category-budget-input {
  max-width: 110px;
}
</style>
