<template>
  <div>
    <TransactionHeader :selected_account_id="accountOptions.account_id" />
    <v-container>
      <v-sheet max-width="800px" justify="center">
        <v-data-table
          class="background darken-1"
          id="transactions-table"
          data-testid="transactions-table"
          v-model="selected"
          :headers="dataTableHeaders"
          :items="transactions"
          group-by="date"
          item-key="_id"
          show-select
          single-expand
          dense
          :expanded.sync="expanded"
          :options.sync="accountOptions"
          :server-items-length="numTransactionsTotal"
          :items-per-page="itemsPerPage"
          :footer-props="{
            'items-per-page-options': [2, 10, 20, 50, 100, 200],
            'update.options': accountOptions,
          }"
          refs="items"
        >
          <template #group.header="{items}">
            <!-- <td colspan="3"> -->
            <td colspan="20" class="date-row">
              {{ items[0].date }}
            </td>
            <!-- </tr> -->
          </template>
          <template #item="{ item, expand, select, isSelected }">
            <tr id="transaction-edit-row" v-if="item._id === editedItem._id" :key="item._id">
              <!-- Checkbox -->
              <td id="edit-row-checkbox" class="expanded-checkbox">
                <toggle-checked
                  :is-selected="isSelected"
                  :expanded="expanded"
                  @input="select($event)"
                />
              </td>

              <!-- Cleared input -->
              <td data-testid="edit-row-cleared" class="pa-0">
                <toggle-cleared 
                  @click="toggleCleared(item)"
                  :is-cleared="editedItem.cleared"
                />
              </td>

              <!-- Category input -->
              <td data-testid="edit-row-category">
                <select-category 
                  :category-id="item.category" 
                  @update="onEditedItemCategoryUpdate"
                  @save="save(item)"
                />
              </td>

              <!-- Outflow -->
              <td data-testid="edit-row-outflow">
                <select-amount-transaction 
                  is-outflow
                  :item="item"
                  :editedItem="editedItem"
                  @update="onEditedItemValueUpdate"
                  @save="save(item)"
                />
              </td>

              <!-- Inflow -->
              <td data-testid="edit-row-inflow">
                <select-amount-transaction
                  :item="item"
                  :editedItem="editedItem"
                  @update="onEditedItemValueUpdate"
                  @save="save(item)"
                />
              </td>

              <!-- Balance -->
              <td id="edit-row-balance" align="right">
              </td>
            </tr>

          <!-- DISPLAY -->

            <tr class="transaction-row" data-testid="transaction-row" v-else>
              <!-- Checkbox -->
              <td class="row-checkbox">
                <toggle-checked
                  :is-selected="isSelected"
                  :expanded="expanded"
                  @input="select($event)"
                />
              </td>

              <!-- Cleared -->
              <td class="row-cleared pa-0">
                <toggle-cleared 
                  @click="toggleCleared(item)"
                  :is-cleared="item.cleared"
                />
              </td>

              <td
                class="row-details"
                @click="
                  editItem(item);
                  expand(item);
                "
              >
                <div class="text-truncate">
                  <span class="row-category  font-weight-medium">{{ item.category_name }}</span>
                  <br />
                  <span class="row-memo text-caption transaction-details">
                    {{ item.note ? item.note : item.memo }}
                  </span>
                </div>
              </td>

              <!-- Outflow -->
              <td
                class="row-outflow"
                align="right"
                @click="
                  editItem(item);
                  expand(item);
                "
              >
                {{ item.value > 0 ? "" : intlCurrency.format(-item.value / 100) }}
              </td>

              <!-- Inflow -->
              <td
                class="row-inflow"
                align="right"
                @click="
                  editItem(item);
                  expand(item);
                "
              >
                {{ item.value > 0 ? intlCurrency.format(item.value / 100) : "" }}
              </td>

              <!-- Balance -->
              <td class="row-balance" align="right">
                {{ intlCurrency.format(item.balance / 100) }}
              </td>
            </tr>
          </template>

          <template #expanded-item="{ item }">
            <tr class="expanded-row">
              <td :colspan="dataTableHeaders.length">
                <!-- <v-container> -->
                <div class="expanded-details">
                  <span>Date</span>
                  <select-date data-testid="edit-row-date" v-model="editedItem.date" />
                  <span>Details</span>
                  <v-textarea
                    data-testid="edit-row-memo"
                    class="ma-0"
                    v-model="editedItem.memo"
                    rows="1"
                    dense
                    filled
                    hide-details
                  />
                  <span>Notes</span>
                  <v-textarea
                    data-testid="edit-row-note"
                    class="ma-0"
                    v-model="editedItem.note"
                    rows="1"
                    dense
                    filled
                    hide-details
                  />
                </div>

                <v-btn data-testid="cancel-edit-button" small @click="cancel()"> Cancel </v-btn>
                <v-btn data-testid="save-edit-button" color="primary" small @click="save(item)">
                  Save
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-sheet>
    </v-container>


    <!-- @close="importModalIsVisible = false" -->
  </div>
</template>

<script>
import { DEFAULT_TRANSACTION, ID_LENGTH, ID_NAME, NONE } from "../../constants";
import { compareAscii } from "@/store/modules/id-module.js";
import Vue from "vue";
import { mapGetters } from "vuex";
import moment from "moment";
import _ from "lodash";
import ImportTransactions from "./ImportTransactions.vue";
import ToggleChecked from "./ToggleChecked.vue";
import ToggleCleared from "./ToggleCleared.vue";
import SelectDate from "./SelectDate.vue";
import SelectCategory from "./SelectCategory.vue";
import SelectAmountTransaction from "./SelectAmountTransaction.vue";
// import Banking from 'banking'
// import ofx from 'node-ofx-parser'

export default {
  components: {
    ImportTransactions,
    ToggleChecked,
    ToggleCleared,
    SelectDate,
    SelectCategory,
    SelectAmountTransaction,
  },
  props: {
    item: {
      type: Object
    },
  },
  data() {
    return {
      selected: [],
      expanded: [],
      intlCurrency: new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }),
      numServerTransactions: 0,
      accountOptions: {
        account_id: this.$route.params.account_id,
      },
      itemsPerPage: this.savedItemsPerPage(),
      transactions: [],
      editedIndex: -1,

      creatingNewTransactions: false,
      editedItem: {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format("YYYY-MM-DD"),
      },
      editedItemInitialDate: moment(new Date()).format("YYYY-MM-DD"),
      outflowDisplayValue: "",
      inflowDisplayValue: "",
      importModalIsVisible: false,
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.accountOptions.account_id = to.params.account_id;
    next();
  },
  watch: {
    accountOptions: {
      handler(current, prev) {
        if (current.itemsPerPage !== prev.itemsPerPage) {
          localStorage.setItem("transactionsPerPage", current.itemsPerPage);
        }
        this.getTransactions();
      },
      deep: true,
    },
    expanded: {
      handler() {
        this.selected = [];
      },
    },
  },
  computed: {
    // Re-configure categoriesByMaster to be in correct format for treeselect
    ...mapGetters([
      "dataTableHeaders",
      "selectedBudgetId",
      "categoriesById",
      "categoriesByMaster",
      "accountsById",
    ]),
    account() {
      return this.accountsById[this.$route.params.account_id];
    },

    selectedAccount() {},
    categoryOptions() {
      const key_values = Object.entries(this.$store.getters.categoriesByMaster);
      return key_values.map(([master_category_id, categories]) => {
        const category_label = this.$store.getters.masterCategoriesById[master_category_id].name;
        const result = {
          id: master_category_id,
          label: category_label,
        };
        if (master_category_id !== NONE._id) {
          result["children"] = categories.map((category) => {
            return {
              id: category._id.slice(-ID_LENGTH.category),
              label: category.name,
            };
          });
        }
        return result;
      });
    },
    categoriesForDropdown() {
      return Object.values(this.categoriesByMaster).flat();
    },
    numTransactionsTotal() {
      return this.creatingNewTransactions
        ? this.numServerTransactions + 1
        : this.numServerTransactions;
    },
  },
  methods: {
    onEditedItemValueUpdate(value) {
      Vue.set(this.editedItem, "value", value)
    },
    onEditedItemCategoryUpdate(category_id) {
      Vue.set(this.editedItem, "category", category_id)
    },
    getTransactions() {
      this.$store
        .dispatch("fetchTransactionsForAccount", this.accountOptions)
        .then((result) => {
          this.numServerTransactions = result.total_rows;
          this.transactions = result.rows.map((row) => {
            const doc = row.doc;
            const category_name = _.get(this.categoriesById, [doc.category, "name"], "");
            return {
              ...doc,
              value: doc.value * this.account.sign,
              ["category_name"]: category_name,
              balance: doc.balance * this.account.sign,
            };
          });
        })
        .catch((error) => {
          console.warn("Row from fetchTransactionsForAccount doesn't contain 'doc' object");
          console.log(error);
        });
    },
    editItem(item) {
      this.creatingNewTransactions = false;
      this.resetEditedItem();
      this.editedIndex = this.transactions.indexOf(item);
      this.editedItem = { ...this.transactions[this.editedIndex] };
    },

    toggleCleared(item) {
      if (this.editedIndex === this.transactions.indexOf(item)) {
        this.editedItem.cleared = !this.editedItem.cleared;
        return;
      }

      this.editedItem = { ...item, cleared: !item.cleared };
      this.prepareEditedItem();
      const payload = { current: this.editedItem, previous: item };
      this.$store.dispatch("createOrUpdateTransaction", payload).then(() => this.getTransactions());
      this.resetEditedItem();
    },
    clearSelectedTransactions() {
      this.updateClearedSelectedTransactions(true);
    },
    unclearSelectedTransactions() {
      this.updateClearedSelectedTransactions(false);
    },
    updateClearedSelectedTransactions(is_cleared) {
      if (this.selected.length < 1) {
        return;
      }
      const documents = this.selected.map((doc) => {
        return {
          current: {
            ...doc,
            cleared: is_cleared,
          },
          previous: doc,
        };
      });
      this.$store.dispatch("commitBulkDocsToPouchAndVuex", documents).then(() => {
        this.getTransactions();
        // At the moment this is required because otherwise checkboxes remain checked but this.selected is stale
        this.selected = [];
      });
    },
    parseCurrencyValue(input_currency) {
      let value = "";
      if (input_currency !== undefined) {
        // Remove all non-digit chars except for period
        value = input_currency.toString().replace(/[^0-9.]/g, "");
      }
      return value;
    },
    resetEditedItem() {
      if (this.creatingNewTransactions && this.editedIndex > -1) {
        this.transactions.splice(this.editedIndex, 1);
      }
      this.creatingNewTransactions = false;
      this.editedIndex = -1;
      this.editedItem = {
        ...DEFAULT_TRANSACTION,
        account: this.$route.params.account_id,
        date: moment(new Date()).format("YYYY-MM-DD"),
      };
    },
    prepareEditedItem() {
      if (this.creatingNewTransactions && this.editedItemInitialDate !== this.editedItem.date) {
        this.editedItem["_id"] = `b_${this.selectedBudgetId}${ID_NAME.transaction}${this.generateId(
          this.editedItem.date
        )}`;
      }

      Vue.delete(this.editedItem, "category_name");

      if (this.editedItem.category === null) {
        this.editedItem.category = NONE._id;
      }
    },
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
    categorizeSelectedTransactions(category) {
      if (this.selected.length < 1) {
        return;
      }
      const documents = this.selected.map((doc) => {
        return {
          current: {
            ...doc,
            category: category._id.slice(-ID_LENGTH.category),
          },
          previous: doc,
        };
      });
      this.$store.dispatch("commitBulkDocsToPouchAndVuex", documents).then(() => {
        this.getTransactions();

        // At the moment this is required because otherwise checkboxes remain checked but this.selected is stale
        this.selected = [];
      });
    },
    deleteSelectedTransactions() {
      if (this.selected.length < 1) {
        return;
      }
      this.$store
        .dispatch("deleteBulkDocumentsFromPouchAndVuex", { documents: this.selected })
        .then(() => {
          let oldest_document = { date: "9999-99-99" };
          for (let document of this.selected) {
            if (compareAscii(document.date, oldest_document.date) < 0) {
              oldest_document = document;
            }
          }
          if (oldest_document.date !== "9999-99-99") {
            return this.$store.dispatch("updateRunningBalance", {
              transaction: oldest_document,
              isDeleted: true,
            });
          }
          return null;
        })
        .then(() => {
          this.getTransactions();
          this.selected = [];
        });
    },
    // deleteTransaction(item) {
    //   this.$store
    //     .dispatch("createOrUpdateTransaction", { current: null, previous: item })
    //     .then(() => {
    //       this.$store.dispatch("updateRunningBalance", { transaction: item, isDeleted: true });
    //     })
    //     .then(() => {
    //       return this.getTransactions();
    //     });
    //   // .then(() => {
    //   //   return this.$store.dispatch('updateBalances')
    //   // })
    //   this.cancel();
    // },
    onImportModalClose() {
      this.importModalIsVisible = false;
      this.getTransactions();
    },
    async save(item) {
      let previous = this.creatingNewTransactions ? null : item;
      this.prepareEditedItem();
      const transaction = JSON.parse(JSON.stringify(this.editedItem));
      this.$store
        .dispatch("createOrUpdateTransaction", {
          current: this.editedItem,
          previous: previous,
        })
        .then(() => {
          return this.$store.dispatch("updateRunningBalance", {
            transaction: transaction,
            isDeleted: false,
          });
        })
        .then(() => {
          return this.getTransactions();
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.cancel();
        });
    },
    cancel() {
      this.selected = [];
      this.expanded = [];
      this.resetEditedItem();
    },
    savedItemsPerPage() {
      const saved_items_per_page = localStorage.getItem("transactionsPerPage");
      if (saved_items_per_page) {
        return parseInt(saved_items_per_page);
      } else {
        return 50;
      }
    },
    submit() {
      console.log("SUBMIT");
    },
  },
};
</script>

<style>
div.vue-treeselect__control {
  width: inherit;
}
div.vue-treeselect__menu-container {
  width: 400px;
}

td.row-memo {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

div.expanded-label-column {
  min-width: 80px;
  flex-grow: initial;
}

tbody td {
  border-bottom: none !important;
}

div.expanded-details {
  display: grid;
  grid-template-columns: min-content auto;
}

.v-sheet {
  margin: 0 auto;
}

table {
  table-layout: fixed;
}

tr.v-row-group__header {
  background: inherit !important;
}
</style>
