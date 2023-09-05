<template>
  <div
    v-if="!isSplit"
    class="transaction-categories-container mr-2"
    :style="`grid-template-columns: ${templateColumns}`"
  >
    <!-- :item="item" -->
    <category-menu
      :category-id="item.category ? item.category : ''"
      :splits="item.splits"
      :disabled="isDisabled"
      :button-testid="`category-menu-${item._id.slice(-ID_LENGTH.transaction)}`"
      @selected="onCategorySelected"
    />
  </div>
  <div v-else class="transaction-categories-container mr-2" :style="`grid-template-columns: ${templateColumns}`">
    <template v-for="(split, index) in this.item.splits.slice(0, 2)" :key="`category-${index}`">
      <category-menu
        :category-id="split.category ? split.category : ''"
        :disabled="isDisabled"
        :button-testid="`category-menu-${item._id.slice(-ID_LENGTH.transaction)}_${index}`"
        @selected="
          (categoryId) => {
            onSplitCategorySelected(index, categoryId)
          }
        "
      />
      <!-- <span v-if="index === 1 && item.splits.length > 2" class="text-body-2">...</span> -->
    </template>
    <span v-if="item.splits.length > 2" class="pt-0">...</span>
  </div>
</template>

<script>
import { ID_LENGTH } from '../../constants'
import { mapActions, mapGetters } from 'vuex'
import CategoryMenu from '../Shared/CategoryMenu.vue'

export default {
  props: {
    item: {
      type: Object
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ID_LENGTH
    }
  },
  components: { CategoryMenu },
  computed: {
    ...mapGetters('accountTransactions', ['selectedTransactions', 'editedTransaction', 'tableIsDisabled']),
    templateColumns() {
      if (this.isSplit) {
        return `repeat(${Math.min(this.item.splits.length, 2)}, 1fr) min-content`
      }
      return '1fr'
    },
    isSplit() {
      return this.item.splits && this.item.splits.length > 1
    },
    isDisabled() {
      // return this.highlighted || this.selectedTransactions.length > 0;
      return this.editedTransaction._id === this.item._id || this.tableIsDisabled
    }
  },
  methods: {
    ...mapActions('accountTransactions', ['getTransactions']),
    ...mapActions(['commitDocToPouchAndVuex']),
    onCategorySelected(categoryId) {
      const current = { ...this.item, category: categoryId }
      const previous = this.item
      this.commitDocToPouchAndVuex({ current, previous }).then(() => {
        this.getTransactions()
      })
    },
    onSplitCategorySelected(index, categoryId) {
      const splits = this.item.splits.map((split, i) => {
        if (i === index) {
          return { ...split, category: categoryId }
        } else {
          return split
        }
      })
      const current = { ...this.item, splits }
      const previous = this.item
      this.commitDocToPouchAndVuex({ current, previous }).then(() => {
        this.getTransactions()
      })
    }
  }
}
</script>

<style>
.transaction-categories-container {
  display: grid;
  grid-gap: 0.5rem;
  width: 150px;
}

.transaction-categories-container > span {
  font-size: 1.4rem !important;
}
</style>
