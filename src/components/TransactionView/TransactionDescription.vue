<template>
  <description-tooltip :item="item">
    <template #activator="{ on }">
      <row-element-wrapper @click="onTransactionDetailsClick(item)" :disabled="isLoading">
        <span :class="`my-auto ellipsis text-body-1 ${isLoading ? 'text-disabled' : ''}`" v-on="on">
          {{ previewDescription }}
        </span>
      </row-element-wrapper>
    </template>
  </description-tooltip>
</template>

<script>
import RowElementWrapper from './RowElementWrapper.vue'
import DescriptionTooltip from '../Shared/DescriptionTooltip.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  components: {
    RowElementWrapper
  },
  computed: {
    ...mapGetters('accountTransactions', ['isLoading']),
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
