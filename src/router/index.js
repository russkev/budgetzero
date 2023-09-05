import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import moment from 'moment'
import store from '../store'

import Transactions from '../components/TransactionView/Transactions.vue'
import Categories from '../components/CategoryView/Categories.vue'
import NewBudget from '../components/LandingView/NewBudget.vue'
import Manage from '../components/ManageView/Manage.vue'
import LandingContainer from '../components/LandingView/LandingContainer.vue'
import LandingRestore from '../components/LandingView/LandingRestore.vue'
import LandingNew from '../components/LandingView/LandingNew.vue'
import LandingStart from '../components/LandingView/LandingStart.vue'
import LandingCloudSync from '../components/LandingView/LandingCloudSync.vue'

// const routes = [
//   {
//     path: '/landing',
//     component: LandingContainer,
//     meta: { requiresAuth: false, hideNav: true },
//     children: [
//       {
//         path: '',
//         name: 'landing',
//         component: LandingStart
//       },
//       {
//         path: 'new',
//         name: 'new',
//         component: LandingNew
//       },
//       {
//         path: 'restore',
//         name: 'restore',
//         component: LandingRestore
//       },
//       {
//         path: 'sync',
//         name: 'sync',
//         component: LandingCloudSync
//       }
//     ]
//   },
//   // {
//   //   path: '*',
//   //   redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
//   //   meta: { requiresAuth: true }
//   // },
//   {
//     path: '/',
//     redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/manage',
//     component: Manage,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/transactions',
//     name: 'all_transactions',
//     component: Transactions,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/transactions/:account_id',
//     name: 'transactions',
//     component: Transactions,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/categories',
//     name: 'categories',
//     redirect: `/categories/${moment(new Date()).format('YYYY-MM')}`,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/categories/:month',
//     name: 'budget',
//     component: Categories,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/create',
//     component: NewBudget,
//     meta: { requiresAuth: true }
//   }
// ]

// const router = createRouter({
//   history: import.meta.env.IS_ELECTRON ? false : createWebHistory(),
//   hash: import.meta.env.IS_ELECTRON ? createWebHashHistory : false,
//   // mode: import.meta.env.IS_ELECTRON ? 'hash' : 'history',
//   // history: createWebHistory(),
//   routes
// })

// function isAuthenticated() {
//   return store.getters.budgetExists
// }

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

const routes = [
  {
    path: '/landing',
    component: LandingContainer,
    children: [
      {
        path: '',
        component: LandingStart
      }
    ]
  },
  {
    path: '/',
    component: LandingStart
  }
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

// router.beforeEach((to, from, next) => {
//   next({ name: 'landing' })
// })

export default router
