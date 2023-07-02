<template>
  <fragment>
    <v-card-title class="success darken-3 pa-3">Import CSV</v-card-title>
    <div class="transaction-details-grid pa-2 pb-0">
      <div class="text-h5">File</div>
      <div class="d-flex flex-row justify-space-between" id="csv-file-input">
        <v-file-input
          show-size
          filled
          flat
          solo
          style="flex: 1 1"
          color="primary lighten-2"
          background-color="background lighten-3"
          label="Upload CSV file"
          prepend-icon="mdi-file-upload"
          accept=".csv"
          v-model="chosenFile"
          @change="parseFile"
          hide-details
          full-width
        >
          <template #selection="{ text }">
            <div class="text-body-1 ellipsis">{{ text }}</div>
          </template>
          <template #label>
            <div class="text-body-1 ellipsis">Upload CSV file</div>
          </template>
        </v-file-input>
      </div>
      <div class="text-h5">Options</div>
      <div>
        <v-checkbox dense v-model="useHeadersChecked" hide-details data-testid="use-headers-checkbox">
          <template #label><span class="text-body-1">Use headers</span></template>
        </v-checkbox>
        <v-checkbox dense v-model="useDebitChecked" hide-details data-testid="separate-credit-debit-checkbox">
          <template #label><span class="text-body-1">Separate credit and debit</span></template>
        </v-checkbox>
      </div>
      <div class="text-h5">Date</div>
      <import-csv-column
        :header-options="headerOptions"
        :header-option-previews="headerOptionPreviews"
        :value="csvInfo.headerColumns.date"
        @input="($event) => onHeaderChanged('date', $event)"
        label="Date:"
        :disabled="tableData.length < 1"
        data-testid="date-column-select"
        name="date"
      />
      <div class="text-h5">Format</div>
      <import-csv-column
        :header-options="dateFormatOptions"
        label="Date Format:"
        v-model="csvInfo.dateFormat"
        @input="onDateFormatChange"
        :errorText="dateFormatError"
        :disabled="tableData.length < 1"
        data-testid="date-format-select"
        name="date-format"
      />
      <div class="text-h5">Memo</div>
      <import-csv-column
        :header-options="headerOptions"
        :header-option-previews="headerOptionPreviews"
        :value="csvInfo.headerColumns.memo"
        @input="($event) => onHeaderChanged('memo', $event)"
        label="Memo:"
        :disabled="tableData.length < 1"
        data-testid="memo-column-select"
        name="memo"
      />
      <div class="text-h5">Amount</div>
      <import-csv-column
        :header-options="headerOptions"
        :header-option-previews="headerOptionPreviews"
        :label="csvInfo.useSeparateDebits ? 'Credit:' : 'Amount:'"
        :value="csvInfo.headerColumns.credit"
        @input="($event) => onHeaderChanged('credit', $event)"
        :error-text="creditError"
        :disabled="tableData.length < 1"
        data-testid="credit-column-select"
        name="credit"
      />
      <div class="text-h5">Debit</div>
      <import-csv-column
        :header-options="headerOptions"
        :header-option-previews="headerOptionPreviews"
        label="Debit:"
        :value="csvInfo.headerColumns.debit"
        @input="($event) => onHeaderChanged('debit', $event)"
        :disabled="!csvInfo.useSeparateDebits || tableData.length < 1"
        :errorText="debitError"
        data-testid="debit-column-select"
        name="debit"
      />
    </div>

    <import-table :table-items="tableData" :is-loading="false" />
    <!-- :error-messages="fileErrorMessage"
      :loading="isLoading" -->
    <div></div>
    <div class="save-cancel-container pa-2">
      <cancel-save
        save-text="Import"
        save-id="import-csv-transactions-button"
        :save-disabled="applyIsDisabled"
        @cancel="onCancel"
        @save="onSave"
      />
    </div>
  </fragment>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CancelSave from '../Shared/CancelSave.vue'
import ImportTable from './ImportTable.vue'
import ImportCsvColumn from './ImportCsvColumn.vue'
import moment from 'moment'
import { DEFAULT_CSV_INFO } from '../../constants'

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
    ImportCsvColumn
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      parsedResults: null,
      chosenFile: null,
      selectedCsvTransactions: [],
      defaultCsvInfo: DEFAULT_CSV_INFO,
      csvInfo: DEFAULT_CSV_INFO,
      toUpdateHeaderColumns: true,
      truncateLength: 20,
      creditError: '',
      debitError: '',
      dateFormatError: '',
      dateFormatOptions: [
        'D/M/YYYY',
        'D-M-YYYY',
        'D.M.YYYY',
        'M/D/YYYY',
        'M-D-YYYY',
        'M.D.YYYY',
        'YYYY/M/D',
        'YYYY-M-D',
        'YYYY.M.D'
      ],
      tableData: [],
      initialData: null
    }
  },
  created() {
    this.updateDefaultCsvInfo(this.accountsById[this.account]['csvInfo'])
    this.setInitialData()
  },
  computed: {
    ...mapGetters('accountTransactions', ['importIds']),
    ...mapGetters(['accountsById']),
    useHeadersChecked: {
      get() {
        return this.csvInfo.useHeaders
      },
      set(value) {
        this.csvInfo.useHeaders = value
        this.parseFile()
      }
    },
    useDebitChecked: {
      get() {
        return this.csvInfo.useSeparateDebits
      },
      set(value) {
        this.csvInfo.useSeparateDebits = value
        this.parseFile()
      }
    },
    applyIsDisabled() {
      return (
        this.tableData.length < 1 ||
        Boolean(this.creditError) ||
        (this.csvInfo.useSeparateDebits && Boolean(this.debitError)) ||
        Boolean(this.dateFormatError)
      )
    },
    headerOptions() {
      if (!this.parsedResults) {
        return []
      }
      if (this.csvInfo.useHeaders) {
        return Object.keys(this.parsedResults.data[0])
      } else {
        let result = []
        for (let i = 0; i < this.parsedResults.data[0].length; i++) {
          result.push(i)
        }
        return result
      }
    },
    headerOptionPreviews() {
      if (
        !this.parsedResults ||
        !this.parsedResults.data ||
        this.parsedResults.data.length < 1 ||
        this.csvInfo.useHeaders
      ) {
        return []
      } else {
        let result = []
        for (let i = 0; i < this.parsedResults.data[0].length; i++) {
          result.push(this.parsedResults.data[0][i].slice(0, this.truncateLength))
        }
        return result
      }
    }
  },
  methods: {
    ...mapActions(['loadLocalBudget']),
    ...mapActions('accountTransactions', ['onImportTransactions']),
    updateTableData() {
      /**
       * Interpret the parsed csv file into a table
       */
      if (!this.parsedResults) {
        return []
      }
      this.creditError = ''
      this.debitError = ''
      this.dateFormatError = ''
      let credit_error_discovered = false
      let debit_error_discovered = false
      const row_offset = this.csvInfo.useHeaders ? 2 : 1
      this.tableData = this.parsedResults.data.map((row, index) => {
        const credit_raw = row[this.csvInfo.headerColumns.credit]
        let credit = parseFloat(row[this.csvInfo.headerColumns.credit])
        if (isNaN(credit)) {
          if (!credit_raw) {
            if (!this.csvInfo.useSeparateDebits && !credit_error_discovered) {
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
        if (this.csvInfo.useSeparateDebits) {
          const debit_raw = row[this.csvInfo.headerColumns.debit]
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
        const row_date = _.get(row, [this.csvInfo.headerColumns.date], '')
        let date = moment(row_date, this.csvInfo.dateFormat)

        if (!date.isValid()) {
          if (!this.dateFormatError) {
            this.dateFormatError = `Could not parse date '${row_date}'' with format '${
              this.csvInfo.dateFormat
            }' for row ${index + row_offset}, please check the date format`
          }
          date = row_date
        } else {
          date = date.format('YYYY-MM-DD')
        }

        let data = {
          date: date,
          memo: _.get(row, [this.csvInfo.headerColumns.memo], ''),
          amount: credit - debit
        }

        data.importId = `${this.account}-${data.date}-${data.memo.substring(0, 20)}-${data.amount}`
        data.exists = data.importId in this.importIds

        return data
      })
    },
    parseFile() {
      /**
       * Parse the csv file and then update the table data
       */
      if (!this.chosenFile) {
        this.reset()
        return
      }
      this.isLoading = true
      this.$papa.parse(this.chosenFile, {
        delimiter: ',',
        header: this.csvInfo.useHeaders,
        skipEmptyLines: true,
        complete: (results) => {
          this.parsedResults = results
          this.toUpdateHeaderColumns = false
          if (!this.accountsById[this.account]['csvInfo']) {
            this.processHeaders()
          }
          this.updateTableData()
          this.$nextTick(() => {
            this.toUpdateHeaderColumns = true
          })
        }
      })
    },
    onDateFormatChange(date_format) {
      this.csvInfo.dateFormat = date_format
      this.updateTableData()
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
      return this.onImportTransactions({
        transactions: this.tableData,
        account: this.account,
        csvInfo: this.csvInfo
      })
        .then(() => {
          this.updateDefaultCsvInfo(this.accountsById[this.account]['csvInfo'])
          return this.loadLocalBudget()
        })
        .finally(() => {
          this.$emit('apply')
          this.reset()
        })
    },
    onHeaderChanged(header, value) {
      this.csvInfo.headerColumns[header] = value
      this.updateTableData()
    },
    setInitialData() {
      this.initialData = JSON.parse(JSON.stringify(this.$data))
    },
    updateDefaultCsvInfo(csvInfo) {
      if (csvInfo) {
        this.defaultCsvInfo = JSON.parse(JSON.stringify(csvInfo))
        this.csvInfo = JSON.parse(JSON.stringify(csvInfo))
        this.updateTableData()
      }
    },
    reset() {
      Object.assign(this.$data, JSON.parse(JSON.stringify(this.initialData)))
      this.setInitialData()
    },
    processHeaders() {
      if (this.csvInfo.useHeaders) {
        const headers = _.get(this.parsedResults, ['meta', 'fields'], [])
        if (!headers) {
          return
        }
        const date_candidates = ['date', 'Date', 'Date Posted', 'date posted', 'Date Transacted', 'date transacted']
        const memo_candidates = ['memo', 'description', 'description posted', 'description transacted']
        const credit_candidates = ['amount', 'amount posted', 'amount transacted', 'value', 'credit', 'incoming', 'in']
        const debit_candidates = ['debit', 'debit posted', 'debit transacted', 'outgoing', 'out']

        this.csvInfo.headerColumns.date = findHeader(headers, date_candidates)
        this.csvInfo.headerColumns.memo = findHeader(headers, memo_candidates)
        if (this.csvInfo.useSeparateDebits) {
          this.csvInfo.headerColumns.credit = findHeader(headers, credit_candidates)
          this.csvInfo.headerColumns.debit = findHeader(headers, debit_candidates)
        } else {
          this.csvInfo.headerColumns.credit = findHeader(headers, credit_candidates)
        }
      } else {
        this.csvInfo.headerColumns.date = 0
        this.csvInfo.headerColumns.memo = 1
        this.csvInfo.headerColumns.credit = 2
        this.csvInfo.headerColumns.debit = 3
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

.transaction-details-grid > div {
  padding-bottom: 3px;
}

#csv-file-input {
  overflow: hidden;
}
</style>
