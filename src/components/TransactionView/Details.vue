<template>
  <v-sheet width="100%" height="100%" color="background lighten-1">
    <div v-if="editedTransaction._id !== DEFAULT_TRANSACTION._id">
      <div class="transaction-details-grid">
        <div class="text-h5">Date</div>
        <details-date data-testid="edit-row-date" v-model="transactionDate" />
        <div class="text-h5">Amount</div>
        <details-value />
        <div class="text-h5">Status</div>
        <details-status />
        <div class="text-h5">Category</div>
        <details-category />
        <div class="text-h5">Memo</div>
        <details-memo />
        <div class="text-h5">Note</div>
        <details-note />
      </div>
      <div class="save-cancel-container">
        <v-btn text small @click="onCancel">
          Cancel
        </v-btn>
        <v-btn small elevation="0" color="primary darken-1" @click="onSave">
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
    <details-buttons
      v-else
      icon="mdi-file-document-outline"
      subtitle="No transactions selected"
    >
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
  </v-sheet>
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
  props: {
    item: {
      type: Object,
      required: false,
      default: null,
    },
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
    ]),
    transactionDate: {
      get() {
        return this.editedTransaction.date;
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_DATE(value);
      },
    },
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
      this.save(this.item);
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
  padding-bottom: 5px;
}

.save-cancel-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
