import Vue from 'vue'
import PouchDB from 'pouchdb'
import moment from 'moment'
import { SYNC_STATE } from '../../constants'

const DEFAULT_REMOTE_STATE = {
  remoteSyncURL: '',
  syncHandle: null,
  syncState: SYNC_STATE.NOT_CONNECTED,
  errorMessage: ''
}

export default {
  state: {
    ...DEFAULT_REMOTE_STATE
  },
  getters: {
    remoteSyncURL: (state) => state.remoteSyncURL,
    syncState: (state) => state.syncState,
    syncErrorMessage: (state) => state.errorMessage
  },
  mutations: {
    GET_REMOTE_SYNC_URL(state) {
      const remote_sync_url = localStorage.remoteSyncURL
      console.log('GET_REMOTE_SYNC_URL', remote_sync_url)
      if (remote_sync_url) {
        Vue.set(state, 'remoteSyncURL', remote_sync_url)
        // state.remoteSyncURL = remote_sync_url
        this.dispatch('setRemoteSyncToCustomURL', remote_sync_url)
      }
    },
    SET_REMOTE_SYNC_URL(state, url) {
      console.log('SET_REMOTE_SYNC_URL', url)
      Vue.set(state, 'remoteSyncURL', url)
      // state.remoteSyncURL = url
      localStorage.remoteSyncURL = url
    },
    CLEAR_REMOTE_SYNC_URL(state) {
      localStorage.removeItem('remoteSyncURL')
      Vue.set(state, 'remoteSyncURL', '')
      // state.remoteSyncURL = ''
    },
    SET_SYNC_HANDLER(state, syncHandler) {
      Vue.set(state, 'syncHandle', syncHandler)
      // state.syncHandle = syncHandler
    },
    RESET_REMOTE_STATE(state) {
      Object.entries(DEFAULT_STATE).forEach(([key, value]) => {
        Vue.set(state, key, value)
      })
    },
    SET_SYNC_STATE(state, syncState) {
      state.syncState = syncState
    },
    SET_ERROR_MESSAGE(state, errorMessage) {
      state.errorMessage = errorMessage
    },
    RESET_ERROR_MESSAGE(state) {
      state.errorMessage = ''
    }
  },
  actions: {
    initiateSync(context) {
      context.dispatch('GET_REMOTE_SYNC_URL')
    },

    async setRemoteSyncToCustomURL({ commit, dispatch, getters }, url) {
      if (url === '') {
        dispatch('cancelRemoteSync')
        commit('SET_SYNC_STATE', SYNC_STATE.NOT_CONNECTED)
        commit('RESET_ERROR_MESSAGE')

        return
      }
      var url_expression =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
      var url_regex = new RegExp(url_expression)

      if (!url || !url.match(url_regex)) {
        commit('SET_SYNC_STATE', SYNC_STATE.ERROR)
        commit('SET_ERROR_MESSAGE', 'Invalid URL provided')
        commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Invalid URL provided',
          snackbarColor: 'error'
        })
        dispatch('cancelRemoteSync')
        return
      }

      commit('SET_SYNC_STATE', SYNC_STATE.CONNECTING)

      var remoteDB = new PouchDB(url)
      commit('SET_REMOTE_SYNC_URL', url)

      await remoteDB
        .info()
        .then((info) => {
          commit('SET_SYNC_STATE', SYNC_STATE.SYNCING)
          commit('RESET_ERROR_MESSAGE')
          commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: 'Connection to remote database success!',
            snackbarColor: 'primary'
          })
        })
        .catch((err) => {
          commit('SET_SYNC_STATE', SYNC_STATE.ERROR)
          commit('SET_ERROR_MESSAGE', err)
          commit('SET_SNACKBAR_MESSAGE', { snackbarMessage: err, snackbarColor: 'error' })
          console.log('Failed to connect')
          console.log(err)
          dispatch('cancelRemoteSync')
          return
        })

      let localDB = this._vm.$pouch
      if (!localDB) {
        await dispatch('createLocalPouchDB')
        localDB = this._vm.$pouch
      }
      const sync = localDB
        .sync(remoteDB, {
          live: true,
          retry: true
        })
        .on('change', (change) => {
          console.log('Sync change', change)
          commit('SET_STATUS_MESSAGE', `Last sync [change] ${moment().format('MMM D, h:mm a')}`)
          if (change.direction === 'pull') {
            // dispatch('getAllDocsFromPouchDB')
            dispatch('loadLocalBudget')
          }
          commit('SET_SYNC_STATE', SYNC_STATE.SYNCED)
        })
        .on('complete', (change) => {
          console.log('Sync complete', change)
          commit('SET_STATUS_MESSAGE', `Last sync [complete] ${moment().format('MMM D, h:mm a')}`)
          commit('SET_SYNC_STATE', SYNC_STATE.SYNCED)
        })
        .on('paused', (info) => {
          console.log('Sync paused', info)
          commit('SET_STATUS_MESSAGE', `Paused, Last sync ${moment().format('MMM D, h:mm a')}`)
          commit('SET_SYNC_STATE', SYNC_STATE.PAUSED)
          // replication was paused, usually because of a lost connection
        })
        .on('active', (info) => {
          console.log('Sync active', info)
          commit('SET_STATUS_MESSAGE', `active`)
          commit('SET_SYNC_STATE', SYNC_STATE.SYNCED)
          // replication was resumed
        })
        .on('error', (err) => {
          console.error('Sync error', err)
          commit('SET_SYNC_STATE', SYNC_STATE.ERROR)
          commit('SET_ERROR_MESSAGE', err)
          commit('SET_STATUS_MESSAGE', err)
        })

      Vue.prototype.$pouchSyncHandler = sync
    },

    cancelRemoteSync(context) {
      if (Vue.prototype.$pouchSyncHandler) {
        Vue.prototype.$pouchSyncHandler.cancel()
      }
      context.commit('SET_STATUS_MESSAGE', 'Sync disabled')
    },

    clearRemoteSync({ dispatch, commit }) {
      dispatch('cancelRemoteSync')
      commit('CLEAR_REMOTE_SYNC_URL')
      commit('RESET_ERROR_MESSAGE')
      commit('SET_SYNC_STATE', SYNC_STATE.NOT_CONNECTED)
    }
  }
}
