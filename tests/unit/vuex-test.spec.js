import Vue from "vue";
import Vuex from "vuex";
import PouchDB from "pouchdb";

import { createLocalVue } from "@vue/test-utils";
import store from "@/store/index.js";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("vuex budget module", () => {

  beforeAll(() => {
    
    const pouch = new PouchDB("budgetzero_local_db");
    Vue.prototype.$pouch = pouch;

    const data = mock_budget.rows.map(row => row.doc);
    store.state.monthCategoryBudgets = data.filter(row => row._id.includes("_monthCategory_"));
    store.state.payees = data.filter(row => row._id.includes("_payee_"));
    store.state.pouchdb.accounts = data.filter(row => row._id.includes("_account_"));
    store.state.pouchdb.transactions = data.filter(row => row._id.includes("_transaction_"));
    store.state.pouchdb.masterCategories = data.filter(row =>
      row._id.includes("_master-category_")
    );
    store.state.pouchdb.categories = data
      .filter(row => row._id.includes("_category_"))
      .filter(row => !row._id.includes("monthCategory"));
    store.state.pouchdb.budgetRoots = data.filter(row => row._id.includes("budget_"));
    
  });

  it("deleteEntireBudget", async () => {
    await store.dispatch('deleteEntireBudget', store.state.pouchdb.budgetRoots[0])
    expect(store.getters.transactions.length).toBe(563)
  
  });
  
});
