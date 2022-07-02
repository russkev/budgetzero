<template>
  <v-container class="pt-0">
    <v-row class="ma-0">
      <v-btn small :to="{ path: `/budget/${prevMonth}`}">
        <v-icon medium>mdi-chevron-left</v-icon> Previous month
      </v-btn>
      <v-btn  :to="{ path: `/budget/${thisMonth}`}">
        Today
      </v-btn>
      <v-btn small :to="{ path: `/budget/${nextMonth}`}">
        <v-icon medium>mdi-chevron-right</v-icon> Next month
      </v-btn>
    </v-row>
    <v-row justify="space-between" class="ma-0 pt-2">
      <v-col sm="auto"/>
      <v-col sm="auto">
        <BudgetHeader />
      </v-col>
    </v-row>
    <v-row>
      <v-col/>
      <v-col>
        Budget
      </v-col>
      <v-col>
        Spent
      </v-col>
      <v-col>
        Balance
      </v-col>
    </v-row>
    <v-row
      class="ma-0 pa-0"
      v-for="master_category in masterCategoriesData" 
      :key="master_category.id"
    >
      <v-container class="primary lighten-2" >
        <v-row>
          <v-col class="master-category-row">
            <h3>
              {{ masterCategoriesById[master_category.id].name}}
            </h3>
          </v-col>
          <v-col>
            {{ masterCategoriesStats[master_category.id].budget / 100 }}
          </v-col>
          <v-col>
            {{ masterCategoriesStats[master_category.id].spent / 100 }}
          </v-col>
          <v-col>
            {{ masterCategoriesStats[master_category.id].balance / 100 }}
          </v-col>
        </v-row> 
        </v-container>
        <v-container>
        <v-row 
          class="category-row ma-0"
          v-for="category in categoriesData[master_category.id]" 
          :key="category.id"
        >
          <v-col>
            {{ categoriesById[category.id].name}}
          </v-col>
          <v-col>
            <v-text-field 
              dense
              v-model="category.budget"
              @change="onCategoryBudgetChanged(category.id, $event)"
            />
          </v-col>
          <v-col>
            {{ category.spent }}
          </v-col>
          <v-col>
            {{ category.balance}}
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import BudgetHeader from './BudgetHeader.vue'
import _ from 'lodash'
import draggable from 'vuedraggable'
import { DEFAULT_MONTH_CATEGORY, ID_LENGTH, ID_NAME, UNCATEGORIZED } from '../../constants'
import { prevMonth, nextMonth } from '../../helper'
import moment from 'moment'

export default {
  name: 'BudgetGrid',
  components: {
    draggable,
    BaseDialogModalComponent,
    BudgetHeader
  },
  data() {
    return {
      ID_LENGTH,
      isReorderingCategories: false,
      category_name: '',
      isModalVisibleMasterCat: false,
      isModalVisibleCategory: false,
      isModalVisibleEditCategory: false,
      isModalVisibleCreateSubCategory: false,
      master_category_id: '',
      editedCategory: {},
      categoriesData: [],
      // selectedMonth: this.$store.selectedMonth,

      headers: [
        {
          text: 'Category name',
          align: 'left',
          value: 'name'
        },
        // { text: "Category", value: "id" },
        { text: 'Budgeted', value: 'budgeted', width: '25px' },
        { text: 'Spent', value: 'spent', width: '25px' },
        { text: 'Balance', value: 'balance', width: '25px' }
        // { text: "masterCategory", value: "masterCategory" }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'selectedBudgetId',
      'categoriesById',
      'masterCategories',
      'masterCategoriesById',
      'allCategoryBalances',
      'monthlyCategoryData',
      'monthCategoryBudgets',
      'selectedMonth',
      'monthsInUse',
      'categoriesGroupedByMaster'
    ]),
    masterCategories: {
      get() {
        return this.$store.getters.masterCategories
      },
      set(value) {
        this.$store.commit('REORDER_MASTER_CATEGORIES', value)
      }
    },
    masterCategoriesData() {
      return this.masterCategories
        .sort((a, b) => a.sort - b.sort)
        .map((master_category) => {
          return {
            id: master_category._id.slice(-ID_LENGTH.category)
          }
        })
    },
    masterCategoriesStats() {
      return this.masterCategories.reduce((partial, master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category)
        partial[master_id] = {budget: 0, spent: 0, balance: 0}
        const month_data = Object.values(_.get(this.allCategoryBalances, [this.selectedMonth, master_id], {}))
        month_data.map((category) => {
          const budget = _.get(category, ['doc', 'budget'], 0)
          const spent = _.get(category, ['spent'], 0)
          const carryover = _.get(category, ['carryover'], 0)
          partial[master_id].budget += budget
          partial[master_id].spent += spent
          partial[master_id].balance += budget + spent + carryover
        })
        return partial
      }, {})
    },
    categories: {
      get() {
        return this.$store.getters.categories
      },
      set(value) {
        this.$store.commit('setPages', value)
      }
    },
    prevMonth() {
      return prevMonth(this.selectedMonth)
    },
    nextMonth() {
      return nextMonth(this.selectedMonth)
    },
    thisMonth() {
      return moment(new Date()).format('YYYY-MM')
    },
  },
  mounted() {
    this.$store.commit('UPDATE_SELECTED_MONTH', this.$route.params.month)
    this.getCategoriesData()
  },
  created() {},
  beforeRouteUpdate(to, from, next) {
    this.$store.commit('UPDATE_SELECTED_MONTH', to.params.month)
    next()
  },
  watch: {
    allCategoryBalances: {
      handler() {
        this.getCategoriesData()
      },
    },
    selectedMonth: {
      handler() {
        this.getCategoriesData()
      }
    }
  },
  methods: {
    ...mapActions(['updateMonthCategory', 'deleteDocFromPouchAndVuex']),

    onFocus(param) {
      this.$nextTick(() => {
        param.target.select()
      })
    },
    log(value) {
      console.log('LOGGING')
      console.log(value)
    },
    collapseMasterCategory(category) {
      this.$store.dispatch('flipMasterCategoryCollapsed', category)
    },
    hideCategory(category) {
      this.$store.dispatch('flipCategoryHidden', category)
    },
    subCategoryMoveEnd(event) {
      this.$store.dispatch('reorderSubCategory', event)
    },
    editCategory(category) {
      this.editedCategory = JSON.parse(JSON.stringify(category))
      this.isModalVisibleEditCategory = true
    },
    addSubCategory(category) {
      this.editedCategory = JSON.parse(JSON.stringify(category))
      this.isModalVisibleCreateSubCategory = true
    },
    saveCategory() {
      this.$store.dispatch('updateCategory', this.editedCategory)
      this.doneEditing()
    },
    doneEditing() {
      this.editedCategory = {}
      this.isModalVisibleEditCategory = false
    },

    getCategoriesData() {
      console.log("GET CATEGORIES DATA")
      this.categoriesData = this.masterCategories.reduce((partial, master_category) => {
        const master_id = master_category._id.slice(-ID_LENGTH.category)

        if (!Array.isArray(this.categoriesGroupedByMaster[master_id])) {
          return partial
        }

        partial[master_id] = this.categoriesGroupedByMaster[master_id]
          .sort((a, b) => a.sort - b.sort)
          .map((category) => {
            const category_id = category._id.slice(-ID_LENGTH.category)
            const budget = _.get(
              this.allCategoryBalances,
              [this.selectedMonth, master_id, category_id, 'doc', 'budget'],
              0
            )
            const spent = _.get(
              this.allCategoryBalances,
              [this.selectedMonth, master_id, category_id, 'spent'],
              0
            )
            const carryover = _.get(
              this.allCategoryBalances,
              [this.selectedMonth, master_id, category_id, 'carryover'],
              0
            )
            return {
              id: category_id,
              budget: budget / 100,
              spent: spent / 100,
              balance: (budget + spent + carryover) / 100
            }
          })

        return partial
      }, {})
    },
    onCategoryBudgetChanged(category_id, event) {
      const month = this.selectedMonth
      const master_id = this.categoriesById[category_id]['masterCategory']


      let budget_value = parseInt(event)
      let current = null
      if (isNaN(budget_value)) {
        console.warn('Budget value is NaN')
        return
      }
      budget_value *= 100

      const previous = _.get(this.allCategoryBalances, [this.selectedMonth, master_id, category_id, 'doc'], null)

      if (previous === null) {
        current = {
          ...DEFAULT_MONTH_CATEGORY,
          _id: `b_${this.selectedBudgetId}${ID_NAME.monthCategory}${month}_${category_id}`,
          budget: budget_value
        }
      } else {
        current = {
          ...previous,
          budget: budget_value
        }
      }
      this.$store.dispatch('updateMonthCategory', { current, previous }).then(() => {
        this.getCategoriesData()
        // console.log(this.categoriesData)
      })
    },
    categoryCarryover(category) {
      if (category._id === null) {
        return partial
      }

      const category_id = category._id.slice(-ID_LENGTH.category)
      const master_id = category.masterCategory
      const all_months = this.monthsInUse
      let carryover = _.get(
        this.allCategoryBalances,
        [this.selectedMonth, master_id, category_id, 'carryover'],
        undefined
      )

      if (carryover === undefined && all_months && all_months.length > 0) {
        const month_index = all_months.indexOf(this.selectedMonth)
        let existing_month = all_months[0]
        const target_month = this.selectedMonth
        if (month_index > 0) {
          const prev_month = all_months[month_index - 1]
          carryover = this.getCategoryBalance(this.allCategoryBalances, prev_month, master_id, category_id)
        } else if (this.compareAscii(existing_month, target_month) < 0) {
          // let prev_month = this.monthsInUse[0]
          for (let i = 0; i < all_months.length; i++) {
            if (this.compareAscii(existing_month, target_month) < 0) {
              existing_month = all_months[i]
            } else {
              break
            }
          }
          carryover = this.getCategoryBalance(this.allCategoryBalances, existing_month, master_id, category_id)
        } else {
          carryover = 0
        }
      } else if (carryover === undefined) {
        carryover = 0
      }
      return carryover
    },
    categoryValue(category) {
      const month = this.selectedMonth
      const category_id = category._id ? category._id.slice(-ID_LENGTH.category) : null
      const master_id = category.masterCategory ? category.masterCategory : null
      return _.get(this.allCategoryBalances, [month, master_id, category_id], {})
    },
    getOverspendingProperty(item) {
      const id = item._id ? item._id.slice(-ID_LENGTH.category) : null

      return _.get(this.monthCategoryBudgets, `${this.selectedMonth}.${id}.overspending`, false)
    },
    deleteCategory(item) {
      this.deleteDocFromPouchAndVuex(item)
    },
    createMasterCategory(newCategoryGroupName) {
      if (newCategoryGroupName.length > 0) {
        this.$store.dispatch('createMasterCategory', newCategoryGroupName)
      }
      this.clear()
    },
    createCategory() {
      const payload = {
        master_category_id: this.editedCategory._id.slice(-ID_LENGTH.category),
        category_name: this.category_name
      }
      this.$store.dispatch('createCategory', payload)
      this.clear()
    },
    clear() {
      this.isModalVisibleCreateSubCategory = false
      this.master_category_id = ''
      this.isModalVisibleMasterCat = false
      this.isModalVisibleCategory = false
      this.category_name = ''
    },
    flipOverspending(item) {
      this.$store.dispatch('flipOverspending', item)
    },
    async renameCategory(item) {
      let newItem = JSON.parse(JSON.stringify(item))
      const { value: newCategoryName } = await this.$swal({
        title: 'Rename category',
        input: 'text',
        inputValue: item.name,
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write something!'
          }
        }
      })
      if (newCategoryName) {
        newItem.name = newCategoryName
        this.$store.dispatch('commitDocToPouchAndVuex', { current: newItem, previous: null })
      }
    }
  }
}
</script>

<style scoped>
.budgeted-amount >>> input {
  text-align: right !important;
}
.budgeted-amount-neg >>> input {
}
.budgeted-amount-pos >>> input {
  color: var(--v-primary-base);
}
.budgeted-amount-zero >>> input {
  color: grey;
}

.crud-actions {
  width: 200px;
  opacity: 0;
  transition: 0.2s ease-in-out;
}
tr:hover .crud-actions {
  opacity: 1;
}

.money-amount {
  text-align: right;
  min-width: 90px;
  width: 90px;
  max-width: 90px;
  padding-left: 0;
  padding-right: 5px;
}
.budgeted-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}
.spent-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}
.balance-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}

.header {
  text-align: right;
}
.category-row {
  /* border-bottom: 1px solid rgb(182, 182, 182); */
  height: 30px;
}

.masterCategory-row {
  padding: 5px 0px 5px 5px;
}

.uncategorized-row {
  border-top: 1px solid rgb(182, 182, 182);
  height: 50px;
}

.budget-input-col {
  margin-top: -1px;
  height: 30px;
}
</style>
