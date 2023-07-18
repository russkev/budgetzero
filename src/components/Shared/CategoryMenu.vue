<template>
  <v-menu offset-y bottom @input="onMenuClose">
    <template #activator="{ on: menuOn }">
      <v-tooltip bottom class="pa-0" color="transparent" :open-delay="500">
        <template #activator="{ on: tooltipOn }">
          <v-btn
            id="category-menu-button"
            small
            label
            rounded
            depressed
            height="22"
            class="simple-ellipsis"
            :color="mainColor"
            :data-testid="buttonTestid"
            :disabled="disabled"
            v-on="{ ...tooltipOn, ...menuOn }"
            :style="`background-color: ${backgroundColor}; color: ${textColor};`"
          >
            <category-item-text :category="selectedCategory" :show-balance="showBalance">
              <div :class="`simple-ellipsis ${itemIsUncategorized ? 'font-weight-bold' : ''}`">
                {{ selectedCategoryName }}
              </div>
            </category-item-text>
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-card v-if="!menu" flat outlined color="outline background" class="ma-0 px-4 py-1">
          <v-card-subtitle class="ma-0 pa-0"> Category: </v-card-subtitle>
          <v-card-title class="ma-0 pa-0" v-if="!itemIsUncategorized">
            {{ masterCategoryName }}: {{ selectedCategoryName }}
          </v-card-title>
          <v-card-title class="ma-0 pa-0" v-else>
            {{ selectedCategoryName }}
          </v-card-title>
        </v-card>
        <div v-else></div>
      </v-tooltip>
    </template>
    <category-select
      @selected="onSelected"
      :show-balance="showBalance"
      v-model="search"
      :disable-categories="disableCategories"
    />
  </v-menu>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { ID_LENGTH, NONE } from '../../constants'
import CategorySelect from './CategorySelect.vue'
import CategoryItemText from './CategoryItemText.vue'
import { isUncategorized } from '../../store/modules/transaction-module'

export default {
  emits: ['selected'],
  components: { CategorySelect, CategoryItemText },
  props: {
    // item: {
    //   required: true,
    //   type: Object,
    // },
    categoryId: {
      required: true,
      type: String
    },
    splits: {
      required: false,
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    buttonTestid: {
      type: String,
      required: false,
      default: ''
    },
    showBalance: {
      type: Boolean,
      required: false,
      default: false
    },
    disableCategories: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      menu: false,
      search: ''
    }
  },
  computed: {
    ...mapGetters(['categoryColors', 'categories', 'categoriesById', 'masterCategoriesById', 'masterCategoriesById']),
    ...mapGetters('accountTransactions', ['selectedTransactions']),
    selectedCategory() {
      let result = this.categoriesById[this.categoryId]
      if (result === undefined) {
        result = NONE
      }
      return result
    },
    textColor() {
      if (this.itemIsUncategorized) {
        return NONE.hexColor
      }
      // const hsla = _.get(this.masterCategoriesById, [this.selectedCategory.masterCategory, 'color', 'hsla'], {
      //   a: 1,
      //   h: 0,
      //   l: 1,
      //   s: 0
      // })
      // return `hsl(${hsla.h}, ${hsla.s * 100}%, 90%)`
      return _.get(this.categoryColors, [this.categoryId, 'text'], 'white')
    },
    mainColor() {
      return _.get(this.categoryColors, [this.categoryId, 'main'], NONE.hexColor)
    },
    backgroundColor() {
      if (this.itemIsUncategorized) {
        return 'var(--v-secondary-lighten2)'
      }
      return _.get(this.categoryColors, [this.categoryId, 'background'], 'transparent')
    },
    selectedCategoryName() {
      if (this.selectedCategory === undefined) {
        return NONE.name
      }
      return this.selectedCategory.name
    },
    masterCategoryName() {
      if (
        this.selectedCategory === undefined ||
        this.selectedCategory === null ||
        this.selectedCategory.masterCategory === undefined
      ) {
        return NONE.name
      }
      const masterCategory = this.masterCategoriesById[this.selectedCategory.masterCategory]
      if (masterCategory === undefined) {
        return NONE.name
      }
      return masterCategory.name
    },

    itemIsUncategorized() {
      return isUncategorized({ categoryId: this.categoryId, splits: this.splits })
    }
  },
  methods: {
    onSelected(categoryId) {
      const id = categoryId.slice(-ID_LENGTH.category)
      if (id !== this.categoryId) {
        this.$emit('selected', id)
      }
      this.menu = false
    },
    onMenuClose() {
      setTimeout(() => {
        this.search = ''
      }, 500)
    }
  }
}
</script>

<style>
.outline {
  outline: 1px solid var(--v-background-lighten5);
}

.simple-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-chip,
.v-chip__content {
  width: 100%;
}

#category-menu-button {
  max-width: min-content;
  text-transform: none;
  font-size: 0.83rem;
  font-weight: 400;
  letter-spacing: 0;
}

#category-menu-button .v-btn__content {
  width: 100%;
}

#category-menu-button .category-element-container {
  overflow: hidden;
}

#category-menu-button .category-element-container span {
  width: 100%;
}
</style>
