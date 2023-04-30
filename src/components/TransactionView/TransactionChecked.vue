<template>
  <transaction-hover-container :hover="hover" :item="item">
    <div class="checkbox-container pl-0" style="height: 100%">
      <v-sheet width="3px" min-width="3px" :color="leftColor" height="100%" class="row-checkbox ml-0 mr-2" />
      <v-icon v-if="isSelected" :size="size" @click="toggleSelected" color="primary" :disabled="tableIsDisabled">
        mdi-checkbox-marked
      </v-icon>
      <v-icon
        v-else
        :size="size"
        @click="toggleSelected"
        :color="isVisible(isHovered) ? 'grey lighten-2' : 'background lighten-3'"
        :disabled="tableIsDisabled"
      >
        mdi-checkbox-blank-outline
      </v-icon>
    </div>
  </transaction-hover-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { isUncategorized } from '../../store/modules/transaction-module'
import TransactionHoverContainer from './TransactionHoverContainer.vue'

export default {
  name: 'TransactionChecked',
  components: {
    TransactionHoverContainer
  },
  props: {
    isSelected: {
      type: Boolean,
      default: false
    },
    hover: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object
    }
  },
  data() {
    return {
      size: 20
    }
  },
  computed: {
    ...mapGetters('accountTransactions', [
      'selectedTransactions',
      'isCreatingNewTransaction',
      'tableIsDisabled',
      'hoverId'
    ]),
    leftColor() {
      if (isUncategorized(this.item)) {
        return 'primary darken-1'
      } else {
        return 'transparent'
      }
    },
    isHovered() {
      return this.item._id === this.hoverId
    }
  },
  methods: {
    toggleSelected() {
      this.$emit('input', !this.isSelected)
    },
    isVisible(hover) {
      return !this.isCreatingNewTransaction && (hover || this.selectedTransactions.length > 0)
    }
  }
}
</script>

<style>
.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-container > .theme--dark.v-icon.v-icon--disabled {
  color: var(--v-background-lighten2) !important;
}
</style>
