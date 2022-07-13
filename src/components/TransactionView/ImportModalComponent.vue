<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title class="primary">
        <v-toolbar-title class="white--text"> Import Transactions </v-toolbar-title>
      </v-card-title>

      <v-tabs v-model="tab" grow>
        <v-tab> OFX </v-tab>
        <v-tab> CSV </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card-text>
            <v-file-input v-model="chosenFile" label="Upload OFX file" @change="onFileChange" />

            <div v-if="selectedOfxTransactions">
              <span> Select Account to Import: </span>
              <v-select v-model="selectedOfxTransactions" :items="accountsForImport" item-text="id" item-value="transactions" />

              <span class="heading"
                >Preview
                <strong>{{ selectedOfxTransactions ? selectedOfxTransactions.length : 0 }}</strong>
                transactions for import:</span
              >

              <v-simple-table height="300px">
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">Date</th>
                      <th class="text-left">Payee</th>
                      <th class="text-left">Memo</th>
                      <th class="text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedOfxTransactions" :key="item.FITID">
                      <td>{{ transactionDate(item.DTPOSTED) }}</td>
                      <td>{{ item.NAME }}</td>
                      <td>{{ item.MEMO }}</td>
                      <td>{{ item.TRNAMT }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <div v-if="accountsForImport.length === 0">
                <span>No accounts found.</span>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="error" @click.stop="show = false"> Cancel </v-btn>
            <v-btn color="primary" :disabled="!chosenFile" @click="pushTransactionsToBackend">
              Import Transactions
            </v-btn>
          </v-card-actions>
        </v-tab-item>

        <v-tab-item>
          <v-card-text>
            <vue-csv-import
              v-model="parseCsv"
              button-class="v-btn"
              auto-match-fields
              auto-match-ignore-case
              table-select-class="map-fields-select"
              :map-fields="['date', 'amount', 'memo', ]"
            >
              <!-- <template slot="hasHeaders" slot-scope="{ headers, toggle }">
              :map-fields="{Date: {required: false, label: 'Date'}}"
                <label>
                  <v-checkbox id="hasHeaders" type="checkbox" :value="headers" label="Headers?" @change="toggle"
                /></label>
              </template> -->

              <template slot="error"> File type is invalid </template>

              <!-- <template slot="thead">
                <tr>
                  <th>My Fields</th>
                  <th>Column</th>
                </tr>
              </template> -->

              <template slot="next" slot-scope="{ load }">
                <v-btn class="my-3" @click.prevent="load"> parse csv file </v-btn>
              </template>
            </vue-csv-import>

            <v-divider />
            <span class="heading pt-3">
              Preview
              <strong>{{ parseCsv ? parseCsv.length : 0 }}</strong>
              transactions for import:
            </span>

            <v-simple-table v-if="parseCsv" height="300px">
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left">Date</th>
                    <th class="text-left">Payee</th>
                    <th class="text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in parseCsv" :key="item.date+item.memo+item.amount">
                    <td>{{ item.date }}</td>
                    <td>{{ item.payee }}</td>
                    <td>{{ item.amount }}</td>
                    <td>{{ item.memo }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>

            <v-card-actions>
              <v-spacer />
              <v-btn color="error" @click.stop="show = false"> Cancel </v-btn>
              <v-btn color="primary" :disabled="!parseCsv" @click="importCSVTransactions"> Import Transactions </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
// import Banking from 'banking'
import { mapGetters } from 'vuex'
import _ from 'lodash'
import { VueCsvImport } from 'vue-csv-import'
import moment from 'moment'
import {
  getAccountId,
  getAccountType,
  getAccountBankId,
  getAccountTransactions,
  getDate,
  cyrb53Hash
} from '../../ofxParse'
import { ID_NAME, NONE } from '../../constants'
import ofx from 'node-ofx-parser'

export default {
  name: 'ImportFile',
  components: { VueCsvImport },
  props: ['visible', 'account'],
  data() {
    return {
      csvFields: {
        name: { required: false, label: 'Name'},
        age: {required: true, label: 'Age'}
      },
      tab: null,
      parseCsv: null,
      selectedOfxTransactions: null,
      accountsForImport: [],
      importCount: {
        imported: 0,
        skipped: 0
      },
      chosenFile: null
    }
  },
  computed: {
    ...mapGetters(['accounts', 'selectedBudgetId']),
    show: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('close')
          this.resetData()
        }
      }
    }
  },
  watch: {},
  methods: {
    onFileChange() {
      this.readOFXfile(this.chosenFile)
    },
    importTransactions() {},
    readOFXfile(file) {
      const reader = new FileReader()
      this.accountsForImport = []
      this.selectedOfxTransactions = {}

      reader.onload = (e) => {
        // TODO: Get this new ofx parser to work, possibly different arguments required
        ofx.parse(e.target.result, (res) => {
          const potentialBankAccounts = _.get(res, 'body.OFX.BANKMSGSRSV1.STMTTRNRS', [])
          const potentialCreditAccounts = _.get(res, 'body.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS', [])
          var creditAccountsForImport = []
          var bankAccountsForImport = []

          if (Array.isArray(potentialBankAccounts)) {
            bankAccountsForImport = potentialBankAccounts
          } else {
            bankAccountsForImport.push(potentialBankAccounts)
          }

          bankAccountsForImport = bankAccountsForImport.map((acct) => {
            let standardAcct = {}
            standardAcct.id = getAccountId(acct)
            standardAcct.type = getAccountType(acct)
            standardAcct.bankid = getAccountBankId(acct)
            standardAcct.transactions = getAccountTransactions(acct)
            return standardAcct
          })

          if (Array.isArray(potentialCreditAccounts)) {
            creditAccountsForImport = potentialCreditAccounts
          } else {
            creditAccountsForImport.push(potentialCreditAccounts)
          }

          creditAccountsForImport = creditAccountsForImport.map((acct) => {
            let standardAcct = {}
            standardAcct.id = acct.CCSTMTRS.CCACCTFROM.ACCTID
            standardAcct.type = 'CREDIT'
            standardAcct.bankid = acct.CCSTMTRS.CCACCTFROM.ACCTID
            standardAcct.transactions = acct.CCSTMTRS.BANKTRANLIST.STMTTRN
            return standardAcct
          })

          this.accountsForImport = this.accountsForImport.concat(bankAccountsForImport, creditAccountsForImport)
          if (this.accountsForImport.length > 0 && this.accountsForImport[0]) {
            this.selectedOfxTransactions = this.accountsForImport[0].transactions
          }

          // TODO: Make import button enabled here
        })
      }
      if (file) {
        reader.readAsText(file)
      }
    },
    transactionDate(value) {
      return getDate(value)
    },
    async pushTransactionsToBackend() {
      // const transactionListToImport = []
      // this.selectedOfxTransactions.forEach((trn) => {
      //   //Create a custom imprtId that appends account to the FITID
      //   const import_id = `${this.account}_${trn.FITID}`
      //   if (this.$store.getters.listOfImportIds.includes(import_id) && trn.FITID !== '' && trn.FITID !== null) {
      //     console.log('import skipped')
      //     this.importCount.skipped++
      //   } else {
      //     const date = getDate(trn.DTPOSTED)
      //     const jsonData = {
      //       account: this.account,
      //       category: NONE._id,
      //       cleared: false,
      //       approved: false,
      //       value: Math.round(trn.TRNAMT * 100),
      //       date: date,
      //       memo: trn.MEMO,
      //       reconciled: false,
      //       flag: '#ffffff',
      //       payee: trn.NAME ? trn.NAME : null,
      //       imprtId: import_id,
      //       transfer: null,
      //       splits: [],
      //       _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(date, trn.FITID)}`
      //     }

      //     this.importCount.imported++
      //     transactionListToImport.push(jsonData)
      //   }
      // })

      const import_promises = this.selectedOfxTransactions.map((transaction) => {
        const import_id = `${this.account}_${transaction.FITID}`
        return this.$store
          .dispatch(
            'fetchTransactionsWithImportId',
            { account_id: this.account, import_id: import_id}
          ).then((results) => {
            if (results && results.length > 0) {
              this.importCount.skipped++
              return null
            }
            this.importCount.imported++
            const date = getDate(transaction.DTPOSTED)

            return {
              account: this.account,
              category: NONE._id,
              cleared: false,
              approved: false,
              value: Math.round(transaction.TRNAMT * 100),
              date: date,
              memo: transaction.MEMO,
              reconciled: false,
              flag: '#ffffff',
              payee: transaction.NAME ? transaction.NAME : null,
              imprtId: import_id,
              transfer: null,
              splits: [],
              _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(date, transaction.FITID)}`
            }

          })
      })

      return this.doImport(import_promises)

      // this.$swal({
      //   title: 'Loading...',
      //   html: 'Importing transactions. Please wait...',
      //   didOpen: () => {
      //     Vue.prototype.$swal.showLoading()
      //   },
      //   showConfirmButton: false,
      //   showCancelButton: false
      // })

      // await this.commitTransactions(transactionListToImport)

      // this.importComplete()
      // this.$emit('close')
    },
    async importCSVTransactions() {
      const import_promises = this.parseCsv.map((transaction) => {
        // Strip commas
        const value = transaction.amount.toString().replace(/[^0-9.-]/g, '')
        const date = moment(transaction.date).format('YYYY-MM-DD')

        // Create a custom import ID to prevent repeat imports
        const import_id = `${this.account}_${date}-${value}-${transaction.memo}`
        return this.$store
          .dispatch(
            'fetchTransactionsWithImportId', 
            { account_id: this.account, import_id: import_id }
          ).then((results) => {
            if (results && results.length > 0) {
              this.importCount.skipped++
              return null
            }

            this.importCount.imported++
            return {
              account: this.account,
              category: NONE._id,
              cleared: false,
              approved: false,
              value: Math.round(value * 100),
              date: date,
              memo: transaction.memo,
              reconciled: false,
              flag: '#ffffff',
              payee: transaction.payee ? transaction.payee : NONE._id,
              importId: import_id,
              transfer: null,
              splits: [],
              _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(date)}`
            }
          })
      })

      return this.doImport(import_promises)
    },
    async doImport(import_promises) {
      this.$swal({
        title: 'Loading...',
        html: 'Importing transactions. Please wait...',
        didOpen: () => {
          Vue.prototype.$swal.showLoading()
        },
        showConfirmButton: false,
        showCancelButton: false
      })

      const import_promise_result = await Promise.all(import_promises)
      const transaction_list_to_import = import_promise_result
        .filter((transaction) => transaction !== null)

      try {
        await this.commitTransactions(transaction_list_to_import)
      } finally {
        this.parseCsv = null
        this.importComplete()
        this.$emit('close')
      }
    },
    async commitTransactions(transaction_list_to_import) {
      for (const transaction of transaction_list_to_import) {
        await this.$store.dispatch('createOrUpdateTransaction', { current: transaction, previous: null })
      }

      return Promise.resolve()
    },
    importComplete() {
      const msg = `Transactions Skipped: ${this.importCount.skipped} \nTransactions Imported: ${this.importCount.imported}`
      this.$swal('Import Complete', msg, 'success')

      this.resetData()
    },
    resetData() {
      this.selectedOfxTransactions = null
      this.accountsForImport = null
      this.importCount = {
        imported: 0,
        skipped: 0
      },
      this.chosenFile = null
    }
  }
}
</script>

<style>
.map-fields-select {
  border: 1px solid grey !important;
}
</style>
