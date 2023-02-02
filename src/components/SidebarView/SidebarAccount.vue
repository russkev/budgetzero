<template>
  <div>
    <account-edit-modal v-model="dialogIsOpen" :edited-item="editedItem" @save="onSave" />
    <v-hover #default="{ hover }">
      <div class="sidebar-item drag-container">
        <v-list-item
          active-class="active-sidebar-item"
          class="account-sidebar-item pr-0 pl-0"
          :to="destination"
          :data-testid="dataTestid"
          :id="id"
          dense
          #default="{ active }"
        >
          <div class="account-avatar-wrapper">
            <sidebar-select-indicator :active="active" />
            <v-sheet width="20px" color="transparent" class="row-side-widget" :data-testid="`drag-account-${id}`">
              <v-icon v-if="hover" color="secondary lighten-3" small class="handle ma-auto">mdi-drag-vertical</v-icon>
            </v-sheet>
            <v-list-item-avatar
              size="26"
              :class="`ml-0 my-1 font-weight-black ${
                isHighlighted(active, hover) ? 'account-avatar-active' : 'account-avatar'
              }`"
            >
              {{ account.name.slice(0, 2) }}
            </v-list-item-avatar>
          </div>
          <v-list-item-content class="ml-5 py-0">
            <v-list-item-title class="text-h5 ma-0">
              {{ account.name }}
            </v-list-item-title>
            <v-list-item-subtitle> {{ accountTotal }}</v-list-item-subtitle>
          </v-list-item-content>
          <!-- <v-spacer /> -->
        </v-list-item>
        <div
          class="sidebar-button account-edit-button"
          :style="`width: ${mini ? '0' : buttonWidth + 'px'}; min-width: ${mini ? '0' : buttonWidth + 'px'}`"
        >
          <hover-button
            v-if="!mini"
            :hover="hover"
            icon="mdi-pencil"
            active-color="secondary lighten-4"
            inactive-color="secondary lighten-2"
            active-background-color="background lighten-4"
            :data-testid="`btn-edit-account-${id}`"
            @click="onEditAccount"
            :width="buttonWidth"
          />
        </div>
      </div>
    </v-hover>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ID_LENGTH } from '../../constants'
import AccountEditModal from '../AccountView/AccountEditModal.vue'
import HoverButton from '../Shared/HoverButton.vue'
import SidebarSelectIndicator from './SidebarSelectIndicator.vue'

export default {
  nme: 'SidebarAccount',
  components: {
    HoverButton,
    AccountEditModal,
    SidebarSelectIndicator
  },
  props: {
    account: {
      type: Object,
      default: {}
    },
    id: {
      type: String,
      default: ''
    },
    dataTestid: {
      type: String,
      default: ''
    },
    destination: {
      type: Object,
      default: {}
    },
    mini: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogIsOpen: false,
      editedItem: {},
      buttonWidth: 26
    }
  },
  computed: {
    ...mapGetters(['intlCurrency', 'allAccountBalances']),
    accountTotal() {
      const account_id = this.account._id.slice(-ID_LENGTH.account)
      const account_total = this.allAccountBalances[account_id]
      return this.intlCurrency.format(account_total.working / 100)
    }
  },
  methods: {
    ...mapActions(['commitDocToPouchAndVuex', 'calculateAllValues']),
    isHighlighted(active, hover) {
      return active || hover || this.focusedId === this.id
    },
    onEditAccount() {
      this.editedItem = { ...this.account }
      this.dialogIsOpen = true
    },
    onSave(current) {
      this.commitDocToPouchAndVuex({
        current,
        previous: this.account
      }).then(() => {
        this.calculateAllValues()
      })
    }
  }
}
</script>

<style>
.account-avatar {
  border: 1px solid white;
  font-size: 10px;
}

.account-avatar-active {
  border: none;
  background: var(--v-secondary-lighten2);
  color: var(--v-background-lighten2);
  font-size: 10px;
}

.account-sidebar-item.v-list-item {
  min-height: 40px !important;
}

.drag-container {
  display: flex;
  width: 100%;
}

.account-edit-button {
  display: flex;
  min-width: 0;
  overflow-y: hidden;
  transition-property: width;
  transition-duration: 0.15s;
}

.account-avatar-wrapper {
  height: 100%;
  display: flex;
}
</style>
