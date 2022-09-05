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
    <v-menu bottom offset-x close-on-content-click close-on-click>
      <template #activator="{ on, attrs }">
        <!-- <v-list-item v-bind="attrs" left v-on="on">Categorize as:</v-list-item> -->
        <v-btn data-testid="categorize-as-button" v-bind="attrs" v-on="on">Categorize as:</v-btn>
      </template>
      <v-list data-testid="categorize-multiple-as-list">
        <v-list-item
          v-for="category in categoriesForDropdown"
          :key="category._id"
          dense
          @click="categorizeSelectedTransactions(category)"
        >
          <v-list-item-title> {{ category.name }} </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn @click.stop="importModalIsVisible = true">
      <v-icon left>mdi-cloud-upload</v-icon>
      <span>Import</span>
    </v-btn>
    <import-transactions
      :visible="importModalIsVisible"
      :account="this.$route.params.account_id"
      @close="onImportModalClose"
    />
  </div>
</template>

<script>
import ImportTransactions from "./ImportTransactions.vue";

export default {
  components: {
    ImportTransactions,
  },
  methods: {
    addTransaction() {
      if (this.creatingNewTransactions) {
        return;
      }
      this.creatingNewTransactions = true;
      this.editedItem = {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format("YYYY-MM-DD"),
        _id: `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId()}`,
      };
      this.editedItemInitialDate = this.editedItem.date;
      this.transactions.push(this.editedItem);
      this.transactions.sort((a, b) => this.compareAscii(b._id, a._id));
      this.editedIndex = this.transactions.indexOf(this.editedItem);
      this.expanded.push(this.editedItem);
    },
  }
};
</script>
