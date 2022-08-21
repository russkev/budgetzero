import BudgetGrid from '@/components/BudgetView/BudgetGrid.vue'
import Accounts from '@/components/AccountView/Accounts.vue'
import AccountAddModal from '@/components/AccountView/AccountAddModal.vue'
import BaseModalComponent from "@/components/Modals/BaseModalComponent.vue"
import App from '@/App.vue'
import {render, fireEvent} from '@testing-library/vue'
import { afterEach, expect, it, test } from 'vitest'
import { createStore } from 'vuex'
import { mount, createLocalVue, config } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from "vuex";
import Vuetify from 'vuetify'
import VueRouter from 'vue-router' 
// import store from '@/store'
import { storeData } from '@/store'
import PouchDB from 'pouchdb'
import mock_budget from '@/../tests/__mockdata__/mock_budget_3.json'
import _,  { result } from 'lodash'
import flushPromises from 'flush-promises'
global._ = _

Vue.use(Vuetify)
// const db = new PouchDB('mock_db')
// config.mocks["$pouch"] = db
// Vue.use(Vuex)

const localVue = createLocalVue()
// localVue.use(Vuex)
// localVue.use(VueRouter)


const renderWithVuetify = (component, options, callback) => {
  const root = document.createElement('div')
  root.setAttribute('data-app', 'true')
  const container = document.body.appendChild(root)
  const vuetify = new Vuetify()

  return render(
    component,
    {
      container: container,
      vuetify: vuetify,
      ...options,
    },
    callback
  )
}

const data = mock_budget.rows
  .map((row) => {
    delete row.doc._rev
    return row.doc
  })
  .filter((row) => {
    return row._id[0] == 'b'
  })

const $route = {
  path: '/budget',
  params: {
    month: '2022-07'
  }
}

let pouch


storeData.state.selectedBudgetId = 'N8Q'
storeData.modules.account.state.accounts = [
  {
    type: 'SAVING',
    checkNumber: true,
    closed: false,
    name: 'Savings',
    note: null,
    sort: 0,
    onBudget: true,
    sign: 1,
    initialBalance: 0,
    _id: 'b_N8Q_account_7kW',
    _rev: '1-f485b5ff2394bf94e38a176e19aab3e8'
  },
  {
    type: 'CREDIT',
    checkNumber: true,
    closed: false,
    name: 'Credit',
    note: null,
    sort: 0,
    onBudget: true,
    sign: -1,
    initialBalance: 0,
    _id: 'b_N8Q_account_ELC',
    _rev: '1-27b283bc08b3402b67060c13468fad7b'
  },
  {
    type: 'INVESTMENT',
    checkNumber: true,
    closed: false,
    name: 'Investment',
    note: null,
    sort: 0,
    onBudget: true,
    sign: 1,
    initialBalance: 0,
    _id: 'b_N8Q_account_v6A',
    _rev: '1-90fd70849ed88159e814a8234ca89d61'
  }
]

// console.log('STORE DATA2', storeData.budget.getters)
beforeEach(async () => {
  // console.log(storeData)
  // console.log('STORE DATA1', storeData.state.selectedBudgetId)
  // storeData.state.selectedBudgetId = 'rkW'
  // console.log('STORE DATA2', storeData.state.selectedBudgetId)
  pouch = new PouchDB('mock_db')
  // localVue.prototype.$pouch = pouch
  await pouch.bulkDocs(data)
})

afterEach(async () => {
  await pouch.destroy()
})

test('Mock database has documents', async () => {
  const get_result = await pouch.allDocs({ include_docs: true })
  // console.log(
  //   'GET RESULT',
  //   get_result.rows.map((row) => row.doc)
  // )
  expect(get_result.rows).toHaveLength(43)
})

test('Test Component', async () => {

  const store = new Vuex.Store(storeData)
  const vuetify = new Vuetify()
  const wrapper = mount(Accounts, {
    store,
    localVue,
    vuetify,
    mocks: {
      route: $route,
      // $pouch: {test: "test"}
      $pouch: pouch
    }
  })

  expect(wrapper.vm.$pouch).toBeTruthy

  const button = wrapper.find('#edit-b_N8Q_account_ELC')
  expect(button).toBeTruthy

  button.trigger('click')
  // expect(wrapper.html()).toContain('Savings')

  // const { getAllByText, getByText, getByLabelText } = renderWithVuetify(Accounts, {
  //   localVue,
  //   // $pouch: pouch,
  //   // global: {
  //   //   plugins: [PouchDB]
  //   // },
  //   // global: {
  //   //   pouch
  //   // },
  //   mocks: {
  //     // $pouch: pouch,
  //     $route
  //   },
  //   store: storeData
  // })

  // const editButton = getAllByText('edit')[0]
  // expect(editButton).toBeTruthy()
  // await fireEvent.click(editButton)
  // await flushPromises()




  // const nameInput = getByLabelText("Account Name")
  // await fireEvent.update(nameInput, 'Test')

  // getByText("Test")
  // const bc = getAllByText("asdaf")
})



// describe('Test DB', () => {
//   let dbc

//   beforeEach(() => {
//     db = new PouchDB('mock_db')
//     // // return db.bulkDocs(data).then((result) => {
//     // return db.put(docs[0]).then((result) => {
//     //   console.log("BEFORE EACH SUCCESS", result)
//     // }).catch((err) => {
//     //   console.log("PUT ERROR", err)
//     // })
//   })

//   afterEach(async () => {
//     await db.destroy()
//   })

//   // afterEach(() => {
//   //   const db = new PouchDB('mock_db')
//   //   return db.destroy((err, response) => {
//   //     if (err) {
//   //       return console.log('DESTROY ERROR', err)
//   //     } else {
//   //       console.log('DATABASE DELETED')
//   //     }
//   //   })
//   // })

//   it('checks mock db is working', async () => {
//     const db = new PouchDB('mock_db')

//     const result = await db
//       .get('b_N8Q_transaction_.B6fa-40KRhuh')
//       .then((res) => {
//         console.log('RES', res)
//         return res
//       })
//       .catch((err) => {
//         console.log('ERR', err)
//       })
//     delete result._rev
//     expect(result).toEqual({
//       type: 'SAVING',
//       checkNumber: true,
//       closed: false,
//       name: 'Savings',
//       note: null,
//       sort: 0,
//       onBudget: true,
//       sign: 1,
//       initialBalance: 0,
//       _id: 'b_N8Q_account_7kW'
//     })
//   })
// })


// test('updates category name on user input', async () => {
//   let vuetify = new Vuetify();

//   let vueInstance = createLocalVue()
//   vueInstance.use(vuetify)
//   vueInstance.use(Vuex)

//   const { getByDisplayValue } = render(BudgetGrid, {
//     global: {
//       plugins: [store]
//     },
//   })

//   getByDisplayValue('Car Maintenance')


// })
