import Vue, { createApp } from 'vue'
import App from './App.vue'

import moment from 'moment'
import Vuelidate from 'vuelidate'
// import VueRouter from 'vue-router' // prints 'idb'
import VuePapaParse from 'vue-papa-parse'

import PouchDB from 'pouchdb-browser'
import pouchdb_find from 'pouchdb-find'
import pouchdb_live_find from 'pouchdb-live-find'
import pouchdb_authentication from 'pouchdb-authentication'
import pouchdb_erase from 'pouchdb-erase'

// import vuetify from './plugins/vuetify'
// import { createSimpleTransition } from 'vuetify/lib/components/transitions/createTransition'
import { registerPlugins } from './plugins'

import store from './store'

PouchDB.plugin(pouchdb_find)
PouchDB.plugin(pouchdb_live_find)
PouchDB.plugin(pouchdb_authentication)
PouchDB.plugin(pouchdb_erase)

Vue.use(Vuelidate)

Vue.config.productionTip = false
// Vue.use(VueRouter)
Vue.use(VuePapaParse)

// const dialogRightTransition = createSimpleTransition('dialog-right-transition')
// Vue.component('my-transition', dialogRightTransition)

// eslint-disable-next-line vars-on-top
// export var router = new VueRouter({
//   mode: import.meta.env.IS_ELECTRON ? 'hash' : 'history',
//   routes: [
//     {
//       path: '/landing',
//       component: LandingContainer,
//       meta: { requiresAuth: false, hideNav: true },
//       children: [
//         {
//           path: '',
//           name: 'landing',
//           component: LandingStart
//         },
//         {
//           path: 'new',
//           name: 'new',
//           component: LandingNew
//         },
//         {
//           path: 'restore',
//           name: 'restore',
//           component: LandingRestore
//         },
//         {
//           path: 'sync',
//           name: 'sync',
//           component: LandingCloudSync
//         }
//       ]
//     },
//     {
//       path: '*',
//       redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/manage',
//       component: Manage,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/transactions',
//       name: 'all_transactions',
//       component: Transactions,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/transactions/:account_id',
//       name: 'transactions',
//       component: Transactions,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/categories',
//       name: 'categories',
//       redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/categories/:month',
//       name: 'budget',
//       component: Categories,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/create',
//       component: NewBudget,
//       meta: { requiresAuth: true }
//     }
//   ]
// })

// router.beforeEach((to, from, next) => {
//   if (to.matched.some((record) => record.meta.requiresAuth)) {
//     if (!isAuthenticated()) {
//       store.commit('SET_TARGET_PAGE', to.path)
//       next({ name: 'landing' })
//     }
//   } else if (to.matched.some((record) => record.meta.requiresAuth === false)) {
//     if (isAuthenticated()) {
//       next({ name: 'budget' })
//     }
//   }
//   next()
// })

// const vm = new Vue({
//   store: store,
//   created() {},
//   methods: {},
//   router,
//   render: (h) => h(App)
// }).$mount('#app')
const app = createApp(App)
// app.use(store)
// app.use(router)
registerPlugins(app)

const vm = app.mount('#app')

//TODO: Allows access to vm within Vuex store. May want to research alternative ways... this._vm may work within store?
// Vue.prototype.$vm = vm

// vm.$store.dispatch('createLocalPouchDB').then(() => {
//   vm.$store.dispatch('resetAndFetchAllDocsFromPouchDB')
// })
