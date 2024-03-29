<template>
  <v-card
    flat
    color="background lighten-2"
    class="pa-2 mb-4 manage-card"
    data-testid="restore-from-file-card"
    @keydown.escape.prevent="onCancel"
  >
    <div class="mb-2">Choose a file to restore from</div>
    <v-file-input
      solo
      show-size
      flat
      color="secondary lighten-2"
      background-color="background lighten-3"
      v-model="restoreFile"
      @change="onRestoreFileChange"
      class="mx-2 text-body-1"
      :error="Boolean(restoreFileError)"
      :error-messages="restoreFileError"
      data-testid="restore-file-input"
      prepend-icon="mdi-folder-upload"
    >
    </v-file-input>
    <div style="height: 20px">
      <span v-if="budgetExists">
        <strong class="error--text text--lighten-2">Warning:</strong> All existing budgets will be overwritten by backup
        file
      </span>
    </div>
    <button-transparent
      icon="mdi-file-restore"
      :disabled="!restoreButtonIsEnabled"
      @click="onRestore"
      data-testid="restore-button"
    >
      Restore
    </button-transparent>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Restore',
  props: {
    isLanding: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      restoreFile: null,
      restoreFileParsed: null,
      restoreFileError: ''
    }
  },
  computed: {
    ...mapGetters(['budgetExists']),
    restoreButtonIsEnabled() {
      return this.restoreFileParsed !== null && this.restoreFileError === ''
    }
  },
  methods: {
    ...mapActions([
      'commitRestoreBulkDocsToPouch',
      'resetAndFetchAllDocsFromPouchDB',
      'restoreLocalPouchDB',
      'databaseExists',
      'deleteLocalDatabase'
    ]),
    onRestoreFileChange() {
      this.restoreFileError = ''
      this.restoreFileParsed = null
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
      if (!this.restoreButtonIsEnabled) {
        return
      }
      await this.restoreLocalPouchDB(this.restoreFileParsed)
      this.reset()
      await this.resetAndFetchAllDocsFromPouchDB()
    },
    onCancel() {
      if (!this.isLanding) {
        return
      }
      this.reset()
      this.$router.push({ name: 'landing' })
    },
    reset() {
      this.restoreFile = null
      this.restoreFileParsed = null
      this.restoreFileError = ''
    }
  }
}
</script>
