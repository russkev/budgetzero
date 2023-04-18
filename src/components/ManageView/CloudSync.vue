<template>
  <v-card flat color="background lighten-2" class="pa-2 mb-4">
    <div class="sync-stats">
      <div>Sync status:</div>
      <div>
        <v-chip small :color="syncState.color" outlined class="ml-3 mb-3" data-testid="sync-status-chip">
          <v-icon small left>{{ syncState.icon }}</v-icon>
          {{ syncState.text }}
        </v-chip>
      </div>
      <div>Sync address:</div>
      <div>
        <v-text-field
          solo
          flat
          :background-color="isEditing ? 'background lighten-3' : 'transparent'"
          :readonly="!isEditing"
          dense
          id="cloud-sync-url"
          data-testid="cloud-sync-url"
          style="font-size: 12px"
          :error="syncState === SYNC_STATE.ERROR"
          :error-messages="[syncErrorMessage]"
          v-model="remoteSyncUrlData"
        >
        </v-text-field>
        <div v-if="isEditing" id="cloud-sync-buttons">
          <div></div>
          <cancel-save @cancel="() => (isEditing = false)" @save="onSyncSave" />
        </div>
        <div v-else id="cloud-sync-buttons">
          <button-transparent small icon="mdi-pencil" @click="enableEdit" class="ml-2" data-testid="edit-cloud-button">
            Edit
          </button-transparent>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonTransparent from '../Shared/ButtonTransparent.vue'
import CancelSave from '../Shared/CancelSave.vue'
import { SYNC_STATE } from '../../constants'

export default {
  name: 'CloudSync',
  components: {
    ButtonTransparent,
    CancelSave
  },
  data() {
    return {
      remoteSyncUrlInput: '',
      isEditing: false,
      // temp_url: 'NONE',
      SYNC_STATE
    }
  },
  // mounted() {
  //   this.remoteSyncUrlInput = this.remoteSyncURL
  // },
  computed: {
    ...mapGetters(['remoteSyncURL', 'syncState', 'syncErrorMessage']),
    remoteSyncUrlData: {
      get() {
        if (this.remoteSyncURL !== '' && this.remoteSyncURL !== ' ') {
          return this.remoteSyncURL
        } else {
          return 'No URL set'
        }
      },
      set(value) {
        this.remoteSyncUrlInput = value
      }
    }
    // temp_url: {
    //   get() {
    //     // console.log('REMOTE', this.remoteSyncUrlData)
    //     // return this.remoteSyncUrl == ' ' ? 'NONE' : this.remoteSyncUrl
    //     if (this.remoteSyncURL === '') {
    //       return 'NONE'
    //     } else {
    //       return this.remoteSyncURL
    //     }
    //   },
    //   set(value) {}
    // }
  },
  methods: {
    ...mapActions(['setRemoteSyncToCustomURL']),
    onSyncSave() {
      this.isEditing = false
      this.setRemoteSyncToCustomURL(this.remoteSyncUrlInput)
    },
    enableEdit() {
      this.isEditing = !this.isEditing
      this.remoteSyncUrlInput = this.remoteSyncURL
      document.getElementById('cloud-sync-url').select()
    }
  }
}
</script>

<style scoped>
#cloud-sync-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#budgets-container-sheet .sync-stats {
  display: grid;
  grid-template-columns: max-content auto;
}

#budgets-container-sheet .sync-stats > div:nth-child(2n) {
  margin-left: 4px;
}
/* #cloud-sync-url {
  font-size: 10px;
} */
</style>
