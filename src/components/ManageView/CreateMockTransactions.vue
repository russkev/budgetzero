<template>
  <v-row class="px-3 pt-2">
    <template>
      <base-dialog-modal-component :value="value" @input="$emit('input', $event)">
        <template #title> Create mock transactions </template>
        <template #body>
          <span>Number of transactions to create:</span>
          <v-text-field v-model="mockTransactionsAmount" type="number" />
          <v-row justify="space-around">
            <v-date-picker v-model="mockTransactionsStartMonth" :show-current="true" type="month" />
            <v-date-picker v-model="mockTransactionsEndMonth" :show-current="true" type="month" />
          </v-row>
        </template>
        <template #actions>
          <v-btn color="grey" @click.stop="$emit('input', false)"> Cancel </v-btn>
          <v-btn color="accent" @click="onMockTransactionCreate()" :loading="mockTransactionsCreateIsLoading">
            Create
          </v-btn>
        </template>
      </base-dialog-modal-component>
    </template>
  </v-row>
</template>

<script>
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import { mapActions, mapMutations } from 'vuex'

export default {
  name: 'SettingsOld',
  components: {
    BaseDialogModalComponent
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      // mockTransactionsModalIsVisible: false,
      mockTransactionsAmount: 0,
      mockTransactionsStartMonth: null,
      mockTransactionsEndMonth: null,
      mockTransactionsCreateIsLoading: false
    }
  },
  methods: {
    ...mapActions(['createMockTransactions']),
    ...mapMutations(['SET_SNACKBAR_MESSAGE']),

    onMockTransactionCreate() {
      this.mockTransactionsCreateIsLoading = true
      this.createMockTransactions({
        amount: this.mockTransactionsAmount,
        start: this.mockTransactionsStartMonth,
        end: this.mockTransactionsEndMonth
      })
        .then((result) => {
          this.SET_SNACKBAR_MESSAGE({
            snackbarMessage: `Created ${result[0].length} mock transactions and ${result[1].length} mock category budget values.`,
            color: 'success'
          })
          // this.mockTransactionsModalIsVisible = false
          this.$emit('input', false)
          return this.$store.dispatch('loadLocalBudget')
        })
        .catch((error) => {
          this.SET_SNACKBAR_MESSAGE({
            snackbarMessage: error,
            snackbarColor: 'error'
          })
          console.log(error)
        })
        .finally(() => {
          this.mockTransactionsCreateIsLoading = false
        })
    }
  }
}
</script>
