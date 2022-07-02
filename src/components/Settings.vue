<template>
  <v-row class="px-3 pt-2">
    <BaseDialogModalComponent v-model="mockTransactionsModalIsVisible">
      <template #title>
        Create mock transactions
      </template>
      <template #body>
        <span>Number of transactions to create:</span>
        <v-text-field v-model="mockTransactionsAmount" type="number" />
        <v-row justify="space-around">
          <v-date-picker
            v-model="mockTransactionsStartMonth"
            :show-current="true"
            type="month"
          />
          <v-date-picker
            v-model="mockTransactionsEndMonth"
            :show-current="true"
            type="month"
          />
        </v-row>
      </template>
      <template #actions>
        <v-btn color='grey' @click.stop="mockTransactionsModalIsVisible = false">
          Cancel
        </v-btn>
        <v-btn color="accent" @click="onMockTransactionCreate()" :loading="mockTransactionsCreateIsLoading">
          Create
        </v-btn>
      </template>
    </BaseDialogModalComponent>
    <v-col>
      <span class="text-h3 pt-4">Settings</span>
      <span class="subtitle pl-2">{{ packageVersion }}</span>
      <v-divider class="pb-4" />

      <h3 class="mx-2 py-2">Backup</h3>

      <v-btn color="grey darken-2" dark class="mb-2" small @click="$store.dispatch('exportBudgetAsJSON')">
        Backup Entire Database
      </v-btn>

      <span class="pl-2">Export data for backup.</span>
      <br />

      <v-btn color="grey darken-2" dark class="mb-2" small @click="$store.dispatch('exportSelectedBudgetAsJSON')">
        Backup Current Budget
      </v-btn>

      <span class="pl-2">Backup current budget: {{ this.$store.getters.selectedBudgetId }} </span>

      <h3 class="mx-2 pt-2">Restore</h3>

      <v-file-input v-model="backupFile" label="Restore Backup File" @change="onFileChange" />
      <v-btn
        color="accent"
        dark
        class="mb-1"
        small
        :disabled="!backupFileParsed"
        @click="$store.dispatch('commitBulkDocsToPouchAndVuex', backupFileParsed)"
      >
        Restore From File
      </v-btn>

      <br />
      <v-btn
        id="refreshDbBtn"
        color="primary"
        outlined
        dark
        class="mb-3"
        small
        @click="$store.dispatch('loadLocalBudgetRoot')"
      >
        Refresh Database
      </v-btn>

      <v-expansion-panels class="mb-4" v-model="panel">
        <v-expansion-panel class="grey lighten-3" v-model="panel" expand>
          <v-expansion-panel-header>
            <h3>
              Advanced Sync <span class="subtitle-1 ml-3">{{ sync_state }}</span>
            </h3>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <span
              >Sync to remote CouchDB server:
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon color="grey" v-on="on"> mdi-information </v-icon>
                </template>
                <span
                  >Examples: <code>http://localhost:5984/mybudget</code> or
                  <code>http://username:password@192.168.1.10:5984/mybudget</code>
                </span>
              </v-tooltip>
            </span>
            <v-row align="center" class="mt-2">
              <v-col cols="7">
                <v-text-field v-model="remoteSyncURLInput" label="Remote CouchDB URL" required />
              </v-col>
              <v-col cols="5">
                <v-btn color="primary" dark small @click="startRemoteSync()"> Set Custom Sync URL </v-btn>
                <v-btn color="primary" outlined dark class="ml-2" small @click="clearRemoteSync()"> Clear </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- v-if="!isProd" -->
      <v-expansion-panels class="mb-4">
        <v-expansion-panel class="grey lighten-3">
          <v-expansion-panel-header>
            <h3>Debugging</h3>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-alert type="warning"> Warning: Do not use these unless you know what you're doing. </v-alert>
            <v-btn color="red" dark class="mb-2" small data-cy="delete-local-db" @click="deleteLocalDatabase">
              Erase Local Database
            </v-btn>
            <span class="pl-2"
              >Deletes local PouchDB database. If connected to a remote database it will re-sync all the data.
            </span>

            <br />
            <v-btn color="primary" dark class="mb-2" small @click="$store.dispatch('createLocalPouchDB')">
              Create Local Database
            </v-btn>

            <br />
            <v-btn color="red" dark class="mb-2" small @click="deleteAllDocs"> Delete All Docs from db </v-btn>
            <span class="pl-2"
              >Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate deletion to remote
              databases.</span
            >
            <br />
            <v-btn color="red" dark class="mb-2" small @click="onDeleteTransactions" :loading="deleteTransactionsIsLoading">
              Delete Transactions
            </v-btn>

            <br />
            <v-btn color="grey darken-2" dark class="mb-2" small @click="$store.dispatch('loadLocalBudgetRoot')">
              Reload Budget
            </v-btn>
            <span class="pl-2">Reload Budget Root (for debugging purposes)</span>
            <br />

            <v-btn id="loadMockDataBtn" color="purple" dark class="mb-2" small @click="loadMockData">
              Load Mock Data
            </v-btn>
            <span class="pl-2">Loads fake data for testing purposes.</span>
            <br />

            <v-btn color="purple" dark class="mb-2" small @click="mockTransactionsModalIsVisible = true">
              Generate Mock Transactions
            </v-btn>
            <span class="pl-2">Loads fake data for testing purposes.</span>

          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-expansion-panels>
        <v-expansion-panel class="grey lighten-3">
          <v-expansion-panel-header>
            <h3>Raw Database Data</h3>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p>
              Transactions:
              <tree-view :data="transactions" :options="{ maxDepth: 0 }" />
            </p>
            <p>
              Accounts:
              <tree-view :data="accounts" :options="{ maxDepth: 0 }" />
            </p>
            <p>
              Monthly Data:
              <tree-view :data="monthlyCategoryData" :options="{ maxDepth: 0 }" />
            </p>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

    <v-col cols="12">
      <h3 class="mx-2 py-2">Payees</h3>
      <v-data-table :headers="headers" :items="payees.sort((a, b) => (a.name > b.name ? 1 : -1))" class="elevation-1" />
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BaseDialogModalComponent from './Modals/BaseDialogModalComponent.vue'

export default {
  name: 'Settings',
  components: {BaseDialogModalComponent},
  data() {
    return {
      remoteSyncURLInput: null,
      backupFile: null,
      backupFileParsed: null,
      newBudgetModal: false,
      tab: null,
      selected_budget: null,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'id', value: '_id' }
      ],
      isProd: process.env.NODE_ENV === 'production',
      mockTransactionsModalIsVisible: false,
      mockTransactionsAmount: 1000,
      mockTransactionsStartMonth: "2020-01",
      mockTransactionsEndMonth: "2021-12",
      mockTransactionsCreateIsLoading: false,
      deleteTransactionsIsLoading: false,
      panel: 0
    }
  },
  computed: {
    ...mapGetters([
      'transactions',
      'accounts',
      'monthlyCategoryData',
      'payees',
      'selectedBudgetId',
      'remoteSyncURL',
      'sync_state'
    ]),
    packageVersion() {
      return process.env.PACKAGE_VERSION || '0'
    }
  },
  watch: {
    // whenever question changes, this function will run
    remoteSyncURL: function (newQuestion, oldQuestion) {
      this.remoteSyncURLInput = newQuestion
    }
  },
  mounted() {
    this.remoteSyncURLInput = this.remoteSyncURL
  },
  methods: {
    ...mapActions(['deleteTransactions', 'deleteAllDocs', 'eraseAllDocs', 'deleteLocalDatabase', 'loadMockData']),
    startRemoteSync() {
      this.$store.dispatch('startRemoteSyncToCustomURL', this.remoteSyncURLInput)
    },
    clearRemoteSync() {
      this.remoteSyncURLInput = ''
      this.$store.dispatch('clearRemoteSync')
    },
    onFileChange() {
      console.log(this.backupFile)

      const reader = new FileReader()
      this.accountsForImport = []
      this.selectedAccount = {}

      reader.onload = (e) => {
        try {
          const vm = this
          let data = JSON.parse(e.target.result)
          vm.backupFileParsed = data
        } catch(error) {
          this.$store.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: `Invalid file selected`,
            snackbarColor: `error`
          })
          console.log(error.message)
        }
      }
      if (this.backupFile) {
        reader.readAsText(this.backupFile)
      }
    },
    onMockTransactionCreate() {
      console.log(this.mockTransactionsStartMonth)
      this.mockTransactionsCreateIsLoading = true
      this.$store
        .dispatch('createMockTransactions', {
          amount: this.mockTransactionsAmount, 
          start: this.mockTransactionsStartMonth, 
          end: this.mockTransactionsEndMonth
        })
        .then((result) => {
          this.$store.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: `Created ${result} mock transactions`,
            color: 'success'
          })
          this.mockTransactionsModalIsVisible = false
        })
        .catch((error) => {
          this.$store.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: error,
            snackbarColor: 'error',
          })
          console.log(error)
        })
        .finally(() => {
          this.mockTransactionsCreateIsLoading = false
        })
    },
    onDeleteTransactions() {
      this.deleteTransactionsIsLoading = true
      this.$store.dispatch('deleteTransactions')
        .then(() => {
          this.$store.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: `Successfully deleted transactions`,
            color: 'success'
          })
        })
        .catch((err) => {
          this.$store.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: err,
            color: `error`
          })
        })
        .finally(() => {
          this.deleteTransactionsIsLoading = false
        })
    }
  }
}
</script>

<style></style>
