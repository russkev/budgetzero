import Vue from 'vue'
import App from './App.vue'

import PouchDB from 'pouchdb-browser'

import Vue2Filters from 'vue2-filters'

// css for vue-select
import 'vue-select/dist/vue-select.css'
import vSelect from 'vue-select'

import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vuelidate from 'vuelidate'

import VueRouter from 'vue-router' // prints 'idb'

import store from './store'
import Settings from './components/Settings.vue'
import Transactions from './components/TransactionView/Transactions.vue'

import Accounts from './components/AccountView/Accounts.vue'
import BudgetGrid from './components/BudgetView/BudgetGrid.vue'
import CreateBudget from './components/CreateBudget.vue'
import Manage from './components/Manage.vue'
import Reports from './components/Reports.vue'
import moment from 'moment'

import VueMoment from 'vue-moment'
import pouchdb_find from 'pouchdb-find'
import pouchdb_live_find from 'pouchdb-live-find'
import pouchdb_authentication from 'pouchdb-authentication'
import pouchdb_erase from 'pouchdb-erase'



/**
 * Sweet Alert
 */
import VueSweetalert2 from 'vue-sweetalert2'

const options = {
  confirmButtonColor: '#263238',
  cancelButtonColor: '#ff7674'
  // background: '#990000'
}

Vue.use(VueSweetalert2, options)
/** */

/**
 * Treeview for debugger
 */
import TreeView from 'vue-json-tree-view'
Vue.use(TreeView)
/** */

Vue.use(VueMoment)

PouchDB.plugin(pouchdb_find)
PouchDB.plugin(pouchdb_live_find)
PouchDB.plugin(pouchdb_authentication)
PouchDB.plugin(pouchdb_erase)

Vue.use(Vue2Filters)
Vue.component('VSelect', vSelect)
Vue.use(Vuelidate)

Vue.config.productionTip = false
Vue.use(VueRouter)

// eslint-disable-next-line vars-on-top
export var router = new VueRouter({
  mode: import.meta.env.IS_ELECTRON ? 'hash' : 'history',
  routes: [
    {
      path: '*',
      redirect: `/budget/${moment(new Date()).format('YYYY-MM')}`
    },
    {
      path: '/settings',
      component: Settings
    },
    {
      path: '/manage',
      component: Manage
    },
    {
      path: '/accounts',
      component: Accounts
    },
    {
      path: '/reports',
      component: Reports
    },
    {
      path: '/transactions',
      name: 'all_transactions',
      component: Transactions
    },
    {
      path: '/transactions/:account_id',
      name: 'transactions',
      component: Transactions
    },
    {
      path: '/budget/:month',
      component: BudgetGrid
    },
    {
      path: '/create',
      component: CreateBudget
    }
  ]
})

import { sync } from 'vuex-router-sync'
sync(store, router)

const vm = new Vue({
  store: store,
  created() {},
  methods: {},
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')

//TODO: Allows access to vm within Vuex store. May want to research alternative ways... this._vm may work within store?
Vue.prototype.$vm = vm

vm.$store.dispatch('createLocalPouchDB')
