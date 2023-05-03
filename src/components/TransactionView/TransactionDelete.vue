<template>
  <delete-confirm @confirm="onDeleteTransaction(item)">
    <template #activator="{ on, open }">
      <!-- :hover="true" -->
      <hover-button
        :dialog-open="open"
        :data-testid="`btn-delete-transaction-${item._id}`"
        class="row-delete ml-3"
        height="100%"
        :on="on"
        :disabled="tableIsDisabled || item._id === editedTransaction._id"
        inactive-color="secondary darken-3"
      />
      <!-- inactive-color="background lighten-1" -->
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
    }
  },
  computed: {
    ...mapGetters('accountTransactions', ['editedTransaction', 'tableIsDisabled']),
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

<style>
.v-application tr.transaction-row:hover .row-delete .v-icon {
  color: white !important;
  transition: color 0.5s;
}
.v-application tr.transaction-row:hover .row-delete:hover .v-icon {
  color: var(--v-error-base) !important;
}
</style>
