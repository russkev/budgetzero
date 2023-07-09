<template>
  <v-container class="pa-0 category-rows-container">
    <v-divider />
    <category-row
      v-if="freezeFirstRow && frozenCategory"
      :category="frozenCategory"
      :master-category="masterCategory"
      freeze
      :hideBudgeted="hideBudgeted"
      :hideSpent="hideSpent"
      :hideBalance="hideBalance"
      :isIncome="isIncome"
    />
    <draggable
      class="categories-container"
      :data-testid="`categories-container-${masterCategory._id}`"
      :id="`categories-container-${masterCategory._id}`"
      :group="{ name: masterCategory._id, put: true }"
      handle=".handle"
      v-model="draggableCategories"
    >
      <category-row
        v-for="(category, index) in draggableCategories"
        :key="`${category._id}-${counter}`"
        :category="category"
        :master-category="masterCategory"
        :hideBudgeted="hideBudgeted"
        :hideSpent="hideSpent"
        :hideBalance="hideBalance"
        :isIncome="isIncome"
        :index="index"
      />
    </draggable>
    <v-row class="ma-0 pa-0">
      <v-sheet width="20px" color="transparent" class="row-side-widget" />
      <v-col class="ma-0 pa-0">
        <v-btn
          small
          tile
          text
          class="text-none"
          :data-testid="`btn-new-category-${masterCategory._id}`"
          @click="onNewCategory(masterCategory)"
        >
          <v-icon small class="ma-1" color="secondary lighten-3">mdi-plus</v-icon>
          <span class="secondary--text text--lighten-3"> New Category </span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import { nextTick } from 'vue'
import CategoryHide from './CategoryHide.vue'

export default {
  props: {
    masterCategory: {
      type: Object,
      default: {}
    },
    nameCols: {
      type: Number,
      default: 5
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
    isIncome: {
      type: Boolean,
      default: false
    },
    freezeFirstRow: {
      type: Boolean,
      default: false
    }
  },
  components: {
    draggable,
    CategoryHide
  },
  data() {
    return {
      draggableCategoriesData: [],
      offset: this.freezeFirstRow ? 1 : 0,
      counter: 0
    }
  },
  watch: {
    categoriesData: {
      handler: function (val) {
        this.updateDraggableCategories(val)
      },
      deep: true
    }
  },
  created() {
    this.updateDraggableCategories(this.categoriesData)
  },
  computed: {
    ...mapGetters(['categories', 'categoriesById']),
    ...mapGetters('categoryMonth', ['editedCategoryBudgetId', 'editedCategoryNameId', 'categoriesData']),
    draggableCategories: {
      get() {
        return this.draggableCategoriesData
      },
      set(value) {
        this.draggableCategoriesData = value
        this.counter += 1
        const updated_categories = value.reduce((partial, category_data, index) => {
          const previous = this.categoriesById[category_data._id]
          if (!previous) {
            console.warn('Category not found in categoriesById', category_data._id)
            return partial
          }
          const current = {
            ...previous,
            sort: index + this.offset,
            masterCategory: this.masterCategory._id
          }
          partial.push({ current, previous })
          return partial
        }, [])
        this.commitBulkDocsToPouchAndVuex(updated_categories)
      }
    },
    frozenCategory() {
      if (this.freezeFirstRow && this.categoriesData[this.masterCategory._id].length > 0) {
        return this.categoriesData[this.masterCategory._id][0]
      } else {
        return null
      }
    }
  },
  methods: {
    ...mapActions('categoryMonth', ['onCategoryOrderChanged', 'newCategory', 'onEditCategoryName']),
    ...mapActions(['commitBulkDocsToPouchAndVuex']),
    onNewCategory(master_category) {
      this.newCategory(master_category).then((id) => {
        this.onEditCategoryName(id)
      })
    },
    updateDraggableCategories(categoriesData) {
      const data = categoriesData[this.masterCategory._id]
      if (data) {
        this.draggableCategoriesData = data.slice(this.offset)
      } else {
        return []
      }
    }
  }
}
</script>

<style>
.color-swatch-container {
  display: flex;
  align-items: center;
}
</style>
