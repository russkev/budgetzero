<template>
  <v-card width="100%" flat color="background lighten-1" class="category-details-title flex-sheet ma-0 ml-2">
    <v-card-title v-if="selectedCategory" class="background lighten-1 pa-3" data-testid="details-title">
      <string-input
        class="category-name-input"
        :id="`category-name-input-${selectedCategory._id}`"
        :data-testid="`category-name-input-${selectedCategory._id}`"
        :value="selectedCategory.name"
        :is-editing="isEditingName"
        :disabled="loading"
        text="h4"
        @input="onCategoryNameChange"
        @edit="onEditCategoryName(selectedCategory._id)"
      />
      <!-- Update Selected -->
      <v-icon @click="onUnselectCategory" class="ml-auto">mdi-close</v-icon>
    </v-card-title>
    <v-divider v-if="selectedCategory" :style="`border-bottom: 2px solid ${categoryColor};`" />
    <v-card-title v-else class="background lighten-1 pa-3" data-testid="details-title"> All Categories </v-card-title>
    <div v-if="selectedCategory" class="transaction-details-grid pa-2 pb-0" @keydown.esc.prevent="onUnselectCategory">
      <!-- <div class="text-h5">Name</div>
      <div>
      </div> -->

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
      <div class="text-h5">Danger</div>
      <div>
        <delete-confirm
          @confirm="onDeleteCategory"
          titleText="Delete Category"
          bodyText="Are you sure you want to delete this category? (there are no associated transactions)"
        >
          <template #activator="{ on }">
            <v-btn
              v-on="on"
              text
              width="min-content"
              color="error lighten-1"
              data-testid="delete-category-button"
              :disabled="deleteDisabled || !isDeletable"
              :loading="deleteLoading"
            >
              <v-icon small left>mdi-delete</v-icon>
              Delete
            </v-btn>
          </template>
          <!-- TODO: Make this only enabled if allCategoryBalances is False -->
        </delete-confirm>
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
import { ID_LENGTH, NONE, UNDELETABLE_IDS } from '../../constants'
import StringInput from '../Shared/StringInput.vue'
import DetailsMove from './DetailsMove.vue'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'

export default {
  name: 'CategoryDetails',
  components: {
    CategoriesWorking,
    CurrencyInput,
    DetailsTable,
    StringInput,
    DetailsMove,
    DeleteConfirm
  },
  watch: {
    masterCategoriesById: {
      handler: function () {
        this.getMonthTransactions()
      }
    },
    selectedCategory: {
      handler: function () {
        this.getTransactionsWithCategoryExist()
      }
    }
  },
  data() {
    return {
      localNote: '',
      noteApplyClicked: false,
      noteDebounce: false,
      deleteLoading: false,
      deleteDisabled: true,
      deleteTaskId: 0
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
      if (this.selectedCategory._id === NONE._id) {
        return false
      } else {
        return this.selectedCategory._id === this.editedCategoryNameId
      }
    },
    isDeletable() {
      return !UNDELETABLE_IDS.includes(this.selectedCategory._id)
    }
  },
  methods: {
    ...mapActions(['fetchTransactionsForMonth', 'fetchTransactionsWithCategoryExist', 'deleteCategory']),
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
    },
    onDeleteCategory() {
      this.deleteCategory(this.selectedCategory._id).then(() => {
        this.getMonthTransactions()
      })
      this.RESET_SELECTED_CATEGORY()
    },
    getTransactionsWithCategoryExist() {
      if (!this.selectedCategory || !this.isDeletable) {
        return
      }
      this.deleteLoading = true
      this.deleteDisabled = true
      this.deleteTaskId += 1
      const taskId = this.deleteTaskId
      this.fetchTransactionsWithCategoryExist(this.selectedCategory._id)
        .then((transactionsExist) => {
          if (!transactionsExist && taskId === this.deleteTaskId) {
            this.deleteDisabled = false
          }
        })
        .finally(() => {
          if (taskId === this.deleteTaskId) {
            this.deleteLoading = false
          }
        })
    }
  }
}
</script>

<style>
.category-details-title {
  width: 100%;
  overflow-y: auto;
}

.category-details-title > div.v-card__title {
  flex-wrap: inherit;
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
