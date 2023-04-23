<template>
  <delete-confirm @confirm="onDeleteTransaction(item)">
    <template #activator="{ on, open }">
      <hover-button
        :hover="hover"
        :dialog-open="open"
        :data-testid="`btn-delete-transaction-${item._id}`"
        class="row-delete"
        height="100%"
        :on="on"
        :disabled="isLoading || item._id === editedTransaction._id"
      />
    </template>
  </delete-confirm>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import HoverButton from '../Shared/HoverButton.vue'
import { ID_LENGTH } from '../../constants'

export default {
  name: 'TransactionDelete',
  components: {
    DeleteConfirm,
    HoverButton
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
    ...mapGetters('accountTransactions', ['editedTransaction', 'isLoading']),
    itemId() {
      return this.item._id.slice(-ID_LENGTH.transaction)
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
