<template>
  <v-card width="100%" height="100%" flat color="background lighten-1" class="ma-0">
    <div v-if="editedTransaction._id !== DEFAULT_TRANSACTION._id">
      <v-card-title class="primary darken-3 pa-3">Edit Transaction</v-card-title>
      <div class="transaction-details-grid pa-2 pb-0">
        <div class="text-h5" :style="borderRight['date']">Date</div>
        <details-date data-testid="edit-row-date" v-model="transactionDate" />
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
      </div>
      <div class="save-cancel-container pa-2">
        <v-btn text small @click="onCancel">
          Cancel
        </v-btn>
        <v-btn small elevation="0" color="primary darken-3" class="ml-2" @click="onSave">
          Save
        </v-btn>
      </div>
    </div>
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
        <details-button
          data-testid="delete-selected-transactions-button"
          icon="mdi-delete"
          label="Delete"
          @click="deleteSelectedTransactions"
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
          icon="mdi-cloud-upload"
          label="Import"
          @click.stop="importModalIsVisible = true"
        />
        <import-transactions
          :visible="importModalIsVisible"
          :account="accountId"
          @close="onImportModalClose"
          @apply="onImportModalApply"
        />
      </template>
    </details-buttons>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { DEFAULT_TRANSACTION } from "../../constants";
import DetailsDate from "./DetailsDate.vue";
import DetailsValue from "./DetailsValue.vue";
import DetailsCategory from "./DetailsCategory.vue";
import DetailsMemo from "./DetailsMemo.vue";
import DetailsNote from "./DetailsNote.vue";
import DetailsFlowDirection from "./DetailsFlowDirection.vue";
import DetailsStatus from "./DetailsStatus.vue";
import DetailsButton from "./DetailsButton.vue";
import DetailsButtons from "./DetailsButtons.vue";

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
  },
  data() {
    return {
      DEFAULT_TRANSACTION,
      categoryMenu: false,
      importModalIsVisible: false,
    };
  },
  computed: {
    ...mapGetters("accountTransactions", [
      "editedTransaction",
      "selectedTransactions",
      "accountId",
      "transactions",
      "editedTransactionIndex"
    ]),
    transactionDate: {
      get() {
        return this.editedTransaction.date;
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_DATE(value);
      },
    },
    borderRight() {
      const item = this.transactions[this.editedTransactionIndex]
      if (!item || !this.editedTransaction) {
        return {};
      }
      const result = Object.keys(item).reduce((partial, key) => {
        const itemValue = item[key];
        const editedValue = this.editedTransaction[key];
        if (itemValue !== editedValue) {
          partial[key] = "border-right-color: var(--v-warning-base)" ;
        } else {
          partial[key] = "";
        }
        return partial
      }, {})
      console.log("BORDER RIGHHT", result['date'])
      if (item.splits !== this.editedTransaction.splits) {
        result['category'] = "border-right-color: var(--v-warning-base)";
      } 
      // return result
      return result
    }
  },
  methods: {
    ...mapMutations("accountTransactions", [
      "SET_EDITED_TRANSACTION_MEMO",
      "SET_EDITED_TRANSACTION_NOTE",
      "SET_EDITED_TRANSACTION_DATE",
      "SET_EDITED_TRANSACTION_CATEGORY",
      "CLEAR_EDITED_TRANSACTION",
    ]),
    ...mapActions("accountTransactions", [
      "addTransaction",
      "deleteSelectedTransactions",
      "getTransactions",
      "setClearedSelectedTransactions",
      "categorizeSelectedTransactions",
      "save",
      "cancel",
    ]),
    onSave() {
      const item = this.transactions[this.editedTransactionIndex]
      this.save(item);
    },
    onCancel() {
      this.cancel();
    },
    onClearSelected() {
      this.setClearedSelectedTransactions({ cleared_value: true });
    },
    onUnclearSelected() {
      this.setClearedSelectedTransactions({ cleared_value: false });
    },
    onCategorySelected(categoryId) {
      this.categorizeSelectedTransactions({ categoryId });
      this.categoryMenu = false;
    },
    onImportModalClose() {
      this.importModalIsVisible = false;
    },
    onImportModalApply() {
      this.importModalIsVisible = false;
      this.getTransactions();
    },
    // borderRight(attribute) {
    //   if (
    //     this.editedTransaction &&
    //     this.item &&
    //     this.editedTransaction[attribute] !== this.item[attribute]
    //   ) {
    //     return "border-right-color: var(--v-warning-base)";
    //   } else {
    //     return "";
    //   }
    // },
  },
};
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
  padding-bottom: 5px;
}

.save-cancel-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 0px;
}
</style>
