import Vue from 'vue'
import moment from 'moment'

import { db, auth } from '../../firebaseConfig'
import PouchDB from 'pouchdb'

export default {
  state: {
    user: {
      loggedIn: false,
      email: null,
      userData: null
    }
  },
  getters: {
    user(state) {
      return state.user
    }
  },
  mutations: {
    SET_USER(state, data) {
      if (data) {
        Vue.set(state.user, 'email', data.email)
        // state.user.email = data.email
        Vue.set(state.user, 'uid', data.uid)
        // state.user.uid = data.uid
        Vue.set(state.user, 'loggedIn', true)
        // state.user.loggedIn = true
        Vue.set(state.user, 'displayName', data.displayName)
        // state.user.displayName = data.displayName
        Vue.set(state.user, 'emailVerified', data.emailVerified)
        // state.user.emailVerified = data.emailVerified
      } else {
        Vue.set(state.user, 'loggedIn', false)
        // state.user.loggedIn = false
        Vue.set(state.user, 'email', null)
        Vue.set(state.user, 'userData', null)
        // state.user = {
        //   loggedIn: false,
        //   email: null,
        //   userData: null
        // }
      }
    },
    SET_USER_DATA(state, data) {
      Vue.set(state.user, 'userData', data)
      // state.user.userData = data
    },
    API_FAILURE(state, error) {
      Vue.set(state, 'error_msg', `API Failed: ${error}`)
      // state.error_msg = `API Failed: ${error}`
      console.log(error)
    }
  },
  actions: {
    AUTH_CHECK({ dispatch, commit }) {
      console.log('auth check')
      auth.onAuthStateChanged(user => {
        if (user) {
          // User is signed in.
          console.log('user', user)
          if (!user.emailVerified) {
            Vue.prototype
              .$swal({
                title: 'Verify email account',
                text: 'You need to verify your email before you can use cloud sync.',
                showCancelButton: true,
                confirmButtonText: `Resend Email Verification`,
                cancelButtonText: `Ok`,
                cancelButtonColor: 'grey'
              })
              .then(result => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                  user.sendEmailVerification()
                  Vue.prototype.$swal('Please check your email for the verification email.', '', 'success')
                }
              })
          }
          commit('SET_USER', user)
          dispatch('fetchUser')
          // ...
        } else {
          // User is signed out.
          console.log('logged out - auth change')
          commit('SET_USER', null)
          commit('SET_USER_DATA', null)
        }
      })
    },
    LOGOUT({ commit, getters }) {
      auth.signOut()

      getters.syncHandler.on('complete', function(info) {
        // replication was canceled!
        console.log('sync canceled')
      })

      getters.syncHandler.cancel()
    },
    startSync(context) {
      // Only start sync if user account is verified
      if (!context.state.user.emailVerified) {
        context.commit('SET_STATUS_MESSAGE', 'Email not verified.')
        return
      }

      console.log('url', context.getters.user.userData)
      if (!context.getters.user.userData) {
        // TODO: use lodash to check if pouchdb_url exists
        context.commit('SET_STATUS_MESSAGE', 'Database not created.')
        return
      }

      var remoteDB = new PouchDB(context.getters.user.userData.pouchdb_url)

      context.getters.syncHandler = Vue.prototype.$vm.$pouch
        .sync(remoteDB, {
          live: true,
          retry: true
        })
        .on('change', function(change) {
          context.commit('SET_STATUS_MESSAGE', `Syncing ${moment().fromNow()}`)
          console.log('change detected')
          console.log('!!! NOT GETING NEW CHANGES FROM LOCAL DB !!!')
          // context.dispatch('getAllDocsFromPouchDB')
        })
        .on('complete', change => {
          // This will only fire when cancelling the replication
          context.commit('SET_STATUS_MESSAGE', `Sync'd ${moment().fromNow()}`)
          console.log('pouch sync complete', Vue.prototype.$vm.$pouch)
        })
        .on('paused', function(info) {
          context.commit('SET_STATUS_MESSAGE', `Sync'd ${moment().fromNow()}`)
          console.log('paused:', info)
          // replication was paused, usually because of a lost connection
        })
        .on('active', function(info) {
          context.commit('SET_STATUS_MESSAGE', `active`)

          // replication was resumed
        })
        .on('error', function(err) {
          context.commit('SET_STATUS_MESSAGE', err)
          console.error('Sync error', err)
        })
    },
    async fetchUser({ state, commit, dispatch }) {
      let data
      await db.ref('userProfile/' + state.user.uid).once('value', snapshot => {
        data = snapshot.val()
        // do something with documents
        console.log('firebase documents', data, state.user.uid)
      })

      commit('SET_USER_DATA', data)
      dispatch('startSync')
    }
  }
}
