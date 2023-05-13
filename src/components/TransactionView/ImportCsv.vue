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
          style="flex: 0;"
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
        <v-checkbox
          dense
          v-model="useHeadersChecked"
          hide-details
          data-testid="use-headers-checkbox"
        >
          <template #label><span class="text-body-1">Use headers</span></template>
        </v-checkbox>
        <v-checkbox
          dense
          v-model="useDebitChecked"
          hide-details
          data-testid="separate-credit-debit-checkbox"
        >
          <template #label><span class="text-body-1">Separate credit and debit</span></template>
        </v-checkbox>
      </div>
      <div class="text-h5">Date</div>
      <import-ofx-column
        :header-options="headerOptions"
        v-model="headerColumns.date"
        label="Date:"
        :disabled="tableData.length < 1"
        data-testid="date-column-select"
      />
      <div class="text-h5">Format</div>
      <import-ofx-column
        :header-options="dateFormatOptions"
        label="Date Format:"
        v-model="dateFormat"
        @input="onDateFormatChange"
        :errorText="dateFormatError"
        :disabled="tableData.length < 1"
        data-testid="date-format-select"
      />
      <div class="text-h5">Memo</div>
      <import-ofx-column
        :header-options="headerOptions"
        v-model="headerColumns.memo"
        label="Memo:"
        :disabled="tableData.length < 1"
        data-testid="memo-column-select"
      />
      <div class="text-h5">Amount</div>
      <import-ofx-column
        :header-options="headerOptions"
        :label="useSeparateDebits ? 'Credit:' : 'Amount:'"
        v-model="headerColumns.credit"
        :error-text="creditError"
        :disabled="tableData.length < 1"
        data-testid="credit-column-select"
      />
      <div class="text-h5">Debit</div>
      <import-ofx-column
        :header-options="headerOptions"
        label="Debit:"
        v-model="headerColumns.debit"
        :disabled="!useSeparateDebits || tableData.length < 1"
        :errorText="debitError"
        data-testid="debit-column-select"
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
import { mapGetters, mapActions } from "vuex";
import CancelSave from "../Shared/CancelSave.vue";
import ImportTable from "./ImportTable.vue";
import ImportOfxColumn from "./ImportOfxColumn.vue";
import moment from "moment";
import { NONE } from "../../constants";

const findHeader = (headers, candidates) => {
  const index = headers.findIndex((header) => candidates.includes(header.toLowerCase()));
  if (index > -1) {
    return headers[index];
  }
  return headers[0];
};

export default {
  name: "ImportCsv",
  components: {
    CancelSave,
    ImportTable,
    ImportOfxColumn,
  },
  props: {
    account: {
      type: String,
      required: true,
    },
  },
  watch: {
    headerColumns: {
      handler() {
        if (this.toUpdateHeaderColumns) {
          console.log("Header columns changed");
          this.updateTableData();
          // this.verifyDateFormat();
        }
      },
      deep: true,
    },
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
        debit: 3,
      },
      toUpdateHeaderColumns: true,
      truncateLength: 20,
      creditError: "",
      debitError: "",
      dateFormatError: "",
      dateFormat: "DD/MM/YYYY",
      dateFormatOptions: [
        "D/M/YYYY",
        "D-M-YYYY",
        "D.M.YYYY",
        "M/D/YYYY",
        "M-D-YYYY",
        "M.D.YYYY",
        "YYYY/M/D",
        "YYYY-M-D",
        "YYYY.M.D",
      ],
      tableData: [],
      initialData: null,
    };
  },
  created() {
    this.setInitialData();
  },
  computed: {
    ...mapGetters("accountTransactions", ["importIds"]),
    useHeadersChecked: {
      get() {
        return this.useHeaders;
      },
      set(value) {
        this.useHeaders = value;
        this.parseFile();
      },
    },
    useDebitChecked: {
      get() {
        return this.useSeparateDebits;
      },
      set(value) {
        this.useSeparateDebits = value;
        this.parseFile();
      },
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
    applyIsDisabled() {
      // console.log(this.$data)
      return (
        this.tableData.length < 1 ||
        Boolean(this.creditError) ||
        (this.useSeparateDebits && Boolean(this.debitError)) ||
        Boolean(this.dateFormatError)
      );
    },
    headerOptions() {
      if (!this.parsedResults) {
        return [];
      }
      if (this.useHeaders) {
        return Object.keys(this.parsedResults.data[0]);
      } else {
        let result = [];
        for (let i = 0; i < this.parsedResults.data[0].length; i++) {
          result.push(i);
        }
        return result;
      }
    },
  },
  methods: {
    ...mapActions(["loadLocalBudget"]),
    ...mapActions("accountTransactions", ["onImportTransactions"]),
    updateTableData() {
      /**
       * Interpret the parsed csv file into a table
       */
      console.log("Getting table data", this.useHeaders);
      if (!this.parsedResults) {
        return [];
      }
      this.creditError = "";
      this.debitError = "";
      this.dateFormatError = "";
      let credit_error_discovered = false;
      let debit_error_discovered = false;
      const row_offset = this.useHeaders ? 2 : 1;
      this.tableData = this.parsedResults.data.map((row, index) => {
        const credit_raw = row[this.headerColumns.credit];
        let credit = parseFloat(row[this.headerColumns.credit]);
        if (isNaN(credit)) {
          if (!credit_raw) {
            if (!this.useSeparateDebits && !credit_error_discovered) {
              this.creditError = `Credit is empty for row ${index + row_offset}, treating as 0`;
              credit_error_discovered = true;
            }
          } else {
            if (!credit_error_discovered) {
              console.log("Couldn't parse credit", credit_raw);
              const credit_string = this.truncate(credit_raw, this.truncateLength);
              this.creditError = `Could not parse number (${credit_string}) for row ${
                index + row_offset
              }, treating as 0`;
              credit_error_discovered = true;
            }
          }
          credit = 0;
        }

        let debit = 0;
        if (this.useSeparateDebits) {
          const debit_raw = row[this.headerColumns.debit];
          debit = parseFloat(debit_raw);
          if (isNaN(debit)) {
            if (!debit_error_discovered) {
              if (!debit_raw && !credit_raw) {
                this.debitError = `Both credit and debit are empty for row ${
                  index + row_offset
                }, treating as 0 <${credit_raw}> <${debit_raw}>`;
                debit_error_discovered = true;
              } else if (debit_raw) {
                const debit_string = this.truncate(debit_raw, this.truncateLength);
                this.debitError = `Could not parse number (${debit_string}) for row ${
                  index + row_offset
                }, treating as 0`;
              }
              debit_error_discovered = true;
            }
            debit = 0;
          }
          debit = Math.abs(debit);
        }
        const row_date = _.get(row, [this.headerColumns.date], "");
        let date = moment(row_date, this.dateFormat);

        if (!date.isValid()) {
          if (!this.dateFormatError) {
            this.dateFormatError = `Could not parse date '${row_date}'' with format '${
              this.dateFormat
            }' for row ${index + row_offset}, please check the date format`;
          }
          date = row_date;
        } else {
          date = date.format("YYYY-MM-DD");
        }

        let data = {
          date: date,
          memo: _.get(row, [this.headerColumns.memo], ""),
          amount: credit - debit,
        };

        data.importId = `${this.account}-${data.date}-${data.memo.substring(0, 20)}-${data.amount}`;
        data.exists = data.importId in this.importIds;

        return data;
      });
    },
    parseFile() {
      console.log("Parsing file");
      /**
       * Parse the csv file and then update the table data
       */
      if (!this.chosenFile) {
        console.log("No file chosen");
        this.reset();
        return;
      }
      this.isLoading = true;
      this.$papa.parse(this.chosenFile, {
        delimiter: ",",
        header: this.useHeaders,
        skipEmptyLines: true,
        complete: (results) => {
          this.parsedResults = results;
          this.toUpdateHeaderColumns = false;
          this.processHeaders();
          console.log("parse file update table data");
          this.updateTableData();
          // this.verifyDateFormat();
          this.$nextTick(() => {
            this.toUpdateHeaderColumns = true;
          });
        },
      });
    },
    onDateFormatChange(date_format) {
      this.dateFormat = date_format;
      console.log("on date format change update table data");
      this.updateTableData();
      // this.verifyDateFormat();
    },
    // verifyDateFormat() {
    //   this.dateFormatError = "";
    //   if (!this.tableData) {
    //     return;
    //   }
    //   try {
    //     let i = this.useHeaders ? 1 : 0;
    //     for (; i < this.tableData.length; i++) {
    //       const date_raw = this.tableData[i].date;
    //       if (!moment(date_raw, this.dateFormat, true).isValid()) {
    //         this.dateFormatError = `Unable to match input '${date_raw}' with format '${this.dateFormat}' for row ${i}`;
    //         break;
    //       }
    //     }
    //   } catch (error) {
    //     this.dateFormatError = error.message;
    //   }
    // },
    truncate(input_string, length) {
      if (!input_string) {
        return "";
      }
      if (input_string.length <= length) {
        return input_string;
      }
      return input_string.substring(0, length - 3) + "...";
    },
    onCancel() {
      this.$emit("close");
    },
    onSave() {
      return this.onImportTransactions({
        transactions: this.tableData,
        account: this.account,
      })
        .then(() => {
          return this.loadLocalBudget();
        })
        .finally(() => {
          this.$emit("apply");
          this.reset();
        });
    },
    setInitialData() {
      this.initialData = JSON.parse(JSON.stringify(this.$data));
    },
    reset() {
      Object.assign(this.$data, JSON.parse(JSON.stringify(this.initialData)));
      this.setInitialData();
    },
    processHeaders() {
      if (this.useHeaders) {
        const headers = _.get(this.parsedResults, ["meta", "fields"], []);
        if (!headers) {
          return;
        }
        const date_candidates = [
          "date",
          "Date",
          "Date Posted",
          "date posted",
          "Date Transacted",
          "date transacted",
        ];
        const memo_candidates = [
          "memo",
          "description",
          "description posted",
          "description transacted",
        ];
        const credit_candidates = [
          "amount",
          "amount posted",
          "amount transacted",
          "value",
          "credit",
          "incoming",
          "in",
        ];
        const debit_candidates = ["debit", "debit posted", "debit transacted", "outgoing", "out"];

        this.headerColumns.date = findHeader(headers, date_candidates);
        this.headerColumns.memo = findHeader(headers, memo_candidates);
        if (this.useSeparateDebits) {
          this.headerColumns.credit = findHeader(headers, credit_candidates);
          this.headerColumns.debit = findHeader(headers, debit_candidates);
        } else {
          this.headerColumns.credit = findHeader(headers, credit_candidates);
        }
      } else {
        this.headerColumns.date = 0;
        this.headerColumns.memo = 1;
        this.headerColumns.credit = 2;
        this.headerColumns.debit = 3;
      }
    },
  },
};
</script>

<style>
.transaction-details-grid .v-file-input .v-input__prepend-outer {
  margin-top: auto;
  margin-bottom: auto;
}

.transaction-details-grid > div {
  padding-bottom: 3px;
}
</style>
