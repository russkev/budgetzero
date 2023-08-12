<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title flex-sheet ma-0 ml-2">
    <v-card-title v-if="selectedCategory" class="background lighten-2 pa-3" data-testid="details-title">
      Update Selected
      <v-icon @click="onUnselectCategory" class="ml-auto">mdi-close</v-icon>
    </v-card-title>
    <v-divider v-if="selectedCategory" :style="`border-bottom: 2px solid ${categoryColor};`" />
    <v-card-title v-else class="background lighten-1 pa-3" data-testid="details-title"> All Categories </v-card-title>
    <div v-if="selectedCategory" class="transaction-details-grid pa-2 pb-0" @keydown.esc.prevent="onUnselectCategory">
      <div class="text-h5">Name</div>
      <div>
        <string-input
          class="category-name-input"
          :id="`category-name-input-${selectedCategory._id}`"
          :data-testid="`category-name-input-${selectedCategory._id}`"
          :value="selectedCategory.name"
          :is-editing="isEditingName"
          :disabled="loading"
          @input="onCategoryNameChange"
          @edit="onEditCategoryName(selectedCategory._id)"
        />
      </div>

      <div class="text-h5">Budgeted</div>
      <div>
        <string-input
          currency
          currency-left
          class="category-budget-input"
          :id="`category-budget-input-${selectedCategory._id}`"
          :data-testid="`category-budget-input-${selectedCategory._id}`"
          :value="selectedCategory.budgetDisplay"
          :is-editing="editedCategoryBudgetId == selectedCategory._id"
          :disabled="loading"
          @input="onBudgetValueApply"
          @edit="onEditCategoryBudget(selectedCategory._id)"
        />
      </div>
      <div class="text-h5">Note</div>
      <div>
        <v-hover v-slot="{ hover }">
          <div :data-testid="`category-budget-note-${selectedCategory._id}`">
            <v-textarea
              v-model="note"
              class="category-budget-note text-body-1 mb-2"
              dense
              flat
              solo
              hide-details
              :disabled="loading"
              :background-color="hover ? 'background lighten-2' : 'transparent'"
              @change="onNoteUpdate"
              @keydown.ctrl.enter.exact.prevent="onNoteUpdate"
              @blur="onNoteBlur"
            />
          </div>
        </v-hover>
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
          include-spent
        />
      </div>
      <div class="text-h5">Move</div>
      <div id="details-move-container">
        <details-move />
      </div>
    </div>
    <div v-else class="transaction-details-grid pa-2 pb-0">
      <div class="text-h5">Working</div>
      <div>
        <!-- Don't need to include monthStats.spent_this_month since this would make tool less useful -->
        <categories-working
          :last-month="monthStats.available_last_month"
          :income="monthStats.income_this_month"
          :spent="monthStats.spent_this_month"
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
  data() {
    return {
      localNote: '',
      noteApplyClicked: false,
      noteDebounce: false
    }
  },
  computed: {
    ...mapGetters(['masterCategoriesById', 'categoriesById', 'categoryColors', 'categories', 'allCategoryBalances']),
    ...mapGetters('categoryMonth', [
      'selectedCategory',
      'monthStats',
      'editedCategoryBudgetId',
      'editedCategoryNameId',
      'categoryLoading',
      'categoryLoading',
      'categoryLoading',
      'categoriesDataSortedByBalance',
      'thisMonth'
    ]),
    note: {
      get() {
        return _.get(this.selectedCategory, 'note', '')
      },
      set(value) {
        this.localNote = value
      }
    },
    categoryColor() {
      return _.get(this.categoryColors, [this.selectedCategory._id, 'main'], 'transparent')
    },
    loading() {
      return this.categoryLoading || this.categoryLoading || this.categoryLoading
    },
    isEditingName() {
      if (this.selectedCategory._id.slice(ID_LENGTH.category) === NONE._id) {
        return false
      } else {
        return this.selectedCategory._id === this.editedCategoryNameId
      }
    }
  },
  methods: {
    ...mapActions(['fetchTransactionsForMonth']),
    ...mapActions('categoryMonth', [
      'getMonthTransactions',
      'onCategoryNameChange',
      'onCategoryBudgetChanged',
      'onEditCategoryName',
      'onEditCategoryBudget',
      'updateNote'
    ]),
    ...mapMutations('categoryMonth', ['RESET_SELECTED_CATEGORY']),
    onUnselectCategory() {
      this.RESET_SELECTED_CATEGORY()
    },
    onNoteBlur(event) {
      this.onNoteUpdate(event.target.value)
    },
    onNoteUpdate(event) {
      if (this.noteDebounce) {
        return
      }
      if (typeof event !== 'string' && !(event instanceof String)) {
        console.warn('Note input: onApply called with non-string event', event)
        return
      }
      this.noteDebounce = true
      this.updateNote({
        category_id: this.selectedCategory._id,
        note: event
      })
      setTimeout(() => {
        this.noteDebounce = false
      }, 10)
    },
    onBudgetValueApply(value) {
      this.onCategoryBudgetChanged({ category_id: this.selectedCategory._id, value })
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

div#details-move-container {
  overflow: auto;
}

div#details-move-container > div {
  display: flex;
  flex-direction: column;
}
</style>
