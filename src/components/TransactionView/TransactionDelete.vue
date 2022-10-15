<template>
  <delete-confirm @confirm="onDeleteTransaction(item)">
    <template #activator="{on, open}">
      <delete-button
        :hover="hover"
        :dialog-open="open"
        :data-testid="`btn-delete-transaction-${item._id}`"
        class="row-delete"
        height="100%"
        :on="on"
        :disabled="item._id === editedTransaction._id"
      />
    </template>
  </delete-confirm>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import DeleteConfirm from "../Shared/DeleteConfirm.vue";
import DeleteButton from "../Shared/DeleteButton.vue";

export default {
  name: "TransactionDelete",
  components: {
    DeleteConfirm,
    DeleteButton,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    hover: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
  },
  methods: {
    ...mapActions("accountTransactions", ["deleteTransaction"]),
    onDeleteTransaction(item) {
      // console.log("onDeleteTransaction", item);
      this.deleteTransaction(item)
    },
  },
}
</script>