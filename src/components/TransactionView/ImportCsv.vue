<template>
  <fragment>
    <v-card-title class="success darken-3 pa-3">Import CSV</v-card-title>
    <v-file-input
      show-size
      filled
      flat
      solo
      color="secondary lighten-2"
      background-color="background lighten-3"
      label="Upload CSV file"
      prepend-icon="mdi-file-upload"
      class="mx-2 mt-3 text-body-1"
      accept=".csv"
      style="flex: 0"
      v-model="chosenFile"
      @change="parseFile"
    />
    <v-checkbox dense v-model="useHeadersChecked" label="Use headers" class="text-body-1" />
    <v-checkbox dense v-model="useHeadersChecked" label="Incoming and outgoing are separate" />
    <import-table :table-items="tableData" :is-loading="false" />
    <!-- :error-messages="fileErrorMessage"
      :loading="isLoading" -->
    <div></div>
    <div class="save-cancel-container pa-2">
      <cancel-save
        save-text="Import"
        save-id="import-csv-transactions-button"
        :save-disabled="selectedCsvTransactions.length < 1"
        @cancel="onCancel"
        @save="onSave"
      />
    </div>
  </fragment>
</template>

<script>
import CancelSave from '../Shared/CancelSave.vue'
import ImportTable from './ImportTable.vue'

export default {
  name: 'ImportCsv',
  components: {
    CancelSave,
    ImportTable
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  watch: {
    parsedResults(current) {
      console.log('parsedResults')
      if (current) {
        console.log(current)
      }
    }
  },
  data() {
    return {
      parsedResults: null,
      chosenFile: null,
      selectedCsvTransactions: [],
      useHeaders: true
      // accountsForImport: [],
      // readCsvError: '',
      // isLoading: false,
      // existsColor: 'secondary--text text--darken-1',
      // importCount: {
      //   imported: 0,
      //   skipped: 0
      // }
    }
  },
  computed: {
    useHeadersChecked: {
      get() {
        return this.useHeaders
      },
      set(value) {
        this.useHeaders = value
        this.parseFile()
      }
    },
    tableData() {
      if (!this.parsedResults) {
        return []
      }
      return this.parsedResults.data.map((row) => {
        return {
          date: row[0],
          amount: row[1],
          memo: row[2]
        }
      })
    }
  },
  methods: {
    parseFile() {
      if (!this.chosenFile) {
        return
      }
      console.log('on file change')
      this.isLoading = true
      const config = {
        delimiter: ',',
        header: this.useHeaders,
        skipEmptyLines: true,
        complete: (results) => (this.parsedResults = results)
      }
      this.parsedResults = this.$papa.parse(this.chosenFile, config)
      console.log(this.parsedResults)
    },
    onCancel() {
      this.$emit('close')
    },
    onSave() {
      this.$emit('apply')
    }
  }
}
</script>
