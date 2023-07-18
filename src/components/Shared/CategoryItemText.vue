<template>
  <span class="category-element-container">
    <span>
      <v-sheet v-if="showSwatch" width="3px" height="15px" :color="categoryColor" class="mr-1" />
      <slot>
        {{ category.name }}
      </slot>
    </span>
    <span v-if="showBalance" :class="`ml-2 ${currencyColor}`">
      {{ intlCurrency.format(categoryBalance / 100) }}
    </span>
  </span>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ID_LENGTH, NONE, HIDDEN, AMOUNT_RED, AMOUNT_GREEN } from '../../constants'

export default {
  name: 'CategoryItemText',
  props: {
    category: {
      required: true,
      type: Object
    },
    showBalance: {
      type: Boolean,
      required: false,
      default: false
    },
    showSwatch: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapGetters(['categoryColors', 'categoriesById', 'masterCategoriesById', 'intlCurrency']),
    ...mapGetters('categoryMonth', ['categoriesDataById']),
    categoryColor() {
      // return this.categoryColors[this.category._id.slice(-ID_LENGTH.category)]
      return _.get(this.categoryColors, [this.category._id.slice(-ID_LENGTH.category), 'main'], 'transparent')
    },
    categoryBalance() {
      return _.get(this.categoriesDataById, [this.category._id.slice(-ID_LENGTH.category), 'balance'], 0)
    },
    currencyColor() {
      if (this.disabled) {
        return ''
      } else if (this.categoryBalance < 0) {
        return AMOUNT_RED
      } else if (this.categoryBalance > 0) {
        return AMOUNT_GREEN
      } else {
        return 'unset'
      }
    }
  }
}
</script>

<style>
.category-element-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  /* width: 100%; */
}

.category-element-container span {
  display: flex;
  flex-direction: row;
}
</style>
