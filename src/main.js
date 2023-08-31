import Vue from 'vue'
import App from './App.vue'

import PouchDB from 'pouchdb-browser'

import Vue2Filters from 'vue2-filters'

import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vuelidate from 'vuelidate'

import VueRouter from 'vue-router' // prints 'idb'

import store from './store'
import Transactions from './components/TransactionView/Transactions.vue'

import Categories from './components/CategoryView/Categories.vue'
// import CreateBudget from './components/CreateBudget.vue'
import NewBudget from './components/LandingView/NewBudget.vue'
import Manage from './components/ManageView/Manage.vue'
// import Reports from './components/Reports.vue'
// import Landing from './components/LandingView/Landing.vue'
import LandingContainer from './components/LandingView/LandingContainer.vue'
import LandingRestore from './components/LandingView/LandingRestore.vue'
import LandingNew from './components/LandingView/LandingNew.vue'
import LandingStart from './components/LandingView/LandingStart.vue'
import LandingCloudSync from './components/LandingView/LandingCloudSync.vue'
import moment from 'moment'
import VuePapaParse from 'vue-papa-parse'
import VueMoment from 'vue-moment'
import pouchdb_find from 'pouchdb-find'
import pouchdb_live_find from 'pouchdb-live-find'
import pouchdb_authentication from 'pouchdb-authentication'
import pouchdb_erase from 'pouchdb-erase'
import Fragment from 'vue-fragment'
import { createSimpleTransition } from 'vuetify/lib/components/transitions/createTransition'

// import excel from 'vue-excel-export'

/**
 * Sweet Alert
 */
import VueSweetalert2 from 'vue-sweetalert2'

const options = {
  confirmButtonColor: '#263238',
  cancelButtonColor: '#ff7674'
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
Vue.use(Vuelidate)

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Fragment.Plugin)
Vue.use(VuePapaParse)
// Vue.use(excel)

const dialogRightTransition = createSimpleTransition('dialog-right-transition')
Vue.component('my-transition', dialogRightTransition)

// eslint-disable-next-line vars-on-top
export var router = new VueRouter({
  mode: import.meta.env.IS_ELECTRON ? 'hash' : 'history',
  routes: [
    {
      path: '/landing',
      component: LandingContainer,
      meta: { requiresAuth: false, hideNav: true },
      children: [
        {
          path: '',
          name: 'landing',
          component: LandingStart
        },
        {
          path: 'new',
          name: 'new',
          component: LandingNew
        },
        {
          path: 'restore',
          name: 'restore',
          component: LandingRestore
        },
        {
          path: 'sync',
          name: 'sync',
          component: LandingCloudSync
        }
      ]
    },
    {
      path: '*',
      redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
      meta: { requiresAuth: true }
    },
    {
      path: '/manage',
      component: Manage,
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions',
      name: 'all_transactions',
      component: Transactions,
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions/:account_id',
      name: 'transactions',
      component: Transactions,
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
      meta: { requiresAuth: true }
    },
    {
      path: '/categories/:month',
      name: 'budget',
      component: Categories,
      meta: { requiresAuth: true }
    },
    {
      path: '/create',
      component: NewBudget,
      meta: { requiresAuth: true }
    }
  ]
})

function isAuthenticated() {
  return store.getters.budgetExists
}

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      store.commit('SET_TARGET_PAGE', to.path)
      next({ name: 'landing' })
    }
  } else if (to.matched.some((record) => record.meta.requiresAuth === false)) {
    if (isAuthenticated()) {
      next({ name: 'budget' })
    }
  }
  next()
})

import { sync } from 'vuex-router-sync'
sync(store, router)

const vm = new Vue({
  store: store,
  created() {},
  methods: {},
  vuetify,
  router,
  render: (h) => h(App)
}).$mount('#app')

//TODO: Allows access to vm within Vuex store. May want to research alternative ways... this._vm may work within store?
Vue.prototype.$vm = vm

vm.$store.dispatch('createLocalPouchDB').then(() => {
  vm.$store.dispatch('resetAndFetchAllDocsFromPouchDB')
})
