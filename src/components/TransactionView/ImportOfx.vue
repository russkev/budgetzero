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
      <template #label>
        <div class="text-body-1">Upload OFX file</div>
      </template>
    </v-file-input>
    <import-table :table-items="parsedOfxTransactions" :is-loading="isLoading" />
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
import CancelSave from '../Shared/CancelSave.vue'
import { formatDate } from '../../helper'
import ofx from 'node-ofx-parser'
import ImportTable from './ImportTable.vue'

export default {
  name: 'ImportOfx',
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
  data() {
    return {
      selectedOfxTransactions: [],
      accountsForImport: [],
      chosenFile: null,
      readOfxError: '',
      isLoading: false,
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
        const import_id =
          `${this.account}` +
          `-${transaction.FITID}` +
          `-${transaction.DTPOSTED}` +
          `-${transaction.MEMO.substring(0, 10)}` +
          `-${transaction.TRNAMT}`
        const exists = import_id in this.importIds
        if (exists) {
          this.importCount.skipped++
        } else {
          this.importCount.imported++
        }
        return {
          date: this.getDate(transaction.DTPOSTED),
          amount: transaction.TRNAMT,
          memo: transaction.MEMO,
          exists: exists,
          importId: import_id
        }
      })
    }
  },
  methods: {
    ...mapActions(['commitBulkDocsToPouchOnly', 'resetAndFetchAllDocsFromPouchDB']),
    ...mapActions('accountTransactions', ['onImportTransactions']),
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
    onSave() {
      return this.onImportTransactions({
        transactions: this.parsedOfxTransactions,
        account: this.account
      })
        .then(() => {
          // return this.resetAndFetchAllDocsFromPouchDB()
        })
        .finally(() => {
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
