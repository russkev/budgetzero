<template>
  <fragment>
    <v-card-title class="success darken-3 pa-3">Import OFX</v-card-title>
    <v-file-input
      show-size
      filled
      flat
      solo
      color="secondary lighten-2"
      background-color="background lighten-3"
      label="Upload OFX file"
      prepend-icon="mdi-file-upload"
      class="mx-2 mt-3 text-body-1"
      accept=".ofx"
      style="flex: 0"
      v-model="chosenFile"
      @change="onFileChange"
      :error-messages="fileErrorMessage"
      :loading="isLoading"
    >
      <!-- :error="false" -->
      <!-- :error-messages="['Error']" -->
      <!-- :error="Boolean(chosenFile)" -->
      <!-- :error="Boolean(chosenFile) && !Boolean(accountsForImport)" -->
      <template #label>
        <div class="text-body-1">Upload OFX file</div>
      </template>
    </v-file-input>
    <v-sheet class="flex-table-container ma-0 pa-0" color="transparent">
      <v-data-table
        fixed-header
        class="transactions-table import-preview-table flex-table-main background lighten-1"
        disable-sort
        dense
        group-desc
        sort-by="date"
        group-by="date"
        :items="parsedOfxTransactions"
        :items-per-page="200"
        :headers="importTransactionHeaders"
        :header-props="{
          'disable-sort': true
        }"
        :footer-props="{
          'items-per-page-options': [5, 10, 20, 50, 100, 200],
          'items-per-page-text': 'rows'
        }"
        :loading="isLoading"
      >
        <template #header.memo>
          <div class="text-h5">Memo</div>
        </template>
        <template #header.amount>
          <div class="text-h5">Amount</div>
        </template>
        <template #group.header="{ items }">
          <td colspan="20" class="date-row background">
            {{ formatDate(getDate(items[0].date)) }}
          </td>
        </template>
        <template #item.memo="{ item }">
          <div :class="`ml-3 ellipsis ${item.exists ? existsColor : ''}`">{{ item.memo }}</div>
        </template>
        <template #item.amount="{ item }">
          <div :class="item.exists ? existsColor : ''">{{ intlCurrency.format(item.amount) }}</div>
        </template>
      </v-data-table>
    </v-sheet>
    <div class="save-cancel-container pa-2">
      <cancel-save
        save-text="Import"
        save-id="import-ofx-transactions-button"
        :save-disabled="selectedOfxTransactions.length < 1"
        @cancel="onCancel"
        @save="onSave"
      />
    </div>
  </fragment>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getAccountId, getAccountType, getAccountBankId, getAccountTransactions, getDate } from '../../ofxParse'
import { NONE, ID_NAME } from '../../constants'
import CancelSave from '../Shared/CancelSave.vue'
import { formatDate } from '../../helper'
import ofx from 'node-ofx-parser'

export default {
  name: 'ImportOfx',
  components: {
    CancelSave
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedOfxTransactions: [],
      accountsForImport: [],
      chosenFile: null,
      readOfxError: '',
      isLoading: false,
      existsColor: 'secondary--text text--lighten-1',
      importCount: {
        imported: 0,
        skipped: 0
      }
    }
  },
  computed: {
    ...mapGetters(['importTransactionHeaders', 'intlCurrency', 'selectedBudgetId']),
    ...mapGetters('accountTransactions', ['importIds']),
    fileErrorMessage() {
      if (this.chosenFile && this.accountsForImport.length < 1 && !this.isLoading) {
        return ['Error reading file']
      } else {
        return []
      }
    },
    parsedOfxTransactions() {
      this.importCount.imported = 0
      this.importCount.skipped = 0
      return this.selectedOfxTransactions.map((transaction) => {
        const import_id = `${this.account}_${transaction.FITID}`
        const exists = import_id in this.importIds
        if (exists) {
          this.importCount.skipped++
        } else {
          this.importCount.imported++
        }
        return {
          date: transaction.DTPOSTED,
          amount: transaction.TRNAMT,
          memo: transaction.MEMO,
          exists: exists,
          importId: import_id
        }
      })
    }
  },
  methods: {
    ...mapActions(['commitBulkDocsToPouchAndVuex', 'loadLocalBudget']),
    ...mapActions('accountTransactions', ['getTransactions']),
    getDate: getDate,
    onFileChange() {
      this.isLoading = true
      this.readOFXfile(this.chosenFile)
    },
    formatDate: formatDate,
    readOFXfile(file) {
      const reader = new FileReader()
      this.accountsForImport = []
      this.selectedOfxTransactions = []

      reader.onload = (event) => {
        const parsed_ofx = ofx.parse(event.target.result)
        const potentialBankAccounts = _.get(parsed_ofx, 'OFX.BANKMSGSRSV1.STMTTRNRS', [])
        const potentialCreditAccounts = _.get(parsed_ofx, 'OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS', [])
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
          if (!Array.isArray(this.selectedOfxTransactions)) {
            this.selectedOfxTransactions = []
          }
        }
        this.isLoading = false
      }
      reader.onerror = (error) => {
        this.readOfxError = error
        this.isLoading = false
      }
      if (file) {
        reader.readAsText(file)
      } else {
        this.readOfxError = 'No file selected'
        this.isLoading = false
      }
    },
    onCancel() {
      this.resetData()
      this.$emit('close')
    },
    async doImport(importPromises) {
      const import_promise_result = await Promise.all(importPromises)
      console.log('Import promise result: ', import_promise_result)
      const transactions_list_to_import = import_promise_result.filter((transaction) => {
        return transaction !== null
      })
      console.log('Transactions list to import: ', transactions_list_to_import)
      try {
        await this.commitBulkNewDocsToPouch(transactions_list_to_import)
      } finally {
        this.$emit('apply')
        this.resetData()
      }
    },
    onSave() {
      // const import_promises = this.selectedOfxTransactions.map((transaction) => {
      //   const import_id = `${this.account}_${transaction.FITID}`
      //   return this.$store
      //     .dispatch('fetchTransactionsWithImportId', { account_id: this.account, import_id: import_id })
      //     .then((results) => {
      //       if (results && results.length > 0) {
      //         this.importCount.skipped++
      //         return null
      //       }
      //       this.importCount.imported++
      //       const date = getDate(transaction.DTPOSTED)
      //       return {
      //         account: this.account,
      //         category: NONE._id,
      //         cleared: false,
      //         approved: false,
      //         value: Math.round(transaction.TRNAMT * 100),
      //         date: date,
      //         memo: transaction.MEMO,
      //         reconciled: false,
      //         flag: '#ffffff',
      //         payee: transaction.NAME ? transaction.NAME : null,
      //         importId: import_id,
      //         transfer: null,
      //         splits: [],
      //         _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(date, transaction.FITID)}`
      //       }
      //     })
      // })
      // this.doImport(import_promises).then((result) => {
      //   this.loadLocalBudget()
      //   console.log('doImport result: ', result)
      // })
      const transaction_documents = this.parsedOfxTransactions.reduce((partial, transaction) => {
        if (transaction.exists) {
          return partial
        }
        const previous = null
        const date = getDate(transaction.date)
        const current = {
          account: this.account,
          category: NONE._id,
          cleared: false,
          approved: false,
          value: Math.round(Number(transaction.amount) * 100),
          date: date,
          memo: transaction.memo,
          reconciled: false,
          flag: '#ffffff',
          payee: transaction.name ? transaction.name : null,
          importId: transaction.importId,
          transfer: null,
          splits: [],
          _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(date, transaction.importId)}`
        }
        partial.push({ current, previous })
        return partial
      }, [])
      this.commitBulkDocsToPouchAndVuex(transaction_documents).then(() => {
        this.loadLocalBudget()
        this.$emit('apply')
        this.resetData()
      })
    },
    resetData() {
      this.selectedOfxTransactions = []
      this.chosenFile = null
      this.importCount = {
        imported: 0,
        skipped: 0
      }
    }
  }
}
</script>
