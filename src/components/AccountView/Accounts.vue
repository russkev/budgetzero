<template>
  <v-card elevation="0" class="mx-auto">
    <v-data-table
      id="accounts-table"
      :headers="headers"
      :items="accounts"
      class="elevation-1 account-table"
      hide-default-footer
      disable-pagination
    >
      <template #top>
        <v-toolbar flat color="white">
          <span class="text-h3">Accounts</span>
          <v-spacer />

          <AccountEditModal v-model="showModal" :edited-item="editedItem" @save="save()" />

          <v-btn
            id="add-account-button"
            color="accent"
            :dark="budgetExists"
            :disabled="!budgetExists"
            class="mb-2"
            @click="create()"
          >
            Add Account
          </v-btn>
        </v-toolbar>
        <v-divider class="pb-4" />
      </template>

      <template #item.action="item">
        <div class="crud-actions">
          <v-icon :id="`edit-${item._id}`" icon dark class="" color="primary" @click="editItem(item)"> edit </v-icon>
          <v-icon :id="`delete-${item._id}`" icon dark class="ml-1" color="accent" @click="deleteItem(item)">
            delete
          </v-icon>
        </div>
      </template>
      <template #no-data>
        <!-- <v-btn color="primary" @click="on">Add Account</v-btn> -->
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import AccountEditModal from './AccountEditModal.vue'
import { ID_NAME } from '../../constants'
// import { generateShortId } from "@/store/modules/id-module"

const DEFAULT_ACCOUNT_ITEM = {
  type: '',
  checkNumber: true,
  closed: false,
  name: '',
  note: null,
  sort: 0,
  onBudget: true,
  // balanceIsNegative: false,
  sign: 1,
  initialBalance: 0
}
/*
Account view
-------------

+ Add account
+ Delete account
+ Edit account
    ++ Rename
    ++ TODO: Add plaid association

View: Name -- Type -- Balance

{
  "type": "CREDIT",         //type one of: MORTGAGE ASSET CREDIT DEBIT INVESTMENT SAVINGS CASH
  "checkNumber": true,      //checkNumber true if check column is enabled
  "closed": false,
  "name": "Mortgage",
  "note": null,
  "sort": 7,                //sort can just all be zero initially
  "onBudget": false,
  "_id": “b_{budgetId}_account_{accountId}
}

*/

export default {
  name: 'AccountGrid',
  components: {
    AccountEditModal
  },
  data() {
    return {
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Type', value: 'type' },
        { text: 'On Budget', value: 'onBudget' },
        { text: 'Invert Balance', value: 'sign' },
        { text: 'Closed', value: 'closed' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      editedIndex: -1,
      editedItem: null,
      previousItem: null,

      showModal: false,
      nameRules: [
        (v) => !!v || 'Name is required',
        (v) => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ]
    }
  },
  computed: {
    ...mapGetters(['accounts', 'selectedBudgetId']),
    budgetExists() {
      // const month_from_params =  this.$route.params.month
      // console.log("ON MOUNTED")
      // const db = this.$pouch
      // console.log("DB", db)
      // console.log(this.$pouch.allDocs())
      // this.$pouch.allDocs().then((result) => {
      //   console.log("ALL DOCS RESULT", result)
      // })
      // console.log(this.selectedBudgetId)
      // console.log("MONTH FROM PARAMS", month_from_params)
      // const docs = this.$pouch.get("b_N8Q_account_ELC")
      //   .then((result) => {
      //     console.log("ALL DOCS RESULT", result)
      //     return 3
      //   }).catch((err) => {
      //     console.log("ALL DOCS ERROR", err)
      //     return 2
      //   })

      // console.log("DOCS", docs)
      return this.selectedBudgetId != 'null'
    }
  },
  mounted() {},
  created() {},
  methods: {
    create() {
      this.editedIndex = -1
      this.editedItem = { ...DEFAULT_ACCOUNT_ITEM }
      this.previousItem = null
      this.showModal = true
    },
    editItem(item) {
      this.$store.dispatch('fetchAccounts')
      // console.log("EDIT ITEM")
      // // console.log(this.$pouch)
      // this.$pouch.get('b_N8Q_account_7kW').then(() => {
      //   console.log("DOC FOUND")
      // }).catch(() => {
      //   console.log("DOCUMENT NOT FOUND")
      // }).finally(() => {
      //   console.log("FINALLY")
      // })
      // setTimeout(() => {
      //   console.log("AFTER TIMEOUT")
      // }, 100)

      this.editedIndex = this.accounts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.previousItem = item
      this.showModal = true
    },
    deleteItem(item) {
      const index = this.accounts.indexOf(item)
      this.$root
        .$confirm('Delete Account', 'Are you sure you want to delete this account?', {
          onlyShowAgreeBtn: false,
          agreeBtnColor: 'accent',
          agreeBtnText: 'Delete Account',
          cancelBtnColor: 'grey'
        })
        .then((confirm) => {
          this.$store
            .dispatch('deleteAccount', this.accounts[index])
            .then((response) => {
              console.log('Got some data, now lets show something in this component', response)
            })
            .catch((error) => {
              // Action failed
              this.$root.$confirm(
                'Deletion Failed',
                `This account still has ${error} transaction(s). You must delete those transactions to delete the account.`,
                {
                  onlyShowAgreeBtn: true,
                  agreeBtnColor: 'accent',
                  agreeBtnText: 'Ok'
                }
              )
            })
        })
    },
    close() {
      this.showModal = false
      setTimeout(() => {
        this.resetItems()
      }, 300)
    },
    save() {
      if (this.editedIndex > -1) {
        const payload = {
          ...this.editedItem
        }
        this.$store.dispatch('commitDocToPouchAndVuex', { current: payload, previous: this.previousItem }).then(() => {
          this.$store.dispatch('calculateAllValues')
        })
      } else {
        const payload = {
          ...this.editedItem,
          _id: `b_${this.selectedBudgetId}${ID_NAME.account}${this.generateShortId()}`
        }
        this.$store.dispatch('commitDocToPouchAndVuex', { current: payload, previous: null })
      }
    },
    resetItems() {
      this.editedIndex = -1
      this.editedItem = { ...DEFAULT_ACCOUNT_ITEM }
      this.previousItem = null
    }
  }
}
</script>

<style scoped></style>
