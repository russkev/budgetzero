<template>
  <v-row class="px-3">
    <BaseDialogModalComponent v-model="manageBudgetsModalVisible">
      <template #title> Budgets </template>
      <template #body>
        <!-- <v-select
          v-model="selectedBudget"
          :items="allBudgets"
          label=""
          class="pa-0 pb-1"
          item-text="name"
          item-value="_id"
        /> -->
        <v-select :items="allBudgets" v-model="selectedBudget" item-text="name" item-value="_id" />
      </template>
      <template #actions>
        <v-btn color="grey" @click.stop="manageBudgetsModalVisible = false"> Cancel </v-btn>
        <v-btn color="accent" @click="loadSelectedBudget()"> Load Budget </v-btn>
      </template>
    </BaseDialogModalComponent>

    <BaseDialogModalComponent v-model="dialog">
      <template #title> Manage Budget </template>
      <template #body>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="item.name" label="Budget name" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="item.currency" :items="currencies" label="Currency" required />
            </v-col>
            <v-col cols="12" sm="6" />
          </v-row>
        </v-container>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="dialog = false"> Close </v-btn>
        <v-btn color="blue darken-1" text @click="saveBudget()"> Save </v-btn>
      </template>
    </BaseDialogModalComponent>

    <v-col>
      <h1>Manage Budgets</h1>
      <v-divider class="pb-4" />

      <v-btn color="accent" dark class="mb-2" small @click.stop="manageBudgetsModalVisible = true">
        Switch Budgets
      </v-btn>
    </v-col>

    <v-col cols="12">
      <v-simple-table>
        <template #default>
          <thead>
            <tr>
              <th class="text-left" width="50px">Selected</th>
              <th class="text-left">Date Created</th>
              <th class="text-left">Name</th>
              <th class="text-left">Currency</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="budget in allBudgets" :key="budget._id">
              <td v-if="budget._id.slice(-ID_LENGTH.budget) == selectedBudgetId">
                <v-icon color="accent"> mdi-check-bold </v-icon>
              </td>
              <td v-else />
              <td>{{ budget.created }}</td>
              <td>{{ budget.name }}</td>
              <td>{{ budget.currency }}</td>
              <td>
                <v-icon icon dark class="" color="primary" @click="editItem(budget)"> edit </v-icon>
                <v-icon icon dark class="ml-1" color="accent" @click="deleteItem(budget)"> delete </v-icon>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDialogModalComponent from './Modals/BaseDialogModalComponent.vue'
import { ID_LENGTH, ID_NAME } from '../constants'

export default {
  name: 'Settings',
  components: {
    BaseDialogModalComponent
  },
  data() {
    return {
      ID_LENGTH,
      selectedBudget: null,
      manageBudgetsModalVisible: false,
      dialog: false,
      item: {},
      currencies: [
        { value: 'AUD', text: '$' },
        { value: 'EUR', text: '€' },
        { value: 'GBP', text: '£' },
        { value: 'USD', text: '$' }
      ]
    }
  },
  computed: {
    ...mapGetters(['allBudgets', 'payees', 'selectedBudgetId'])
  },
  watch: {
    selectedBudgetId: function (newBudget, oldBudget) {
      this.selectedBudget = ID_NAME.budget + newBudget //Assign value from vuex to local var when loads/updates
    }
  },
  mounted() {
    this.selectedBudget = ID_NAME.budget + this.selectedBudgetId
  },
  methods: {
    editItem(item) {
      this.item = JSON.parse(JSON.stringify(item))
      this.dialog = true
    },
    async deleteItem(budget_document) {
      if (
        await this.$root.$confirm(
          'Delete Entire Budget?',
          'Are you sure you want to delete this Budget? It will permanently delete all transactions, categories, and budget amounts and replicate deletion to any remote sync servers.',
          { cancelBtnColor: 'grey', agreeBtnColor: 'accent', agreeBtnText: 'Delete Entire Budget' }
        )
      ) {
        const budget_id = budget_document._id.slice(-ID_LENGTH.budget)

        const delete_result = await this.$store.dispatch('deleteEntireBudget', { ...budget_document })
        if (delete_result && budget_id === this.selectedBudgetId) {
          return this.$store.dispatch('resetAndFetchAllDocsFromPouchDB')
        } else {
          return this.$store.dispatch('fetchAllBudgets')
        }
      } else {
        // cancel
      }
    },
    loadSelectedBudget() {
      this.$store.dispatch('setSelectedBudgetID', this.selectedBudget.slice(-ID_LENGTH.budget))
      this.manageBudgetsModalVisible = false
    },
    saveBudget() {
      this.dialog = false
      this.$store.dispatch('commitDocToPouchAndVuex', { current: this.item, previous: null })
    }
  }
}
</script>

<style></style>
