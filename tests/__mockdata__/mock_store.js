

import budget from "@/store/modules/budget-module";
import pouchdb from "@/store/modules/pouchdb-module";

import { cloneDeep } from 'lodash'


const mock_store = {
  state: {

  },
  modules: {
    budget: cloneDeep(budget),
    pouchdb: cloneDeep(pouchdb),
  },
  getters: {
    // accounts: state => state.accounts,
    // transactions: state => state.transactions,
    // monthlyCategoryData: state => state.monthlyCategoryData,
    // masterCategories: state => state.masterCategories,
    // categories: state => state.categories,
    // month_selected: state => state.month_selected,
    // accountBalances: () => {
    //   return accountBalances;
    // },
    // transactions_by_account: () => {
    //   return transactions_by_account;
    // },
    // month_category_lookup: () => {
    //   return month_category_lookup;
    // },
    // categoriesByMaster: () => {
    //   return categoriesByMaster;
    // },
    // selectedBudgetId: state => state.selectedBudgetId,
  }
};

export { mock_store };
