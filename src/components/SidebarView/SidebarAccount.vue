<template>
  <v-hover #default="{ hover }">
    <v-list-item
      active-class="active-sidebar-item"
      class="sidebar-item account-sidebar-item"
      :to="destination"
      :data-testid="dataTestid"
      :id="id"
      dense
      #default="{ active }"
    >
      <div class="drag-container">
        <v-sheet width="20px" color="transparent" class="row-side-widget" :data-testid="`drag-account-${id}`">
          <v-icon v-if="hover" small class="handle ma-auto">mdi-drag-vertical</v-icon>
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
    </v-list-item>
  </v-hover>
</template>

<script>
import { mapGetters } from 'vuex'
import { ID_LENGTH } from '../../constants'

export default {
  nme: 'SidebarAccount',
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
    isHighlighted(active, hover) {
      return active || hover || this.focusedId === this.id
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
}
</style>
