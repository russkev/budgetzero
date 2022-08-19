import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Accounts from "@/components/AccountView/Accounts.vue";
import Vuetify from "vuetify";
import mock_budget from "@/../tests/__mockdata__/mock_budget_2.json";
import store from "@/store";
import Vue from "vue";
import { generateShortId } from '@/store/modules/id-module'

Vue.use(Vuetify);

const localVue = createLocalVue();
localVue.use(Vuex);

const $route = {
  path: '/fake/path',
  params: {
    account_id: '6JK'
  }
}

// const $uuid = {
//   v4() {
//     return '6YK'
//   }
// }
// function generateShortId() {
//   return "zzz"
// }



const data = mock_budget.rows.map(row => row.doc);
let numberOfAccounts = null;

describe("accounts table", () => {
  let vuetify;
  let wrapper;

  beforeAll(() => {
    // state.monthCategoryBudgets = data.filter(row => row._id.includes("_monthCategory_"));
    // state.payees = data.filter(row => row._id.includes("_payee_"));

    store.state.pouchdb.accounts = data.filter(row => row._id.includes("_account_"));
    store.state.pouchdb.transactions = data.filter(row => row._id.includes("_transaction_"));
    store.state.pouchdb.masterCategories = data.filter(row =>
      row._id.includes("_masterCategory_")
    );
    store.state.pouchdb.categories = data
      .filter(row => row._id.includes("_category_"))
      .filter(row => !row._id.includes("_monthCategory_"));
    store.state.pouchdb.month_selected = "2020-12";
    store.state.selectedBudgetId = 'jxN'
    numberOfAccounts = store.state.pouchdb.accounts.length
  });

  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify);

    store.state.month_selected = "2020-12";
    wrapper = mount(Accounts, {
      store,
      localVue,
      vuetify,
      generateShortId,
      mocks: {
        $route,
      },
      stubs: {
        ImportModalComponent: true
      }
    })
  });

  it("account renders correct snapshot", () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("account table exists", () => {
    expect(wrapper.find("#accountsTable").exists()).toBeTruthy();
  });

  //   it("accounts vuex getter is correct length", () => {
  //     expect(wrapper.vm.accounts.length).toBe(numberOfAccounts)
  //   });

  it("clicking Add Account button shows modal", async () => {
    // Open modal
    await wrapper.find("#addAccountBtn").trigger("click");

    // Verify modal is open
    expect(wrapper.find(".v-dialog .title").text()).toEqual("Add Account");
  });

  it("create new account", async () => {
    // Open modal
    await wrapper.find("#addAccountBtn").trigger("click");

    //Mocks & setup
    wrapper.vm.$store.dispatch = jest.fn();
    jest.spyOn(wrapper.vm, 'generateShortId').mockReturnValue('a3-');

    await wrapper.find("#nameField").setValue("nameofnewAccount");
    await wrapper.find("#typeField").setValue("CHECKING");
    await wrapper.find("#noteField").setValue("test note");

    await wrapper.find("#saveAccountBtn").trigger("click");

    expect(wrapper.vm.$store.dispatch).toBeCalled()
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('commitDocToPouchAndVuex', {
      current: {
        _id: 'b_jxN_account_a3-',
        type: 'CHECKING',
        checkNumber: true,
        closed: false,
        name: 'nameofnewAccount',
        note: 'test note',
        sort: 0,
        onBudget: true,
        sign: 1,
        initialBalance: 0,
      },
      previous: null
    })
  });
});
