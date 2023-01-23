<template>
  <div class="ma-0 pa-0" :key="category._id">
    <v-hover v-slot="{ hover }">
      <v-row :class="`ma-0 pa-0 category-row ${isSelected ? 'info darken-4' : ''}`">
        <v-sheet
          width="20px"
          color="transparent"
          class="row-side-widget"
          :data-testid="`drag-category-${category._id}`"
        >
          <v-icon v-if="hover && !freeze" small class="handle ma-auto"> mdi-drag-vertical </v-icon>
        </v-sheet>
        <v-sheet width="3px" class="mr-2 color-swatch-container" color="transparent">
          <v-sheet
            width="3px"
            height="18px"
            :color="categoryColors[category._id] === undefined ? 'transparent' : categoryColors[category._id]"
          />
        </v-sheet>
        <v-col class="pa-0 ma-0">
          <v-row class="ma-0 pa-0">
            <v-col :cols="nameCols" class="category-name pa-0 ma-0 my-1" :data-testid="`category-name-${category._id}`">
              <row-element-wrapper @click="onCategoryDetailsClick" class="mr-1">
                {{ category.name }}
              </row-element-wrapper>
            </v-col>
            <v-col
              :data-testid="`category-budget-${category._id}`"
              :id="`category-budget-${category._id}`"
              class="pa-0 my-1"
              v-if="!hideBudgeted"
            >
              <row-element-wrapper @click="onCategoryDetailsClick" class="justify-end ml-1">
                {{ intlCurrency.format(category.budgetDisplay) }}
              </row-element-wrapper>
            </v-col>
            <v-col :data-testid="`category-spent-${category._id}`" v-if="!hideSpent" align="right" class="pa-0 my-auto">
              <row-element-wrapper @click="onCategoryDetailsClick" class="justify-end ml-1">
                {{ spentValue(category) }}
              </row-element-wrapper>
            </v-col>
            <v-col
              :data-testid="`category-balance-${category._id}`"
              align="right"
              :class="`pa-0 my-auto ${balanceColor(category)}`"
              v-if="!hideBalance"
            >
              <row-element-wrapper @click="onCategoryDetailsClick" class="justify-end ml-1">
                {{ intlCurrency.format(category.balance / 100) }}
              </row-element-wrapper>
            </v-col>
          </v-row>
        </v-col>
        <category-hide v-if="!freeze" :masterCategory="masterCategory" :category="category" :hover="hover" />
        <v-sheet v-else width="20px" color="transparent" />
        <v-sheet width="20px" color="transparent" />
      </v-row>
    </v-hover>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { ID_LENGTH, NONE } from '../../constants'
import { nextTick } from 'vue'

export default {
  props: {
    category: {
      type: Object,
      required: true
    },
    freeze: {
      type: Boolean,
      default: false
    },
    masterCategory: {
      type: Object,
      required: true
    },
    hideBudgeted: {
      type: Boolean,
      default: false
    },
    hideSpent: {
      type: Boolean,
      default: false
    },
    hideBalance: {
      type: Boolean,
      default: false
    },
    nameCols: {
      type: Number,
      default: 5
    },
    isIncome: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters(['intlCurrency', 'categoryColors', 'categories', 'categoriesByMaster', 'masterCategories']),
    ...mapGetters('categoryMonth', [
      'editedCategoryBudgetId',
      'editedCategoryNameId',
      'categoriesData',
      'selectedCategory'
    ]),
    negativeMultiplier() {
      return this.isIncome ? 1 : -1
    },
    isSelected() {
      if (!this.selectedCategory) {
        return false
      } else {
        return this.selectedCategory._id === this.category._id
      }
    }
  },

  methods: {
    ...mapMutations('categoryMonth', ['SET_EDITED_CATEGORY_BUDGET_ID']),
    ...mapActions('categoryMonth', [
      'onCategoryNameChange',
      'onCategoryBudgetChanged',
      'onEditCategoryName',
      'onEditCategoryBudget',
      'selectCategory'
    ]),

    onCategoryBudgetEnter(category, event) {
      document.activeElement.blur()
      let next_category = null
      if (category.sort < this.categoriesByMaster[this.masterCategory._id].length - 1) {
        next_category = this.categoriesByMaster[this.masterCategory._id][category.sort + 1]
      } else {
        const next_master_category = this.masterCategories.find(
          (master_category) => master_category.sort === this.masterCategory.sort + 1
        )
        if (next_master_category) {
          next_category = this.categoriesByMaster[next_master_category._id.slice(-ID_LENGTH.category)][0]
        }
      }
      if (!next_category) {
        return
      }
      const next_budget_id = `category-budget-input-${next_category._id.slice(-ID_LENGTH.category)}`
      const next_category_input = document.getElementById(next_budget_id)
      if (next_category_input) {
        this.SET_EDITED_CATEGORY_BUDGET_ID(next_category._id)
        // next_category_input.focus();
        nextTick(() => {
          next_category_input.select()
        })
      }
    },
    balanceColor(category) {
      if (category.balance < 0) {
        return `error--text text--lighten-3`
      } else if (category.balance > 0) {
        return `success--text text--lighten-3`
      } else {
        return ''
      }
    },
    spentValue(category) {
      const amount = category.income - category.expense
      if (this.isIncome || amount == 0) {
        return this.intlCurrency.format(amount / 100)
      } else {
        return this.intlCurrency.format(-amount / 100)
      }
    },
    onCategoryDetailsClick() {
      this.selectCategory(this.category)
    }
  }
}
</script>

<style>
.justify-end {
  justify-content: flex-end;
}
</style>
