<template>
  <v-card flat color="background lighten-2" class="pa-2">
    <span class="category-radio-group mb-2">
      <string-input
        class="category-budget-input"
        :id="`category-move-input-${selectedCategory._id}`"
        :data-testid="`category-move-input-${selectedCategory._id}`"
        :value="(selectedCategory.moveAmount / 100).toString()"
        :is-editing="isEditingValue"
        active-background-color="background lighten-3"
        currency
        currency-left
        @edit="isEditingValue = true"
        @input="onMoveAmountApply"
      />
      <span>
        <details-radio
          :selected="selectedCategory.isMovingTo"
          data-testid="details-moving-to-button"
          @click="onMovingToClicked"
        >
          to
        </details-radio>
        <details-radio
          class="pl-4"
          :selected="!selectedCategory.isMovingTo"
          data-testid="details-moving-from-button"
          @click="onMovingFromClicked"
        >
          from
        </details-radio>
      </span>
    </span>
    <category-menu
      :category-id="selectedCategory.moveDestination"
      show-balance
      @selected="onMoveDestinationChanged"
      :disable-categories="[selectedCategory._id]"
    />
    <div class="mt-2">
      <v-btn data-testid="details-move-save-button" elevation="0" text small block @click="doBudgetMove">Send</v-btn>
    </div>
  </v-card>
</template>

<script>
import DetailsRadio from '../Shared/DetailsRadio.vue'
import CategoryMenu from '../Shared/CategoryMenu.vue'
import StringInput from '../Shared/StringInput.vue'
import _ from 'lodash'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DetailsMove',
  components: {
    StringInput,
    DetailsRadio,
    CategoryMenu
  },
  data() {
    return {
      isEditingValue: false
    }
  },
  computed: {
    ...mapGetters('categoryMonth', ['selectedCategory', 'categoriesDataSortedByBalance'])
  },
  methods: {
    ...mapActions('categoryMonth', [
      'onMovingToClicked',
      'onMovingFromClicked',
      'onMoveDestinationChanged',
      'onSelectedMoveAmountChanged',
      'doBudgetMove',
      'syncSelectedCategory'
    ]),
    onMoveAmountApply(value) {
      this.isEditingValue = false
      this.onSelectedMoveAmountChanged(parseInt(value * 100))
    }
  }
}
</script>

<style scoped>
.category-radio-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

.category-radio-group > span {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  width: 100%;
}
</style>
