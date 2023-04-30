<template>
  <v-card width="100%" flat color="background lighten-1" class="flex-sheet pa-1 ma-0">
    <!-- <div v-if="importOfx">Importing OFX file...</div> -->
    <import-ofx v-if="importOfxIsOpen" @close="onCloseImportOfx" @apply="onApplyImportOfx" :account="accountId" />
    <template v-else-if="editedTransaction._id !== DEFAULT_TRANSACTION._id">
      <v-card-title :class="`${titleColor} darken-3 pa-3`">{{ title }}</v-card-title>
      <div class="transaction-details-grid pa-2 pb-0" style="overflow-y: auto">
        <div class="text-h5" :style="borderRight['date']">Date</div>
        <details-date v-model="transactionDate" />
        <div class="text-h5" :style="borderRight['value']">Amount</div>
        <details-value />
        <div class="text-h5" :style="borderRight['cleared']">Status</div>
        <details-status />
        <div class="text-h5" :style="borderRight['category']">Category</div>
        <details-category />
        <div class="text-h5" :style="borderRight['memo']">Memo</div>
        <details-memo />
        <div class="text-h5" :style="borderRight['note']">Note</div>
        <details-note />
        <div class="text-h5" :style="borderRight['payee']">Danger</div>
        <details-delete />
        <div class="text-h5"></div>
        <details-data :transaction="editedTransaction" />
      </div>
      <div class="save-cancel-container pa-2">
        <cancel-save @cancel="onCancel" @save="onSave" />
      </div>
    </template>
    <details-buttons
      v-else-if="selectedTransactions.length > 0"
      icon="mdi-file-document-multiple"
      :subtitle="`${selectedTransactions.length} transactions selected`"
    >
      <template>
        <details-button
          data-testid="clear-selected-button"
          icon="mdi-alpha-c-circle"
          label="Clear"
          @click="onClearSelected"
        />
        <details-button
          data-testid="unclear-selected-button"
          icon="mdi-alpha-c-circle-outline"
          label="Unclear"
          @click="onUnclearSelected"
        />
        <v-menu v-model="categoryMenu" :close-on-content-click="false">
          <template #activator="{ on, attrs }">
            <details-button
              data-testid="categorize-as-button"
              icon="mdi-shape"
              label="Categorize"
              :on="on"
              :attrs="attrs"
            />
          </template>
          <category-select @selected="onCategorySelected" />
        </v-menu>
        <delete-confirm @confirm="deleteSelectedTransactions">
          <template #activator="{ on }">
            <details-button
              data-testid="delete-selected-transactions-button"
              icon="mdi-delete"
              label="Delete"
              :on="on"
            />
          </template>
        </delete-confirm>
        <details-button
          data-testid="deselect-all-button"
          icon="mdi-close"
          label="Deselect All"
          @click="onDeselectAll"
        />
      </template>
    </details-buttons>
    <details-buttons v-else icon="mdi-file-document-outline" subtitle="No transactions selected">
      <template>
        <details-button
          data-testid="create-transaction-button"
          icon="mdi-plus"
          label="Create"
          @click="addTransaction"
        />
        <details-button
          data-testid="import-transactions-button"
          icon="mdi-file-upload"
          label="Import"
          @click.stop="onOpenImportOfx"
        />
        <!-- @click.stop="importModalIsVisible = true" -->
        <!-- <import-transactions
          :visible="importModalIsVisible"
          :account="accountId"
          @close="onImportModalClose"
          @apply="onImportModalApply"
        /> -->
      </template>
    </details-buttons>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { DEFAULT_TRANSACTION } from '../../constants'
import DetailsDate from './DetailsDate.vue'
import DetailsValue from './DetailsValue.vue'
import DetailsCategory from './DetailsCategory.vue'
import DetailsMemo from './DetailsMemo.vue'
import DetailsNote from './DetailsNote.vue'
import DetailsFlowDirection from './DetailsFlowDirection.vue'
import DetailsStatus from './DetailsStatus.vue'
import DetailsButton from '../Shared/DetailsButton.vue'
import DetailsButtons from './DetailsButtons.vue'
import DetailsDelete from './DetailsDelete.vue'
import DetailsData from './DetailsData.vue'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import CancelSave from '../Shared/CancelSave.vue'
import ImportOfx from './ImportOfx.vue'

export default {
  components: {
    DetailsDate,
    DetailsValue,
    DetailsCategory,
    DetailsMemo,
    DetailsNote,
    DetailsFlowDirection,
    DetailsStatus,
    DetailsButton,
    DetailsButtons,
    DetailsDelete,
    DetailsData,
    DeleteConfirm,
    CancelSave,
    ImportOfx
  },
  data() {
    return {
      DEFAULT_TRANSACTION,
      categoryMenu: false,
      importModalIsVisible: false
      // importOfxIsOpen: false
    }
  },
  computed: {
    ...mapGetters('accountTransactions', [
      'editedTransaction',
      'selectedTransactions',
      'accountId',
      'transactions',
      'editedTransactionIndex',
      'isCreatingNewTransaction',
      'importOfxIsOpen'
    ]),
    transactionDate: {
      get() {
        return this.editedTransaction.date
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_DATE(value)
      }
    },
    borderRight() {
      const item = this.transactions[this.editedTransactionIndex]
      if (!item || !this.editedTransaction) {
        return {}
      }
      const borderStyle = 'border-right-color: var(--v-warning-base)'
      const result = Object.keys(item).reduce((partial, key) => {
        const itemValue = item[key]
        const editedValue = this.editedTransaction[key]
        if (itemValue !== editedValue) {
          partial[key] = borderStyle
        } else {
          partial[key] = ''
        }
        return partial
      }, {})
      if (result.category !== '') {
        return result
      }
      if (typeof item.category !== typeof this.editedTransaction.category) {
        result.category = borderStyle
      } else if (Array.isArray(item.splits) && Array.isArray(this.editedTransaction.splits)) {
        if (item.splits.length !== this.editedTransaction.splits.length) {
          result.category = borderStyle
        } else {
          for (let i = 0; i < item.splits.length; i++) {
            for (let [key, value] of Object.entries(item.splits[i])) {
              if (value !== this.editedTransaction.splits[i][key]) {
                result.category = borderStyle
                break
              }
            }
          }
        }
      } else if (item.category !== this.editedTransaction.category) {
        result.category = borderStyle
      }
      return result
    },
    title() {
      if (this.isCreatingNewTransaction) {
        return 'New Transaction'
      } else {
        return 'Edit Transaction'
      }
    },
    titleColor() {
      if (this.isCreatingNewTransaction) {
        return 'success'
      } else {
        return 'primary'
      }
    }
  },
  methods: {
    ...mapMutations('accountTransactions', [
      'SET_EDITED_TRANSACTION_MEMO',
      'SET_EDITED_TRANSACTION_NOTE',
      'SET_EDITED_TRANSACTION_DATE',
      'SET_EDITED_TRANSACTION_CATEGORY',
      'CLEAR_EDITED_TRANSACTION',
      'CLEAR_SELECTED_TRANSACTIONS',
      'SET_IMPORT_OFX_IS_OPEN'
    ]),
    ...mapActions('accountTransactions', [
      'addTransaction',
      'deleteSelectedTransactions',
      'getTransactions',
      'setClearedSelectedTransactions',
      'categorizeSelectedTransactions',
      'save',
      'cancel'
    ]),
    onSave() {
      const item = this.transactions[this.editedTransactionIndex]
      this.save(item)
    },
    onCancel() {
      this.cancel()
    },
    onClearSelected() {
      this.setClearedSelectedTransactions({ cleared_value: true })
    },
    onUnclearSelected() {
      this.setClearedSelectedTransactions({ cleared_value: false })
    },
    onCategorySelected(categoryId) {
      this.categorizeSelectedTransactions({ categoryId })
      this.categoryMenu = false
    },
    onImportModalClose() {
      this.importModalIsVisible = false
    },
    onImportModalApply() {
      this.importModalIsVisible = false
      this.getTransactions()
    },
    onCloseImportOfx() {
      this.SET_IMPORT_OFX_IS_OPEN(false)
    },
    onApplyImportOfx() {
      this.SET_IMPORT_OFX_IS_OPEN(false)
      // this.getTransactions()
    },
    onOpenImportOfx() {
      this.SET_IMPORT_OFX_IS_OPEN(true)
    },
    onDeselectAll() {
      this.CLEAR_SELECTED_TRANSACTIONS()
    }
  }
}
</script>

<style>
div.transaction-details-grid {
  display: grid;
  grid-template-columns: 70px auto;
  grid-gap: 0px 10px;
}

.v-application div.transaction-details-grid > div {
  line-height: 1.9rem;
}

.transaction-details-grid > :nth-child(2n-1) {
  text-align: right;
  border-right: 1px solid var(--v-secondary-darken1);
  padding-right: 5px;
  padding-top: 3px;
}

.transaction-details-grid > * {
  padding-bottom: 10px;
}

.save-cancel-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 0px;
}
</style>
