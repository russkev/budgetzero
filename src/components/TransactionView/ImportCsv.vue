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
    <v-checkbox dense v-model="useDebitChecked" label="Separate credit and debit" />
    <import-ofx-column :header-options="headerOptions" v-model="headerColumns.date" label="Date:" />
    <import-ofx-column :header-options="headerOptions" v-model="headerColumns.memo" label="Memo:" />
    <!-- <v-combobox :items="headerOptions" label="Memo" disable-lookup v-model="headerColumns.memo" /> -->
    <!-- <template v-if="useSeparateDebits"> -->
    <import-ofx-column
      :header-options="headerOptions"
      :label="useSeparateDebits ? 'Credit:' : 'Amount:'"
      v-model="headerColumns.credit"
      :error-text="amountError"
    />
    <import-ofx-column
      v-if="useSeparateDebits"
      :header-options="headerOptions"
      label="Debit:"
      v-model="headerColumns.debit"
    />
    <import-ofx-column
      :header-options="dateFormatOptions"
      label="Date Format:"
      v-model="dateFormat"
      @input="onDateFormatChange"
      :errorText="dateFormatError"
    />
    <!-- <v-combobox
      :items="headerOptions"
      :label="useSeparateDebits ? 'Credit' : 'Amount'"
      disable-lookup
      v-model="headerColumns.credit"
      :error-messages="amountError ? [amountError] : []"
    />
    <v-combobox
      v-if="useSeparateDebits"
      :items="headerOptions"
      label="Debit"
      disable-lookup
      v-model="headerColumns.debit"
    /> -->
    <!-- </template> -->
    <!-- <template v-else>
      <v-combobox :items="headerOptions" label="Amount" disable-lookup v-model="headerColumns.credit" />
    </template> -->
    <!-- <v-combobox
      :items="dateFormatOptions"
      label="Date Format"
      v-model="dateFormat"
      @change="onDateFormatChange"
      :error="false"
      :error-messages="dateFormatError ? [dateFormatError] : []"
    /> -->
    <!-- :error="dateFormatError !== ''" -->

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
    parsedResults(current) {
      if (current) {
        if (this.useHeaders) {
          const headers = _.get(current, ['meta', 'fields'], [])
          if (!headers) {
            return
          }
          const date_candidates = ['date', 'Date', 'Date Posted', 'date posted', 'Date Transacted', 'date transacted']
          const memo_candidates = ['memo', 'description', 'description posted', 'description transacted']
          const credit_candidates = [
            'amount',
            'amount posted',
            'amount transacted',
            'value',
            'credit',
            'incoming',
            'in'
          ]
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
      truncateLength: 20,
      amountError: '',
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
      dateFormatError: ''
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
    tableData() {
      if (!this.parsedResults) {
        return []
      }
      let error_discovered = false
      return this.parsedResults.data.map((row) => {
        this.amountError = ''
        const credit_raw = row[this.headerColumns.credit]
        let credit = parseFloat(row[this.headerColumns.credit])
        let credit_is_nan = false
        if (isNaN(credit)) {
          if (!this.useSeparateDebits) {
            const credit_string = this.truncate(credit_raw, this.truncateLength)
            this.amountError = `Could not parse number (${credit_string})`
            error_discovered = true
          }
          credit = 0
          credit_is_nan = true
        }

        let debit = 0
        if (this.useSeparateDebits) {
          const debit_raw = row[this.headerColumns.debit]
          debit = parseFloat(debit_raw)
          if (isNaN(debit)) {
            debit = 0
            if (credit_is_nan && !error_discovered) {
              const credit_string = this.truncate(credit_raw, this.truncateLength)
              const debit_string = this.truncate(debit_raw, this.truncateLength)
              this.amountError = `Could not parse one of either credit (${credit_string}) or debit (${debit_string})`
              error_discovered = true
            }
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
    parseFile() {
      if (!this.chosenFile) {
        return
      }
      console.log('on file change')
      this.onDateFormatChange(this.dateFormat)
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

    onDateFormatChange(date_format) {
      console.log('onDateFormatChange', date_format)
      console.log('parsedResults', this.tableData)
      this.dateFormatError = ''
      if (!this.tableData) {
        return
      }
      try {
        for (let i = 0; i < this.tableData.length; i++) {
          const date_raw = this.tableData[i].date
          if (!moment(date_raw, date_format, true).isValid()) {
            this.dateFormatError = `Unable to match ${date_raw} with ${date_format}`
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
    }
  }
}
</script>
