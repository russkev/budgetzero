<template>
  <div>
    <v-btn data-testid="create-transaction-button" @click="addTransaction">
      Create
    </v-btn>
    <v-btn data-testid="delete-selected-transactions-button" @click="deleteSelectedTransactions">
      Delete selected
    </v-btn>
    <v-btn data-testid="clear-selected-button" @click="clearSelectedTransactions">
      Clear Selected
    </v-btn>
    <v-btn data-testid="unclear-selected-button" @click="unclearSelectedTransactions">
      Unclear Selected
    </v-btn>
    <v-btn @click="getTransactions">Get Transactions</v-btn>
    <v-menu bottom offset-x :close-on-content-click="false" :value="selectCategoryIsOpen">
      <template #activator="{ on, attrs }">
        <v-btn
          data-testid="categorize-as-button"
          v-bind="attrs"
          v-on="on"
          @click="selectCategoryIsOpen = true"
        >
          Categorize as:
        </v-btn>
      </template>
      <v-card>
        <v-container>
          <select-category
            id="select-category-selected-input"
            data-testid="multiple-transaction-category-input"
            category-id=":::"
            @update="onCategoryUpdate"
          />
          <v-btn data-testid="multiple-transaction-category-apply" @click="onCategoryApply">
            Apply
          </v-btn>
        </v-container>
      </v-card>
    </v-menu>
    <v-btn @click.stop="importModalIsVisible = true">
      <v-icon left>mdi-cloud-upload</v-icon>
      <span>Import</span>
    </v-btn>
    <import-transactions
      :visible="importModalIsVisible"
      :account="this.$route.params.account_id"
      @close="onImportModalClose"
      @apply="onImportModalApply"
    />
  </div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
import ImportTransactions from "./ImportTransactions.vue";

export default {
  components: {
    ImportTransactions,
  },
  data() {
    return {
      importModalIsVisible: false,
      selectedCategoryId: "",
      selectCategoryIsOpen: false,
    };
  },
  methods: {
    ...mapActions("accountTransactions", [
      "addTransaction",
      "deleteSelectedTransactions",
      "getTransactions",
      "setClearedSelectedTransactions",
      "categorizeSelectedTransactions",
    ]),
    clearSelectedTransactions() {
      this.setClearedSelectedTransactions({ cleared_value: true });
    },
    unclearSelectedTransactions() {
      this.setClearedSelectedTransactions({ cleared_value: false });
    },
    onCategoryUpdate(category_id) {
      this.selectedCategoryId = category_id;
      // console.log("On category update", category_id)
    },
    onImportModalClose() {
      this.importModalIsVisible = false;
    },
    onImportModalApply() {
      (this.importModalIsVisible = false), this.getTransactions();
    },
    onCategoryApply() {
      if (this.selectedCategoryId != "") {
        console.log("onCategoryApply", this.selectedCategoryId);
        this.categorizeSelectedTransactions({ categoryId: this.selectedCategoryId });
      }
      this.selectCategoryIsOpen = false;
    },
  },
};
</script>
