<template>
  <transaction-hover-container :hover="hover" :item="item">
    <delete-confirm @confirm="onDeleteTransaction(item)">
      <template #activator="{ on, open }">
        <hover-button
          :hover="isHovered"
          :dialog-open="open"
          :data-testid="`btn-delete-transaction-${item._id}`"
          class="row-delete"
          height="100%"
          :on="on"
          :disabled="tableIsDisabled || item._id === editedTransaction._id"
        />
      </template>
    </delete-confirm>
  </transaction-hover-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import HoverButton from '../Shared/HoverButton.vue'
import { ID_LENGTH } from '../../constants'
import TransactionHoverContainer from './TransactionHoverContainer.vue'

export default {
  name: 'TransactionDelete',
  components: {
    DeleteConfirm,
    HoverButton,
    TransactionHoverContainer
  },
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
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction', 'tableIsDisabled', 'hoverId']),
    itemId() {
      return this.item._id.slice(-ID_LENGTH.transaction)
    },
    isHovered() {
      return this.item._id === this.hoverId
    }
  },
  methods: {
    ...mapActions('accountTransactions', ['deleteTransaction']),
    onDeleteTransaction(item) {
      this.deleteTransaction(item)
    }
  }
}
</script>
