<template>
  <v-container fluid class="pa-0">
    <!-- Modal to create category group  -->
    <BaseDialogModalComponent v-model="isModalVisibleMasterCat">
      <template #title>
        Create a Category Group:
      </template>
      <template #body>
        <v-text-field
          id="txt_field_category_name"
          v-model="category_name"
          label="New category group"
          required
          tabindex="0"
          @keyup.enter="createMasterCategory(category_name)"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleMasterCat = false">
          Cancel
        </v-btn>
        <v-btn id="btn-createMasterCategory" color="accent" text @click="createMasterCategory(category_name)">
          Create
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <!-- Modal to edit category group  -->
    <BaseDialogModalComponent v-model="isModalVisibleEditCategory">
      <template #title>
        Edit Category Name:
      </template>
      <template #body>
        <v-text-field
          id="txt-categoryName"
          v-model="editedCategory.name"
          label="Category name"
          required
          tabindex="0"
          @keyup.enter="saveCategory()"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleEditCategory = false">
          Cancel
        </v-btn>
        <v-btn id="btn-save" color="accent" text @click="saveCategory()">
          Save
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <!-- Modal to add sub category  -->
    <BaseDialogModalComponent v-model="isModalVisibleCreateSubCategory">
      <template #title> Create Category for {{ editedCategory.name }}: </template>
      <template #body>
        <v-text-field
          v-model="category_name"
          label="Category"
          required
          tabindex="0"
          @keyup.enter="createCategory(category_name)"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleCreateSubCategory = false">
          Cancel
        </v-btn>
        <v-btn color="accent" text @click="createCategory(category_name)">
          Create
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <v-row elevation="4" class="grey lighten-4 ma-0">
      <v-col align="center" justify="center">
        <v-btn small elevation="0" class="grey lighten-2" :to="{ path: `/budget/${prev_month}`}">
          <v-icon medium> mdi-chevron-left </v-icon>Previous month
        </v-btn>
        <v-btn id="btn-today" medium elevation="0" class="grey lighten-2 ml-4" :to="{ path: `/budget/${this_month}`}">
          Today
        </v-btn>
        <v-btn small elevation="0" class="grey lighten-2 ml-4" :to="{ path: `/budget/${next_month}`}">
          Next month
          <v-icon medium>
            mdi-chevron-right
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-divider />

    <v-row justify="space-between" class="ma-0 pt-2">
      <v-col sm="auto" />
      <v-col sm="auto">
        <BudgetHeader />
      </v-col>
    </v-row>

    <v-row class="mx-2 mt-0 mb-1" justify="end" align="end">
      <v-col class="pa-0">
        <v-btn
          id="btn-add-category-group"
          small
          color="grey lighten-2"
          elevation="0"
          class="mb-2 mr-2"
          @click.stop="isModalVisibleMasterCat = true"
        >
          <v-icon left> mdi-plus </v-icon>Category Group
        </v-btn>

        <v-btn
          id="btn-modify"
          small
          color="grey lighten-2"
          elevation="0"
          class="mb-2"
          @click.stop="isReorderingCategories = !isReorderingCategories"
        >
          <v-icon left>
            mdi-drag-horizontal-variant
          </v-icon>
          <span v-if="!isReorderingCategories"> Modify </span>
          <span v-else> Done </span>
        </v-btn>
      </v-col>
      <v-col id="budgeted-header" class="money-amount subtitle font-weight-medium">
        Budgeted
      </v-col>
      <v-col id="spent-header" class="money-amount subtitle font-weight-medium">
        Spent
      </v-col>
      <v-col id="balance-header" class="money-amount subtitle font-weight-medium">
        Balance
      </v-col>
    </v-row>

    <!-- 
      Display row for uncategorized if they exist for this month
     -->
    <v-row v-if="getBalanceValue(null) !== 0" class="elevation-0 ma-0 pa-0 yellow lighten-2">
      <v-col class="masterCategory-row ">
        <v-chip class="py-0">
          <span class="subtitle font-weight-medium primary--text">Uncategorized</span>
        </v-chip>
      </v-col>
      <v-col sm="auto" class="px-0 py-1" />
      <v-col sm="auto" class="px-0 py-1">
        <div class="money-amount subtitle-2 pt-1">
          {{ getSpentValue(null) | currency }}
        </div>
      </v-col>
      <v-col sm="auto" class="px-0 py-1">
        <div class="money-amount subtitle-2 red--text pt-1">
          {{ getBalanceValue(null) | currency }}
        </div>
      </v-col>
    </v-row>

    <draggable
      v-model="masterCategories"
      tag="div"
      class="pt-0"
      handle=".handle"
      :group="{ name: 'people', pull: 'false', put: false }"
    >
      <v-col
        v-for="category in masterCategories.filter(category => !category.hidden || isReorderingCategories)"
        :key="category._id"
        class="pa-0"
      >
        <v-row class="primary lighten-2 elevation-0 ma-0 pa-0">
          <v-col class="masterCategory-row">
            <v-icon v-if="isReorderingCategories" class="handle pr-2" color="white">
              mdi-drag-horizontal-variant
            </v-icon>
            <v-icon
              v-if="!isReorderingCategories && category.collapsed"
              class="mr-2"
              color="white"
              @click="collapseMasterCategory(category)"
            >
              mdi-chevron-right
            </v-icon>
            <v-icon
              v-if="!isReorderingCategories && !category.collapsed"
              class="mr-2"
              color="white"
              tabindex="-1"
              @click="collapseMasterCategory(category)"
            >
              mdi-chevron-down
            </v-icon>
            <span
              class="subtitle font-weight-medium white--text"
              :class="{ 'text-decoration-line-through': category.hidden }"
              >{{ category.name }}
            </span>
            <v-btn
              v-if="isReorderingCategories"
              id="btn-editCategoryGroup"
              icon
              small
              dark
              color="white"
              @click="editCategory(category)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-if="isReorderingCategories" icon small dark color="white" @click="addSubCategory(category)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn v-if="isReorderingCategories" icon small dark color="white" @click="hideCategory(category)">
              <v-icon v-if="!category.hidden">
                mdi-eye
              </v-icon>
              <v-icon v-if="category.hidden">
                mdi-eye-off
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Container under each master category containing all individual categories -->
        <draggable
          v-if="categoriesGroupedByMaster[category._id.slice(-ID_LENGTH.category)] && !category.collapsed"
          tag="div"
          :class="category._id.slice(-ID_LENGTH.category)"
          :group="{ name: category._id.slice(-ID_LENGTH.category), put: true }"
          handle=".handle"
          @end="subCategoryMoveEnd"
        >
          <!-- Each individual category row -->
          <v-row
            v-for="item in categoriesGroupedByMaster[category._id.slice(-ID_LENGTH.category)]
              .sort((a, b) => (a.sort > b.sort ? 1 : -1))
              .filter(category => !category.hidden || isReorderingCategories)"
            :key="item._id"
            class="category-row ma-0"
            align="center"
          >
            <v-col class="py-0 pt-0">
              <v-icon v-if="isReorderingCategories" class="handle pr-1">
                mdi-drag-horizontal-variant
              </v-icon>
              <span :class="{ 'text-decoration-line-through': item.hidden }">{{ item.name }}</span>
              <v-btn
                v-if="isReorderingCategories"
                id="btn-editCategory"
                icon
                small
                dark
                color="grey darken-4"
                class="pb-1"
                @click="renameCategory(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn v-if="isReorderingCategories" icon small dark color="grey darken-4" @click="hideCategory(item)">
                <v-icon v-if="!item.hidden">
                  mdi-eye
                </v-icon>
                <v-icon v-if="item.hidden">
                  mdi-eye-off
                </v-icon>
              </v-btn>
            </v-col>

            <v-col sm="auto" class="pa-0 black--text budget-input-col" align="top">
              <v-text-field
                id="budget-input"
                dense
                class="budgeted-amount subtitle-2 grey--text"
                :class="{
                  'budgeted-amount-neg': selectedMonthCategoryBudgets[item._id.slice(-ID_LENGTH.monthCategory)].budget < 0,
                  'budgeted-amount-zero': selectedMonthCategoryBudgets[item._id.slice(-ID_LENGTH.monthCategory)].budget == 0
                }"
                :value="selectedMonthCategoryBudgets[item._id.slice(-ID_LENGTH.monthCategory)].budget"
                prefix="$"
                hide-details
                @change="budgetValueChanged(item, $event)"
                @focus="onFocus"
              />
            </v-col>

            <v-col sm="auto" class="px-0 py-1">
              <div
                class="spent-amount subtitle-2"
                :class="{
                  'primary--text': selectedMonthCategoryBudgets[item._id.slice(-ID_LENGTH.monthCategory)].budget < 0,
                  'grey--text': selectedMonthCategoryBudgets[item._id.slice(-ID_LENGTH.monthCategory)].budget == 0
                }"
              >
                {{ getSpentValue(item._id) | currency }}
              </div>
            </v-col>

            <v-col sm="auto" class="px-0 py-1">
              <div
                class="balance-amount subtitle-2"
                :class="{
                  'red--text': getBalanceValue(item._id) < 0,
                  'grey--text': getBalanceValue(item._id) == 0
                }"
                :category_uid="item._id"
              >
                {{ getBalanceValue(item._id) | currency }}
                <v-btn icon x-small tabindex="-1" @click.stop="flipOverspending(item)">
                  <v-icon v-if="getOverspendingProperty(item)" color="red" tabindex="-1">
                    mdi-arrow-right
                  </v-icon>
                  <v-icon v-else tabindex="-1">
                    mdi-arrow-right
                  </v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </draggable>
      </v-col>
    </draggable>
  </v-container>
  <!-- </section> -->
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import BudgetHeader from './BudgetHeader.vue'
import _ from 'lodash'
import draggable from 'vuedraggable'
import { DEFAULT_MONTH_CATEGORY, ID_LENGTH, ID_NAME, INITIAL_MONTH_CATEGORIES } from '../../constants'
import { prevMonth, nextMonth } from '../../helper'

export default {
  name: 'BudgetGrid',
  components: {
    draggable,
    BaseDialogModalComponent,
    BudgetHeader,
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
    ...mapGetters(['selectedBudgetID', 'monthlyCategoryData', 'monthCategoryBudgets', 'selectedMonth']),
    masterCategories: {
      get() {
        return this.$store.getters.masterCategories
      },
      set(value) {

        this.$store.commit('REORDER_MASTER_CATEGORIES', value)
      }
    },
    categoriesGroupedByMaster: {
      get() {
        return this.$store.getters.categoriesGroupedByMaster
      },
      set(value) {
        return
      }
    },
    categories: {
      get() {

        return this.$store.getters.categories
      },
      set(value) {
        this.$store.commit('setPages', value)
      }
    },
    prev_month() {
      return prevMonth(this.selectedMonth)
    },
    next_month() {
      return nextMonth(this.selectedMonth)
    },
    this_month() {
      return new Date().toISOString().substring(0, 7)
    },
    selectedMonthCategoryBudgets() {
      console.log("MONTHLY DATA")
      console.log(this.monthlyCategoryData)

      const existingValues = this.monthCategoryBudgets[this.selectedMonth]
      const skip_ids = new Set(INITIAL_MONTH_CATEGORIES.map((initial_category) => {
        return initial_category._id
      }))
      const result = this.$store.getters.categories.reduce((partial, category) => {
        if (skip_ids.has(category._id)) {
          return partial
        }
        const category_id = category._id.slice(-ID_LENGTH.category) 
        let monthCategory = {}
        if (existingValues === undefined || existingValues[category_id] === undefined) {
          monthCategory = {
            ... DEFAULT_MONTH_CATEGORY,
            _id: `b_${this.selectedBudgetID}${this.selectedMonth}_${category_id}`
          }
        } else {
          monthCategory = {
            ...existingValues[category_id],
            budget: existingValues[category_id].budget / 100
          }
        }
        return {...partial, [category_id]: monthCategory}
      }, {})
      return result
    }
  },
  
  mounted() {},
  created() {},
  beforeRouteUpdate (to, from, next) {
    this.$store.commit('UPDATE_SELECTED_MONTH', to.params.month)
    next()
  },
  methods: {
    ...mapActions(['updateCategoryAmount', 'deleteDocFromPouchAndVuex']),
    // ...mapMutations(['PREVIOUS_MONTH', 'ADD_MONTH', 'GO_TO_CURRENT_MONTH']),
    onFocus(param) {
      this.$nextTick(() => {
        param.target.select()
      })
    },
    log(value) {
      console.log("LOGGING")
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
    budgetValueChanged(item, event) {
      const month = this.selectedMonth
      const category_id = item._id.slice(-ID_LENGTH.category)
      var changed_data = {}
      changed_data.doc = {
        budget: Math.round(event * 100),
        overspending: null,
        note: '',
        _id: `b_${this.selectedBudgetID}${ID_NAME.monthCategory}${month}_${category_id}`
      }

      //Check if already exists
      if (
        this.monthCategoryBudgets[month] &&
        this.monthCategoryBudgets[month][category_id]
      ) {
        changed_data.doc._id = this.monthCategoryBudgets[month][category_id]._id
        changed_data.doc._rev = this.monthCategoryBudgets[month][category_id]._rev
        // console.log("PAYLOAD DOC")
        // console.log(payload.doc)
      }

      console.log('payload for budget', changed_data.doc)
      if (!isNaN(changed_data.doc.budget)) {
        this.$store.dispatch('updateCategoryAmount', changed_data.doc)
      }
    },
    getBudgetedValue(full_id) {
      console.log("MONTHLY DATA")
      console.log(this.monthlyCategoryData)
      const id = full_id ? full_id.slice(-ID_LENGTH.category) : null


      return (_.get(this.monthlyCategoryData, `${this.selectedMonth}.categories.${id}.budgeted`, 0) / 100).toFixed(2)
    },
    getSpentValue(full_id) {
      const id = full_id ? full_id.slice(-ID_LENGTH.category) : null

      return _.get(this.monthlyCategoryData, `${this.selectedMonth}.categories.${id}.spent`, 0) / 100
    },
    getBalanceValue(full_id) {
      const id = full_id ? full_id.slice(-ID_LENGTH.category) : null

      return _.get(this.monthlyCategoryData, [this.selectedMonth, 'categories', id, 'balance'], 0) / 100
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
        inputValidator: value => {
          if (!value) {
            return 'You need to write something!'
          }
        }
      })
      if (newCategoryName) {
        newItem.name = newCategoryName
        this.$store.dispatch('commitDocToPouchAndVuex', newItem)
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
  border-bottom: 1px solid rgb(182, 182, 182);
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