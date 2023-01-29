<template>
  <div v-if="!isSplit">
    <category-menu
      button-testid="details-category"
      :category-id="editedTransaction.category ? editedTransaction.category : ''"
      :splits="editedTransaction.splits"
      :item="editedTransaction"
      @selected="onCategorySelected"
    />
    <v-card
      color="transparent"
      flat
      tile
      @click="onSplitCategoryAdd"
      data-testid="add-split-button"
      class="ml-2 mt-2 secondary--text text--lighten-2"
    >
      <v-icon color="secondary lighten-2">mdi-plus</v-icon>
      Add split category
    </v-card>
  </div>
  <div v-else>
    <div class="splits-grid">
      <template v-for="(split, index) in splits">
        <category-menu
          :key="`category-${index}`"
          :category-id="split.category ? split.category : ''"
          @selected="
            (payload) => {
              onSplitCategorySelected(index, payload)
            }
          "
          :button-testid="`details-category-split-${index}`"
        />
        <!-- :item="split" -->
        <splits-value :inputTestid="`split-${index}-value`" :index="index" :key="`amount-${index}`" />
        <v-icon small :key="index" @click="onRemoveSplit(index)" class="mt-1"> mdi-close </v-icon>
      </template>
      <v-card
        color="transparent"
        flat
        tile
        @click="onSplitCategoryAdd"
        data-testid="add-split-button"
        class="splits-full-width ml-2 mt-2"
      >
        <v-icon>mdi-plus</v-icon>
        Add split category
      </v-card>
      <currency-input class="splits-full-width" :value="splitsSum" right disabled />
      <div v-if="splitsSum !== Math.abs(editedTransaction.value)" class="splits-full-width">
        <v-alert color="error" text prominent class="pa-1 pl-4" style="font-size: 1rem">
          Splits must add up to the transaction value
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { NONE } from '../../constants'
import CurrencyInput from '../Shared/CurrencyInput.vue'
import SplitsValue from './SplitsValue.vue'
import CategoryMenu from '../Shared/CategoryMenu.vue'

export default {
  components: { CurrencyInput, SplitsValue, CategoryMenu },
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction']),
    isSplit() {
      return this.editedTransaction.splits && this.editedTransaction.splits.length > 1
    },
    splits: {
      get() {
        return this.editedTransaction.splits
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_SPLITS(value)
      }
    },
    splitsSum() {
      return this.editedTransaction.splits.reduce((partial, split) => partial + Math.abs(split.value), 0)
    }
  },
  methods: {
    ...mapMutations('accountTransactions', [
      'SET_EDITED_TRANSACTION_CATEGORY',
      'PUSH_EDITED_TRANSACTION_SPLIT',
      'CLEAR_EDITED_TRANSACTION_SPLIT',
      'REMOVE_EDITED_TRANSACTION_SPLIT',
      'SET_EDITED_TRANSACTION_SPLIT_CATEGORY'
    ]),
    onCategorySelected(categoryId) {
      this.SET_EDITED_TRANSACTION_CATEGORY(categoryId)
    },
    onSplitCategoryAdd() {
      if (!this.isSplit) {
        this.PUSH_EDITED_TRANSACTION_SPLIT({
          category: this.editedTransaction.category,
          value: this.editedTransaction.value
        })
      }
      this.PUSH_EDITED_TRANSACTION_SPLIT({ category: NONE._id, value: 0 })
    },
    onSplitCategorySelected(index, categoryId) {
      this.SET_EDITED_TRANSACTION_SPLIT_CATEGORY({ index, categoryId })
    },
    onRemoveSplit(index) {
      this.REMOVE_EDITED_TRANSACTION_SPLIT(index)
      if (this.splits.length === 1) {
        this.onCategorySelected(this.splits[0].category)
        this.CLEAR_EDITED_TRANSACTION_SPLIT()
      }
    }
  }
}
</script>

<style>
div.splits-grid {
  display: grid;
  grid-template-columns: minmax(50px, auto) 100px 20px;
}
.splits-full-width {
  grid-column: 1 / 3;
}
</style>
