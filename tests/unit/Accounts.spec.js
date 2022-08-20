import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Accounts from "@/components/AccountView/Accounts.vue";
import Vuetify from "vuetify";
import mock_budget from "@/../tests/__mockdata__/mock_budget_2.json";
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

const data = mock_budget.rows.map(row => row.doc);

describe("accounts table", () => {
  let vuetify;
  let wrapper;
  let getters;
  let store;

  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify);
    localVue.use(Vuex)

    getters = {
      selectedBudgetId: () => 'rkW',
      accounts: () => data.filter(row => row._id.includes("_account_")),
    }

    store = new Vuex.Store({
      getters
    })

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

  it("clicking Add Account button shows modal", async () => {
    // Open modal
    await wrapper.find("#addAccountBtn").trigger("click");

    // Verify modal is open
    expect(wrapper.find(".v-dialog .title").text()).toEqual("Add Account");
  });

  it("create new account", async () => {
    // Open modal
    await wrapper.find("#addAccountBtn").trigger("click");

    // //Mocks & setup
    wrapper.vm.$store.dispatch = vi.fn();
    wrapper.vm.generateShortId = vi.fn()
    wrapper.vm.generateShortId.mockReturnValue('a3-')

    await wrapper.find("#nameField").setValue("nameofnewAccount");
    await wrapper.find("#typeField").setValue("CHECKING");
    await wrapper.find("#noteField").setValue("test note");

    await wrapper.find("#saveAccountBtn").trigger("click");

    expect(wrapper.vm.$store.dispatch).toBeCalled()
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('commitDocToPouchAndVuex', {
      current: {
        _id: 'b_rkW_account_a3-',
        type: 'CHECKING',
        checkNumber: true,
        closed: false,
        name: 'nameofnewAccount',
        note: 'test note',
        sort: 0,
        onBudget: true,
        sign: 1,
        initialBalance: 0
      },
      previous: null
    })
  });
});
