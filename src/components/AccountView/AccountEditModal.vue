<template>
  <v-dialog v-model="show" max-width="500px" @keydown.enter.ctrl.exact.prevent="save">
    <base-modal-component
      :show="show"
      confirm-label="Save"
      @cancel="close"
      @confirm="save"
      data-testid="account-edit-modal"
    >
      <template #title> {{ isNew ? 'Add Account' : 'Edit Account' }} </template>
      <template #body>
        <v-form ref="form" v-model="valid">
          <div id="account-details-grid" class="transaction-details-grid pa-2 pb-0">
            <div class="text-h5">Name</div>
            <div>
              <string-input
                class="account-name-input"
                :id="`account-name-input`"
                :data-testid="`account-name-input`"
                :is-editing="true"
                :loading="false"
                placeholder="Account Name"
                show-details
                :rules="nameRules"
                :value="editedItem.name"
                @apply="onEditAccountName"
              />
            </div>
            <div class="text-h5">Initial Balance</div>
            <div>
              <currency-input
                fill-unfocused
                allow-negative
                input-testid="account-initial-balance-input"
                v-model="editedItem.initialBalance"
              />
            </div>
            <div class="text-h5">Type</div>
            <div class="account-type">
              <v-select
                id="account-type-field"
                v-model="editedItem.type"
                :items="ACCOUNT_TYPES"
                data-testid="account-type"
                background-color="background"
                solo
                dense
                hide-details
              >
                <template #selection="{ item }">
                  <span class="text-body-1">{{ item }}</span>
                </template>
                <template #item="{ item }">
                  {{ item }}
                </template>
              </v-select>
            </div>
            <div class="text-h5">Tracking</div>
            <div class="mt-1">
              <details-checkbox
                :selected="editedItem.onBudget"
                data-testid="account-on-budget-checkbox"
                id="account-on-budget-checkbox"
                @click="editedItem.onBudget = !editedItem.onBudget"
                class="pb-2"
              >
                Track this account
              </details-checkbox>
            </div>
            <div class="text-h5">Balance</div>
            <div class="mt-1">
              <details-checkbox
                :selected="editedItem.sign < 0"
                data-testid="account-invert-balance-checkbox"
                id="account-invert-balance-checkbox"
                @click="editedItem.sign = -1 * editedItem.sign"
                class="pb-2"
              >
                Invert Balance
              </details-checkbox>
            </div>
            <div class="text-h5">Notes</div>
            <div>
              <v-textarea
                class="text-body-1 mb-3"
                id="account-notes-field"
                v-model="editedItem.note"
                data-testid="account-notes-field"
                background-color="background lighten-2"
                flat
                solo
                dense
                hide-details
                placeholder="Notes"
                rows="5"
                @keydown.enter.ctrl.exact.prevent="save"
              />
            </div>
            <div v-if="!isNew">Danger</div>
            <div v-if="!isNew">
              <delete-confirm
                id="account-transactions-delete-confirm"
                :data-testid="`account-transactions-delete-confirm`"
                @confirm="onDeleteAccountTransactions"
                title-text="Delete Transactions"
                :body-text="
                  `Are you sure you want to delete all ${numAccountTransactions} ` +
                  `transactions for account '${editedItem.name}'?`
                "
              >
                <template #activator="{ on }">
                  <v-btn
                    v-on="on"
                    text
                    color="error lighten-1"
                    :loading="deleteLoading"
                    data-testid="btn-delete-account-transactions"
                  >
                    <v-icon small left>mdi-delete</v-icon>
                    Delete transactions
                  </v-btn>
                </template>
              </delete-confirm>
              <br />
              <delete-confirm
                :id="`account-delete-confirm`"
                :data-testid="`account-delete-confirm`"
                @confirm="onDeleteAccount"
              >
                <template #activator="{ on }">
                  <v-btn
                    v-on="on"
                    text
                    color="error lighten-1"
                    :loading="deleteLoading"
                    :disabled="!accountIsEmpty"
                    data-testid="btn-delete-account"
                  >
                    <v-icon small left>mdi-delete</v-icon>
                    Delete Account
                  </v-btn>
                </template>
              </delete-confirm>
              <div v-if="!accountIsEmpty" class="text-body1 error--text text--lighten-1">
                <span>Unable to delete account with transactions</span>
              </div>
              <div v-else class="text-body1">
                <span>Okay to delete, account has 0 transactions</span>
              </div>
            </div>
          </div>
        </v-form>
      </template>
    </base-modal-component>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ACCOUNT_TYPES, ID_LENGTH } from '../../constants'
import BaseModalComponent from './../Modals/BaseModalComponent.vue'
import StringInput from '../Shared/StringInput.vue'
import DetailsCheckbox from '../Shared/DetailsCheckbox.vue'
import CurrencyInput from '../Shared/CurrencyInput.vue'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import DetailsButton from '../Shared/DetailsButton.vue'

export default {
  name: 'AccountEditModal',
  components: {
    BaseModalComponent,
    StringInput,
    DetailsCheckbox,
    CurrencyInput,
    DeleteConfirm,
    DetailsButton
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    editedItem: {
      type: Object,
      required: true
    },
    isNew: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ACCOUNT_TYPES,
      nameRules: [
        (v) => !!v || 'Name is required',
        (v) => (v && v.length <= 200) || 'Name must be less than 200 characters'
      ],
      valid: false,
      deleteLoading: true,
      accountIsEmpty: false
    }
  },
  computed: {
    ...mapGetters(['budgetId', 'accounts', 'accountTransactionCounts']),
    // ...mapGetters('accountTransactions', ['numServerTransactions', 'accountName', 'accountId']),
    ...mapGetters('categoryMonth', ['selectedMonth']),
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    accountId() {
      return this.editedItem._id.slice(-ID_LENGTH.account)
    },
    numAccountTransactions() {
      return this.accountTransactionCounts[this.accountId]
    }
  },
  // beforeMount() {
  //   this.fetchAccountIsEmpty(this.editedItem._id)
  //     .then((isEmpty) => {
  //       this.accountIsEmpty = isEmpty
  //     })
  //     .finally(() => {
  //       this.deleteLoading = false
  //     })
  // },
  beforeMount() {
    if (this.value) {
      this.updateAccountIsEmpty()
    }
  },
  watch: {
    value: {
      handler: function (value_state) {
        if (value_state) {
          this.updateAccountIsEmpty()
        }
      }
    }
  },
  methods: {
    ...mapActions(['fetchAccountIsEmpty', 'deleteAllAccountTransactions', 'deleteAccount']),
    // ...mapActions('accountTransactions', ['deleteAccount']),
    onEditAccountName(event) {
      let name = ''
      if (typeof event === 'string' || event instanceof String) {
        name = event
      } else if (event.target) {
        name = event.target.value
      } else {
        return
      }
      this.editedItem.name = name
    },
    onDeleteAccountTransactions() {
      this.deleteAllAccountTransactions(this.accountId).finally(() => {
        this.close()
      })
    },
    onDeleteAccount() {
      if (this.accountIsEmpty) {
        this.deleteAccount(this.accountId)
          .then(() => {
            const account_id = this.accounts[0]._id.slice(-ID_LENGTH.account)
            if (this.accounts.length > 0) {
              this.$router.push({ name: 'transactions', params: { account_id } })
            } else {
              this.$router.push({ name: 'categories', month: this.selectedMonth })
            }
          })
          .finally(() => {
            this.close()
          })
      }
    },
    close() {
      this.$emit('close')
      const form = this.$refs.form
      if (form) {
        form.resetValidation()
      }
      this.show = false
    },
    save() {
      this.$refs.form.validate()
      if (this.valid) {
        this.$emit('save', this.editedItem)
        this.close()
      }
    },
    updateAccountIsEmpty() {
      this.fetchAccountIsEmpty(this.editedItem._id.slice(-ID_LENGTH.account))
        .then((isEmpty) => {
          this.accountIsEmpty = isEmpty
        })
        .finally(() => {
          this.deleteLoading = false
        })
    }
  }
}
</script>

<style>
.v-menu__content .v-list.v-select-list {
  background: var(--v-background-lighten2);
}

.account-type .v-input .v-input__control .v-input__slot {
  background: var(--v-background-lighten2) !important;
  box-shadow: none !important;
  height: 26px;
}

div#account-details-grid {
  grid-template-columns: 90px auto;
}
</style>
