<template>
  <div>
    <v-container fluid class="py-0">
      <page-heading title="Budgets" />
      <v-sheet max-width="800px" justify="center" id="budgets-container-sheet" class="mx-auto pa-2" color="transparent">
        <div class="transaction-details-grid pa-2 pb-0 mt-3">
          <div class="text-h5">Backup</div>
          <div>
            <v-card flat color="background lighten-2" class="pa-2 mb-4">
              <div class="budgets-details">
                <div class="mb-2">Backup all budgets to the hard drive</div>
                <!-- <v-btn text width="min-content" @click="onBackup"><v-icon left>mdi-content-save</v-icon>Do Backup</v-btn> -->
                <button-transparent icon="mdi-content-save" @click="onBackup">Do Backup</button-transparent>
                Last backup: {{ lastBackupTime ? lastBackupTime : 'None recorded' }}
                <!-- {{ lastBackupDate ? `Last backup: ${lastBackupDate}` : '' }} -->
              </div>
            </v-card>
          </div>
          <div class="text-h5">Restore</div>
          <div>
            <v-card flat color="background lighten-2" class="pa-2 mb-4">
              <div class="mb-2">Choose a file to restore from</div>
              <v-file-input
                solo
                show-size
                flat
                prepend-icon="mdi-folder-upload"
                color="secondary lighten-2"
                background-color="background lighten-3"
                v-model="restoreFile"
                @change="onRestoreFileChange"
                class="mx-2 text-body-1"
                :error="Boolean(restoreFileError)"
                :error-messages="restoreFileError"
              />
              <!-- <v-btn @click="onRestore">Restore</v-btn> -->
              <button-transparent icon="mdi-file-restore" :disabled="!restoreButtonIsEnabled" @click="onRestore">
                Restore
              </button-transparent>
            </v-card>
          </div>
          <div class="text-h5">Cloud</div>
          <div>
            <!-- <v-btn @click="onSync">Sync with cloud</v-btn> -->
            <v-card flat color="background lighten-2" class="pa-2 mb-4">
              <div class="sync-stats">
                <div>Sync status:</div>
                <div>Not Connected</div>
                <div>Sync address:</div>
                <div><string-input id="sync-address-input" /></div>
              </div>
              <!-- <button-transparent icon="mdi-cloud-sync" @click="onSync">Sync with cloud</button-transparent> -->
            </v-card>
          </div>
          <div class="text-h5">Danger</div>
          <div>
            <v-card flat color="background lighten-2" class="pa-2 mb-4">
              <delete-confirm @confirm="onDeleteLocalDatabase" titleText="Delete Database">
                <!-- bodyText="Are you want to sure you want to delete the entire local database?<br>This will delete the cached database but will leave the cloud data intact" -->
                <template #body>
                  <div>
                    <strong> Are you want to sure you want to delete the entire local database? </strong>
                  </div>
                  <div class="mt-3">This will delete the cached database but will leave the cloud data intact</div>
                </template>
                <template #activator="{ on }">
                  <button-transparent icon="mdi-delete" :on="on"> Delete local database </button-transparent>
                </template>
              </delete-confirm>
            </v-card>
          </div>
        </div>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageHeading from '../Shared/PageHeading.vue'
import ButtonTransparent from '../Shared/ButtonTransparent.vue'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import StringInput from '../Shared/StringInput.vue'

export default {
  name: 'Budgets',
  components: {
    PageHeading,
    ButtonTransparent,
    DeleteConfirm,
    StringInput
  },
  props: {},
  data() {
    return {
      lastBackupTime: '',
      restoreFile: null,
      restoreFileParsed: null,
      restoreFileError: '',
      remoteSyncUrlInput: ''
    }
  },
  computed: {
    ...mapGetters(['remoteSyncURL']),
    restoreButtonIsEnabled() {
      // return this.restoreFileParsed !== null || this.restoreFileError === ''
      return this.restoreFileParsed !== null && this.restoreFileError === ''
    }
  },
  beforeMount() {
    this.updateBackupTime()
  },
  methods: {
    ...mapActions([
      'exportBudgetAsJSON',
      'commitRestoreBulkDocsToPouch',
      'deleteLocalDatabase',
      'loadLocalBudget',
      'createLocalPouchDB',
      'databaseExists'
    ]),
    async onBackup() {
      await this.exportBudgetAsJSON()
      this.updateBackupTime()
      // this.$store.dispatch('backup')
      console.log('Backup')
    },
    onRestoreFileChange() {
      this.restoreFileError = ''
      this.restoreFileParsed = null
      // this.accountsForImport = []
      // this.selectedAccount = {}

      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const file = event.target.result
          const json_data = JSON.parse(file)
          this.restoreFileParsed = json_data
        } catch (error) {
          this.restoreFileError = 'Invalid file, expected JSON'
          this.restoreFileParsed = null
        }
      }
      if (this.restoreFile) {
        reader.readAsText(this.restoreFile)
      }
    },
    async onRestore() {
      // this.$store.dispatch('restore')
      // console.log('Restore')
      try {
        if (!(await this.databaseExists())) {
          console.log('Database does not exist, creating')
          await this.createLocalPouchDB()
        }
        await this.commitRestoreBulkDocsToPouch(this.restoreFileParsed)

        this.reset()
        this.loadLocalBudget()
      } catch (error) {
        console.log(error)
      }
    },
    reset() {
      this.restoreFile = null
      this.restoreFileParsed = null
      this.restoreFileError = ''
    },
    onSync() {
      console.log('sync')
    },
    updateBackupTime() {
      this.lastBackupTime = localStorage.getItem('lastBackup')
    },
    onDeleteLocalDatabase() {
      this.deleteLocalDatabase()
    }
  }
}
</script>

<style>
.budgets-details {
  display: flex;
  flex-direction: column;
}

#budgets-container-sheet .v-input__prepend-outer {
  margin-top: 4px;
}

#budgets-container-sheet .v-input__icon button {
  color: unset;
  caret-color: unset;
}

#budgets-container-sheet .v-input__icon {
  min-width: 18px;
  width: 18px;
}

#budgets-container-sheet .v-input__icon .v-icon {
  font-size: 18px;
}

#budgets-container-sheet .v-btn {
  text-transform: unset;
}

#budgets-container-sheet .sync-stats {
  display: grid;
  grid-template-columns: max-content auto;
}

#budgets-container-sheet .sync-stats > div:nth-child(2n) {
  margin-left: 4px;
}

/* #budgets-container-sheet .sync-stats > div:nth-child(2n + 1) {
  text-align: right;
} */
</style>
