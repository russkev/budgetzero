<template>
  <v-card flat color="background lighten-2" class="pa-2 mb-4 manage-card" id="cloud-sync-card">
    <div class="sync-stats">
      <div>Sync status:</div>
      <div>
        <v-chip small :color="syncState.color" outlined class="ml-3 mb-3" data-testid="sync-status-chip">
          <v-icon small left :color="syncState.color">{{ syncState.icon }}</v-icon>
          {{ syncState.text }}
        </v-chip>
        <div style="height: 4px" class="mb-3">
          <v-progress-linear
            v-if="syncProgress > 0"
            :value="syncProgress"
            :indeterminate="syncProgress > 100"
            rounded
            :color="syncState.color"
          />
        </div>
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
        <div v-if="isEditing" id="cloud-sync-buttons" class="sync-editing">
          <div></div>
          <cancel-save @cancel="() => (isEditing = false)" @save="onSyncSave" />
        </div>
        <div v-else id="cloud-sync-buttons" class="sync-not-editing">
          <button-transparent small icon="mdi-pencil" @click="enableEdit" class="ml-2" data-testid="edit-cloud-button">
            Edit
          </button-transparent>
          <delete-confirm @confirm="clearRemoteSync" titleText="Clear sync address">
            <template #body>
              <div>
                <strong> Are you sure you want to clear the sync address? </strong>
              </div>
              <div class="mt-3">This will clear the sync address but keep the local database intact.</div>
            </template>
            <template #activator="{ on }">
              <button-transparent
                small
                icon="mdi-delete"
                class="ml-2"
                data-testid="clear-cloud-button"
                color="error lighten-2"
                :on="on"
              >
                Clear
              </button-transparent>
            </template>
          </delete-confirm>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonTransparent from '../Shared/ButtonTransparent.vue'
import HoverButton from '../Shared/HoverButton.vue'
import CancelSave from '../Shared/CancelSave.vue'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import { SYNC_STATE } from '../../constants'

export default {
  name: 'CloudSync',
  components: {
    ButtonTransparent,
    CancelSave,
    DeleteConfirm,
    HoverButton
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
    ...mapGetters(['remoteSyncURL', 'syncState', 'syncErrorMessage', 'syncProgress']),
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
    ...mapActions(['setRemoteSyncToCustomURL', 'clearRemoteSync']),
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
}

#cloud-sync-buttons.sync-editing {
  justify-content: space-between;
}

#cloud-sync-buttons.sync-not-editing {
  justify-content: flex-start;
}

#cloud-sync-card .sync-stats {
  display: grid;
  grid-template-columns: max-content auto;
}

#cloud-sync-card .sync-stats > div:nth-child(2n) {
  margin-left: 4px;
}
/* #cloud-sync-url {
  font-size: 10px;
} */
</style>
