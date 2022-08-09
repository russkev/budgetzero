import Vue from 'vue'
import PouchDB from 'pouchdb'
import moment from 'moment'

const DEFAULT_REMOTE_STATE = {
  remoteSyncURL: null,
  syncHandle: null
}

export default {
  state: {
    ...DEFAULT_REMOTE_STATE
  },
  getters: {
    remoteSyncURL: (state) => state.remoteSyncURL
  },
  mutations: {
    GET_REMOTE_SYNC_URL(state) {
      const remote_sync_url = localStorage.remoteSyncURL
      if (remote_sync_url) {
        Vue.set(state, 'remoteSyncURL', remote_sync_url)
        // state.remoteSyncURL = remote_sync_url
        this.dispatch('startRemoteSyncToCustomURL', remote_sync_url)
      }
    },
    SET_REMOTE_SYNC_URL(state, url) {
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
    }
  },
  actions: {
    initiateSync(context) {
      context.dispatch('GET_REMOTE_SYNC_URL')
    },

    startRemoteSyncToCustomURL(context, url) {
      var url_expression =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
      var url_regex = new RegExp(url_expression)

      if (!url || !url.match(url_regex)) {
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Invalid URL provided',
          snackbarColor: 'error'
        })
        context.dispatch('cancelRemoteSync')
        return
      }

      var remoteDB = new PouchDB(url)

      context.commit('SET_REMOTE_SYNC_URL', url)

      remoteDB
        .info()
        .then((info) => {
          context.commit('SET_SNACKBAR_MESSAGE', {
            snackbarMessage: 'Connection to remote database success!',
            snackbarColor: 'primary'
          })
        })
        .catch((err) => {
          context.commit('SET_SNACKBAR_MESSAGE', { snackbarMessage: err, snackbarColor: 'error' })
          console.log('Failed to connect')
          console.log(err)
          context.dispatch('cancelRemoteSync')
          return
        })

      const sync = this._vm.$pouch
        .sync(remoteDB, {
          live: true,
          retry: true
        })
        .on('change', function (change) {
          context.commit('SET_STATUS_MESSAGE', `Last sync [change] ${moment().format('MMM D, h:mm a')}`)
          console.log('change detected')
          console.log('!!! NOT GETING NEW CHANGES FROM LOCAL DB !!!')
          // context.dispatch('getAllDocsFromPouchDB')
        })
        .on('complete', function (change) {
          context.commit('SET_STATUS_MESSAGE', `Last sync [complete] ${moment().format('MMM D, h:mm a')}`)
          console.log('pouch sync complete')
        })
        .on('paused', function (info) {
          context.commit('SET_STATUS_MESSAGE', `Last sync ${moment().format('MMM D, h:mm a')}`)
          console.log('paused:', info)
          // replication was paused, usually because of a lost connection
        })
        .on('active', function (info) {
          context.commit('SET_STATUS_MESSAGE', `active`)
          // replication was resumed
        })
        .on('error', function (err) {
          context.commit('SET_STATUS_MESSAGE', err)
          console.error('Sync error', err)
        })

      Vue.prototype.$pouchSyncHandler = sync
    },

    cancelRemoteSync(context) {
      if (Vue.prototype.$pouchSyncHandler) {
        Vue.prototype.$pouchSyncHandler.cancel()
      }
      context.commit('SET_STATUS_MESSAGE', 'Sync disabled')
    },

    clearRemoteSync(context) {
      context.dispatch('cancelRemoteSync')
      context.commit('CLEAR_REMOTE_SYNC_URL')
    }
  }
}