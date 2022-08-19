import BudgetGrid from '@/components/BudgetView/BudgetGrid.vue'
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import mock_budget from '@/../tests/__mockdata__/mock_budget_2.json'
import { getCarryover } from '@/store/modules/category-module'
import _ from 'lodash'
import Vue from 'vue'
import { NONE } from '@/constants'

global._ = _
Vue.use(Vuetify)
Vue.config.productionTip = false

const localVue = createLocalVue()

const month = '2020-12'
const $route = {
  path: '/budget',
  params: {
    month: month
  }
}

// Load mock budget file and parse into vuex state
// Created by calling backup on test database and copying over from the console log
const data = mock_budget.rows.map((row) => row.doc)

describe('CRUD elements', () => {
  let vuetify
  let wrapper
  let getters
  let store

  beforeEach(() => {
    vuetify = new Vuetify()
    localVue.use(vuetify)
    localVue.use(Vuex)

    getters = {
      selectedBudgetId: () => 'rkW',
      categoriesById: () => mock_budget.getters.categoriesById,
      masterCategories: () =>
        data
          .filter((row) => row._id.includes('_masterCategory_'))
          .sort((a, b) => a.sort - b.sort)
          .concat([NONE]),
      masterCategoriesById: () => mock_budget.getters.masterCategoriesById,
      allCategoryBalances: () => mock_budget.getters.allCategoryBalances,
      selectedMonth: () => month,
      monthsInUse: () => mock_budget.getters.monthsInUse,
      categoriesByMaster: () => mock_budget.getters.categoriesByMaster,
      categories: () =>
        data
          .filter((row) => row._id.includes('_category_'))
          .filter((row) => !row._id.includes('_monthCategory_'))
          .concat([NONE])
    }

    store = new Vuex.Store({
      getters,
      getCarryover
    })

    store.state.month_selected = month
    wrapper = mount(BudgetGrid, {
      store,
      localVue,
      vuetify,
      mocks: {
        $route
      },
      stubs: {
        ImportModalComponent: true
      }
    })
  })

  it('newMasterCategory button exists', () => {
    expect(wrapper.find('#btn-new-master-category-1of').exists()).toBeTruthy()
  })

  it('deleteMasterCategory button exists', () => {
    expect(wrapper.find('#btn-delete-master-category-1of').exists()).toBeTruthy()
  })

  it('newCategory button exists', () => {
    expect(wrapper.find('#btn-new-category-1of').exists()).toBeTruthy()
  })

  it('hideCategory button exists', () => {
    expect(wrapper.find('#btn-hide-category-K31').exists()).toBeTruthy()
  })

  it('draggable masterCategory exists', () => {
    expect(wrapper.find('#drag-master-category-1of').exists()).toBeTruthy()
  })

  it('draggable category exists', () => {
    expect(wrapper.find('#drag-category-K31').exists()).toBeTruthy()
  })

  it('clicking addMasterCategory button calls newMasterCategory function', () => {
    const spyNewMasterCategory = jest.spyOn(wrapper.vm, 'newMasterCategory')
    wrapper.find('#btn-new-master-category-1of').trigger('click')
    expect(spyNewMasterCategory).toBeCalledWith(3)
  })

  it('clicking deleteMasterCategory button calls deleteMasterCategory function', () => {
    const spyDeleteMasterCategory = jest.spyOn(wrapper.vm, 'deleteMasterCategory')
    wrapper.find('#btn-delete-master-category-1of').trigger('click')
    expect(spyDeleteMasterCategory).toBeCalledWith({ id: '1of', name: 'Monthly Bills' })
  })

  it('clicking addCategory button calls newCategory function', () => {
    const spyNewCategory = jest.spyOn(wrapper.vm, 'newCategory')
    wrapper.find('#btn-new-category-1of').trigger('click')
    expect(spyNewCategory).toBeCalledWith({ id: '1of', name: 'Monthly Bills' })
  })

  it('clicking hideCategory button calls onHideCategory function', () => {
    const spyHideCategory = jest.spyOn(wrapper.vm, 'onHideCategory')
    wrapper.find('#btn-hide-category-K31').trigger('click')
    expect(spyHideCategory).toBeCalledWith('K31')
  })

  it('newMasterCategory function dispatches vuex action', () => {
    wrapper.vm.$store.dispatch = jest.fn()
    wrapper.vm.newMasterCategory(2)
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('createMasterCategory', { name: '', is_income: false, sort: 2 })
  })

  it('deleteMasterCategory function dispatches vuex action', () => {
    wrapper.vm.$store.dispatch = jest.fn()
    wrapper.vm.deleteMasterCategory({ id: '1of', name: 'Monthly Bills' })
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('deleteMasterCategory', '1of')
  })

  it('newCategory function dispatches vuex action', () => {
    wrapper.vm.$store.dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    wrapper.vm.newCategory({ id: '1of', name: 'Monthly Bills' })
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('createCategory', { name: '', master_id: '1of' })
  })

  it('onHideCategory function dispatches vuex action', () => {
    wrapper.vm.$store.dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    wrapper.vm.onHideCategory('K31')
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('commitDocToPouchAndVuex', {
      current: {
        name: 'Groceries',
        sort: 1,
        hidden: false,
        masterCategory: '~~~',
        _id: 'b_rkW_category_K31',
        _rev: '1-ad8e4a89a4d1d550377b070ec923c81c'
      },
      previous: {
        name: 'Groceries',
        sort: 1,
        hidden: false,
        masterCategory: 'MpQ',
        _id: 'b_rkW_category_K31',
        _rev: '1-ad8e4a89a4d1d550377b070ec923c81c'
      }
    })
  })
})

describe('budgetgrid component', () => {
  let vuetify
  let wrapper
  let getters
  let store

  beforeEach(() => {
    vuetify = new Vuetify()
    localVue.use(vuetify)
    localVue.use(Vuex)

    getters = {
      selectedBudgetId: () => 'rkW',
      categoriesById: () => mock_budget.getters.categoriesById,
      masterCategories: () =>
        data
          .filter((row) => row._id.includes('_masterCategory_'))
          .sort((a, b) => a.sort - b.sort)
          .concat([NONE]),
      masterCategoriesById: () => mock_budget.getters.masterCategoriesById,
      allCategoryBalances: () => mock_budget.getters.allCategoryBalances,
      selectedMonth: () => month,
      monthsInUse: () => mock_budget.getters.monthsInUse,
      categoriesByMaster: () => mock_budget.getters.categoriesByMaster,
      categories: () =>
        data
          .filter((row) => row._id.includes('_category_'))
          .filter((row) => !row._id.includes('_monthCategory_'))
          .concat([NONE])
    }
    store = new Vuex.Store({
      getters,
      getCarryover
    })
    // store.state.month_selected = "2020-12";
    wrapper = mount(BudgetGrid, {
      store,
      localVue,
      vuetify,
      mocks: {
        $route
      },
      stubs: {
        ImportModalComponent: true
      }
    })
  })

  it('budget grid renders correct snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders correct number of category rows', () => {
    expect(wrapper.findAll('.category-row')).toHaveLength(wrapper.vm.$store.getters.categories.length)
  })

  it('renders correct number of master category rows', () => {
    expect(wrapper.findAll('.master-category-row')).toHaveLength(7)
    expect(wrapper.findAll('.master-category-row')).toHaveLength(wrapper.vm.$store.getters.masterCategories.length)
  })

  it('renders available-to-budget-amount', () => {
    expect(wrapper.find('#available-to-budget-amount').exists()).toBeTruthy()
    // expect(wrapper.find("#available-to-budget-amount").text()).toEqual("36978.38");
  })

  it('renders budget-input for each category', () => {
    expect(wrapper.findAll('.category-budget-input')).toHaveLength(wrapper.vm.$store.getters.categories.length)
  })

  it('calls onCategoryNameChange correctly when new name is input', async () => {
    const spyCategoryNameChanged = jest.spyOn(wrapper.vm, 'onCategoryNameChange')
    const name_input = wrapper.find('#category-name-input-x2A')
    expect(name_input.exists()).toBeTruthy()
    expect(name_input.element.readOnly).toEqual(true)

    await name_input.trigger('click')
    expect(name_input.element.readOnly).toEqual(false)

    name_input.setValue('Candy')
    name_input.trigger('blur')
    await wrapper.vm.$nextTick()
    expect(spyCategoryNameChanged).toBeCalled()
    expect(spyCategoryNameChanged).toBeCalledWith('Candy')
  })

  it('calls onCategoryBudgetChanged correctly when new value is input', async () => {
    const spyCategoryBudgetChanged = jest.spyOn(wrapper.vm, 'onCategoryBudgetChanged')
    const budget_input = wrapper.find('#category-budget-input-x2A')
    expect(budget_input.exists()).toBeTruthy()

    await budget_input.trigger('click')
    expect(budget_input.element.readOnly).toEqual(false)

    budget_input.setValue(500)
    budget_input.trigger('blur')
    await wrapper.vm.$nextTick()
    expect(spyCategoryBudgetChanged).toBeCalled()
  })

  it('onMasterCategoryNameChange function dispatches vuex action', async () => {
    wrapper.vm.$store.dispatch = jest.fn().mockImplementation(() => Promise.resolve())

    await wrapper.setData({ editedMasterCategoryId: '1of' })
    wrapper.vm.onMasterCategoryNameChange('New Name')
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('commitDocToPouchAndVuex', {
      current: {
        name: 'New Name',
        sort: 2,
        collapsed: false,
        isIncome: false,
        _id: 'b_rkW_masterCategory_1of',
        _rev: '1-781cb3f10d5d327198ab0650d5be1b64'
      },
      previous: {
        name: 'Monthly Bills',
        sort: 2,
        collapsed: false,
        isIncome: false,
        _id: 'b_rkW_masterCategory_1of',
        _rev: '1-781cb3f10d5d327198ab0650d5be1b64'
      }
    })
  })

  it('onCategoryNameChange function dispatches vuex action', async () => {
    wrapper.vm.$store.dispatch = jest.fn().mockImplementation(() => Promise.resolve())

    await wrapper.setData({ editedCategoryNameId: 'K31' })
    wrapper.vm.onCategoryNameChange('New Name')
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('commitDocToPouchAndVuex', {
      current: {
        name: 'New Name',
        sort: 1,
        hidden: false,
        masterCategory: 'MpQ',
        _id: 'b_rkW_category_K31',
        _rev: '1-ad8e4a89a4d1d550377b070ec923c81c'
      },
      previous: {
        name: 'Groceries',
        sort: 1,
        hidden: false,
        masterCategory: 'MpQ',
        _id: 'b_rkW_category_K31',
        _rev: '1-ad8e4a89a4d1d550377b070ec923c81c'
      }
    })
  })

  it('onCategoryBudgetChange function dispatches vuex action', async () => {
    wrapper.vm.$store.dispatch = jest.fn().mockImplementation(() => Promise.resolve())

    // await wrapper.setData({ selectedBudgetId: 'K31'})
    wrapper.vm.onCategoryBudgetChanged('K31', '34.78')
    expect(wrapper.vm.$store.dispatch).toBeCalledWith('updateMonthCategory', {
      current: {
        budget: 3478,
        overspending: null,
        note: 'H0QhU[?EE}ZA`)T%z[Mf{ 4XS|T3xmu/,q4r55m83AnQ ',
        _id: 'b_rkW_monthCategory_2020-12_K31',
        _rev: '1-20854132ded405ea7bf30e1b7f3571f8'
      },
      previous: {
        budget: 18529,
        overspending: null,
        note: 'H0QhU[?EE}ZA`)T%z[Mf{ 4XS|T3xmu/,q4r55m83AnQ ',
        _id: 'b_rkW_monthCategory_2020-12_K31',
        _rev: '1-20854132ded405ea7bf30e1b7f3571f8'
      }
    })
  })
})
