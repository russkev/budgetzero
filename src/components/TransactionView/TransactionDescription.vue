<template>
  <transaction-hover-container :hover="hover" :item="item">
    <description-tooltip :item="item">
      <template #activator="{ on }">
        <row-element-wrapper @click="onTransactionDetailsClick(item)" :disabled="tableIsDisabled">
          <span :class="`my-auto ellipsis text-body-1 ${tableIsDisabled ? 'text-disabled' : ''}`" v-on="on">
            {{ previewDescription }}
          </span>
        </row-element-wrapper>
      </template>
    </description-tooltip>
  </transaction-hover-container>
</template>

<script>
import RowElementWrapper from './RowElementWrapper.vue'
import { mapActions, mapGetters } from 'vuex'
import TransactionHoverContainer from './TransactionHoverContainer.vue'

export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    hover: {
      type: Boolean,
      default: false
    }
  },
  components: {
    RowElementWrapper,
    TransactionHoverContainer
  },
  computed: {
    ...mapGetters('accountTransactions', ['tableIsDisabled']),
    previewDescription() {
      if (this.item.note) {
        return this.item.note
      } else if (this.item.memo) {
        return this.item.memo
      } else {
        return ''
      }
    }
  },
  methods: {
    ...mapActions('accountTransactions', ['onTransactionDetailsClick'])
  }
}
</script>

<style>
.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
