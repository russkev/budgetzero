<template>
  <fragment>
    <v-card-title class="success darken-3 pa-3">Import CSV</v-card-title>
    <div class="transaction-details-grid pa-2 pb-0">
      <div class="text-h5">File</div>
      <div class="d-flex flex-row justify-space-between">
        <v-file-input
          show-size
          filled
          flat
          solo
          color="primary lighten-2"
          background-color="background lighten-3"
          label="Upload CSV file"
          prepend-icon="mdi-file-upload"
          class="text-body-1 flex-grow-1"
          accept=".csv"
          style="flex: 0"
          v-model="chosenFile"
          @change="parseFile"
          hide-details
        >
          <template #selection="{ text }">
            <div class="text-body-1 ellipsis">{{ text }}</div>
          </template>
          <template #label>
            <div class="text-body-1">Upload CSV file</div>
          </template>
        </v-file-input>
      </div>
      <div class="text-h5">Options</div>
      <div>
        <v-checkbox dense v-model="useHeadersChecked" class="text-body-1">
          <template #label><span class="text-body1">Use headers</span></template>
        </v-checkbox>
        <v-checkbox dense v-model="useDebitChecked" label="Separate credit and debit" />
      </div>
      <div class="text-h5">Date</div>
      <import-ofx-column :header-options="headerOptions" v-model="headerColumns.date" label="Date:" />
      <div class="text-h5">Format</div>
      <import-ofx-column
        :header-options="dateFormatOptions"
        label="Date Format:"
        v-model="dateFormat"
        @input="onDateFormatChange"
        :errorText="dateFormatError"
      />
      <div class="text-h5">Memo</div>
      <import-ofx-column :header-options="headerOptions" v-model="headerColumns.memo" label="Memo:" />
      <div class="text-h5">Amount</div>
      <import-ofx-column
        :header-options="headerOptions"
        :label="useSeparateDebits ? 'Credit:' : 'Amount:'"
        v-model="headerColumns.credit"
        :error-text="creditError"
      />
      <div class="text-h5">Debit</div>
      <import-ofx-column
        :header-options="headerOptions"
        label="Debit:"
        v-model="headerColumns.debit"
        :disabled="!useSeparateDebits"
        :errorText="debitError"
      />
    </div>

    <import-table :table-items="tableData" :is-loading="false" :date-format="dateFormat" />
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
import ImportOfxColumn from './ImportOfxColumn.vue'
import moment from 'moment'

const findHeader = (headers, candidates) => {
  const index = headers.findIndex((header) => candidates.includes(header.toLowerCase()))
  if (index > -1) {
    return headers[index]
  }
  return headers[0]
}

export default {
  name: 'ImportCsv',
  components: {
    CancelSave,
    ImportTable,
    ImportOfxColumn
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  watch: {
    headerColumns: {
      handler() {
        if (this.toUpdateHeaderColumns) {
          console.log('Header columns changed')
          this.updateTableData()
          this.verifyDateFormat()
        }
      },
      deep: true
    }
  },
  data() {
    return {
      parsedResults: null,
      chosenFile: null,
      selectedCsvTransactions: [],
      useHeaders: true,
      useSeparateDebits: false,
      headerColumns: {
        date: 0,
        memo: 1,
        credit: 2,
        debit: 3
      },
      toUpdateHeaderColumns: true,
      truncateLength: 20,
      creditError: '',
      debitError: '',
      dateFormat: 'DD/MM/YYYY',
      dateFormatOptions: [
        'DD/MM/YYYY',
        'DD-MM-YYYY',
        'DD.MM.YYYY',
        'MM/DD/YYYY',
        'MM-DD-YYYY',
        'MM.DD.YYYY',
        'YYYY/MM/DD',
        'YYYY-MM-DD',
        'YYYY.MM.DD'
      ],
      dateFormatError: '',
      tableData: []
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
    useDebitChecked: {
      get() {
        return this.useSeparateDebits
      },
      set(value) {
        this.useSeparateDebits = value
        this.parseFile()
      }
    },
    // headerColumnsDisplay: {
    //   get() {
    //     return this.headerColumns
    //   },
    //   set(value) {
    //     console.log('Setting header columns')
    //     this.headerColumns = value
    //     this.updateTableData()
    //   }
    // },

    headerOptions() {
      if (!this.parsedResults) {
        return []
      }
      if (this.useHeaders) {
        return Object.keys(this.parsedResults.data[0])
      } else {
        let result = []
        for (let i = 0; i < this.parsedResults.data[0].length; i++) {
          result.push(i)
        }
        return result
      }
    }
  },
  methods: {
    updateTableData() {
      /**
       * Interpret the parsed csv file into a table
       */
      console.log('Getting table data', this.useHeaders)
      if (!this.parsedResults) {
        return []
      }
      this.creditError = ''
      this.debitError = ''
      let credit_error_discovered = false
      let debit_error_discovered = false
      const row_offset = this.useHeaders ? 2 : 1
      this.tableData = this.parsedResults.data.map((row, index) => {
        const credit_raw = row[this.headerColumns.credit]
        let credit = parseFloat(row[this.headerColumns.credit])
        if (isNaN(credit)) {
          if (!credit_raw) {
            if (!this.useSeparateDebits && !credit_error_discovered) {
              this.creditError = `Credit is empty for row ${index + row_offset}, treating as 0`
              credit_error_discovered = true
            }
          } else {
            if (!credit_error_discovered) {
              console.log("Couldn't parse credit", credit_raw)
              const credit_string = this.truncate(credit_raw, this.truncateLength)
              this.creditError = `Could not parse number (${credit_string}) for row ${
                index + row_offset
              }, treating as 0`
              credit_error_discovered = true
            }
          }
          credit = 0
        }

        let debit = 0
        if (this.useSeparateDebits) {
          const debit_raw = row[this.headerColumns.debit]
          debit = parseFloat(debit_raw)
          if (isNaN(debit)) {
            if (!debit_error_discovered) {
              if (!debit_raw && !credit_raw) {
                this.debitError = `Both credit and debit are empty for row ${
                  index + row_offset
                }, treating as 0 <${credit_raw}> <${debit_raw}>`
                debit_error_discovered = true
              } else if (debit_raw) {
                const debit_string = this.truncate(debit_raw, this.truncateLength)
                this.debitError = `Could not parse number (${debit_string}) for row ${
                  index + row_offset
                }, treating as 0`
              }
              debit_error_discovered = true
            }
            debit = 0
          }
          debit = Math.abs(debit)
        }

        return {
          date: row[this.headerColumns.date],
          memo: row[this.headerColumns.memo],
          amount: credit - debit
        }
      })
    },
    parseFile() {
      /**
       * Parse the csv file and then update the table data
       */
      if (!this.chosenFile) {
        return
      }
      this.isLoading = true
      this.$papa.parse(this.chosenFile, {
        delimiter: ',',
        header: this.useHeaders,
        skipEmptyLines: true,
        complete: (results) => {
          this.parsedResults = results
          this.toUpdateHeaderColumns = false
          this.processHeaders()
          console.log('parse file update table data')
          this.updateTableData()
          this.verifyDateFormat()
          this.$nextTick(() => {
            this.toUpdateHeaderColumns = true
          })
        }
      })
    },
    onDateFormatChange(date_format) {
      this.dateFormat = date_format
      console.log('on date format change update table data')
      this.updateTableData()
      this.verifyDateFormat()
    },
    verifyDateFormat() {
      this.dateFormatError = ''
      if (!this.tableData) {
        return
      }
      try {
        let i = this.useHeaders ? 1 : 0
        for (; i < this.tableData.length; i++) {
          const date_raw = this.tableData[i].date
          if (!moment(date_raw, this.dateFormat, true).isValid()) {
            this.dateFormatError = `Unable to match input '${date_raw}' with format '${this.dateFormat}' for row ${i}`
            break
          }
        }
      } catch (error) {
        this.dateFormatError = error.message
      }
    },
    truncate(input_string, length) {
      if (!input_string) {
        return ''
      }
      if (input_string.length <= length) {
        return input_string
      }
      return input_string.substring(0, length - 3) + '...'
    },
    onCancel() {
      this.$emit('close')
    },
    onSave() {
      this.$emit('apply')
    },
    processHeaders() {
      if (this.useHeaders) {
        const headers = _.get(this.parsedResults, ['meta', 'fields'], [])
        if (!headers) {
          return
        }
        const date_candidates = ['date', 'Date', 'Date Posted', 'date posted', 'Date Transacted', 'date transacted']
        const memo_candidates = ['memo', 'description', 'description posted', 'description transacted']
        const credit_candidates = ['amount', 'amount posted', 'amount transacted', 'value', 'credit', 'incoming', 'in']
        const debit_candidates = ['debit', 'debit posted', 'debit transacted', 'outgoing', 'out']

        this.headerColumns.date = findHeader(headers, date_candidates)
        this.headerColumns.memo = findHeader(headers, memo_candidates)
        if (this.useSeparateDebits) {
          this.headerColumns.credit = findHeader(headers, credit_candidates)
          this.headerColumns.debit = findHeader(headers, debit_candidates)
        } else {
          this.headerColumns.credit = findHeader(headers, credit_candidates)
        }
      } else {
        this.headerColumns.date = 0
        this.headerColumns.memo = 1
        this.headerColumns.credit = 2
        this.headerColumns.debit = 3
      }
    }
  }
}
</script>

<style>
.transaction-details-grid .v-file-input .v-input__prepend-outer {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
