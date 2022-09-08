<template>
  <td colspan="100">
    <div class="expanded-details">
      <span>
        Date
      </span>
      <select-date data-testid="edit-row-date" v-model="editedTransaction.date" />
      <span>Details</span>
      <v-textarea
        data-testid="edit-row-memo"
        class="ma-0"
        v-model="editedTransaction.memo"
        rows="2"
        dense
        filled
        hide-details
      />
      <span>Notes</span>
      <v-textarea 
        data-testid="edit-row-note"
        class="ma-0"
        v-model="editedTransaction.note"
        rows="2"
        dense
        filled
        hide-details
      />
    </div>
    <div>
      <v-btn data-testid="cancel-edit-button" small @click="cancel()">Cancel</v-btn>
      <v-btn data-testid="save-edit-button" small @click="save(item)" color="primary">Save</v-btn>
    </div>
  </td>
</template>

<script>
import { mapGetters, mapActions, } from 'vuex'
import SelectDate from './SelectDate.vue';

export default {
  components: { SelectDate },
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"])
  },
  methods: {
    ...mapActions("accountTransactions", ["cancel", "save"])
  }
}
</script>