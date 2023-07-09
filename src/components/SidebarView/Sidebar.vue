<template>
  <!-- Don't show if route includes 'landing'-->
  <v-navigation-drawer
    v-if="showNav"
    app
    class="background"
    :mini-variant.sync="mini"
    permanent
    floating
    hide-overlay
    width="250"
    :expand-on-hover="isLessThanBreakpoint"
    id="sidebar"
  >
    <v-list-item class="mt-2" r>
      <v-list-item-icon class="mr-4">
        <v-icon large> $custom </v-icon>
      </v-list-item-icon>
      <v-list-item-title>
        <zero-text-only />
      </v-list-item-title>
    </v-list-item>
    <sidebar-list :mini="mini">
      <sidebar-nav-item
        :destination="{ path: `/categories/${selectedMonth}` }"
        dataTestid="sidebar-button-categories"
        id="nav-categories"
        :focused-id="focusedId"
        icon="mdi-shape-outline"
        icon-active="mdi-shape"
      >
        Categories
      </sidebar-nav-item>
    </sidebar-list>
    <sidebar-account-group
      title="Accounts"
      :account-total="onBudgetTotal"
      icon="mdi-wallet-outline"
      icon-active="mdi-wallet"
      :focused-id="focusedId"
      id="sidebar-group-accounts"
      data-testid="sidebar-group-accounts"
      :child-is-selected="isOnTransactionsOnBudgetPage"
      :mini="mini"
    >
      <draggable handle=".handle" group="accounts" v-model="draggableOnBudget">
        <template v-for="account in accountsOnBudget">
          <sidebar-account
            :key="account._id"
            :account="account"
            :focused-id="focusedId"
            :destination="{ path: `/transactions/${account._id.slice(-ID_LENGTH.account)}` }"
            :data-testid="`transactions-page-${account._id.slice(-ID_LENGTH.account)}`"
            :id="`${account._id.slice(-ID_LENGTH.account)}`"
            :mini="mini"
            :class="`sidebar-on-account-item ${mini ? '' : 'expanded'}`"
          />
        </template>
      </draggable>
      <new-account-button is-on-budget data-testid="btn-new-account-on-budget" />
    </sidebar-account-group>
    <sidebar-account-group
      title="Untracked"
      :account-total="offBudgetTotal"
      icon="mdi-piggy-bank-outline"
      icon-active="mdi-piggy-bank"
      :focused-id="focusedId"
      id="sidebar-group-untracked"
      data-testid="sidebar-group-untracked"
      :child-is-selected="isOnTransactionsOffBudgetPage"
      :mini="mini"
    >
      <draggable handle=".handle" group="accounts" v-model="draggableOffBudget">
        <template v-for="account in accountsOffBudget">
          <sidebar-account
            :key="account._id"
            :account="account"
            :focused-id="focusedId"
            :destination="{ path: `/transactions/${account._id.slice(-ID_LENGTH.account)}` }"
            :data-testid="`transactions-page-${account._id.slice(-ID_LENGTH.account)}`"
            :id="`${account._id.slice(-ID_LENGTH.account)}`"
            :mini="mini"
            class="sidebar-off-account-item"
          />
        </template>
      </draggable>
      <new-account-button data-testid="btn-new-account-off-budget" />
    </sidebar-account-group>
    <template #append>
      <sidebar-list :mini="mini">
        <sidebar-nav-item
          :destination="{ path: '/manage' }"
          dataTestid="sidebar-button-manage"
          id="nav-settings"
          :focused-id="focusedId"
          icon="mdi-cog-outline"
          icon-active="mdi-cog"
        >
          Manage Budgets
        </sidebar-nav-item>
      </sidebar-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ID_LENGTH } from '../../constants'
import draggable from 'vuedraggable'
import ZeroIconWithText from '../Icons/zerowithtext.vue'
import ZeroTextOnly from '../Icons/zerotextonly.vue'
import SidebarNavItem from './SidebarNavItem.vue'
import SidebarAccount from './SidebarAccount.vue'
import SidebarAccountGroup from './SidebarAccountGroup.vue'
import SidebarList from './SidebarList.vue'
import NewAccountButton from './NewAccountButton.vue'

export default {
  name: 'Sidebar',
  components: {
    ZeroIconWithText,
    ZeroTextOnly,
    SidebarNavItem,
    SidebarAccount,
    SidebarAccountGroup,
    SidebarList,
    NewAccountButton,
    draggable
  },
  data() {
    return {
      ID_LENGTH,
      focusedId: '',
      draggableOnBudgetData: [],
      draggableOffBudgetData: [],
      isExpanded: false,
      mini: undefined
    }
  },
  watch: {
    accountsOnBudget: {
      handler: function (val) {
        this.draggableOnBudgetData = val
      },
      deep: true
    },
    accountsOffBudget: {
      handler: function (val) {
        this.draggableOffBudgetData = val
      },
      deep: true
    }
  },
  created() {
    this.draggableOnBudgetData = this.accountsOnBudget
  },
  computed: {
    ...mapGetters([
      'accountsOnBudget',
      'accountsOffBudget',
      'accountsById',
      'accounts',
      'intlCurrency',
      'allAccountBalances'
    ]),
    ...mapGetters('categoryMonth', ['selectedMonth']),
    isLessThanBreakpoint() {
      const is_less_than_breakpoint = this.$vuetify.breakpoint.mdAndDown
      this.mini = is_less_than_breakpoint
      return is_less_than_breakpoint
    },
    showNav() {
      return !this.$route.matched[0].meta.hideNav
    },
    accountTotals() {
      return this.accounts.reduce(
        (partial, account) => {
          const account_id = account._id.slice(-ID_LENGTH.account)
          const account_total = _.get(this.allAccountBalances, [account_id, 'working'], 0)
          // TODO: When a new account is created and a new transaction is made, this.allAccountBalances
          // updates correctly but this computed value doesn't for some reason. Find out why.
          const account_on_budget = account.onBudget
          partial[account_id] = account_total
          if (account_on_budget) {
            partial.on_budget += account_total
          } else {
            partial.off_budget += account_total
          }
          return partial
        },
        { on_budget: 0, off_budget: 0 }
      )
    },
    onBudgetTotal() {
      return this.intlCurrency.format(this.accountTotals.on_budget / 100)
    },
    offBudgetTotal() {
      return this.intlCurrency.format(this.accountTotals.off_budget / 100)
    },
    isOnTransactionsOnBudgetPage() {
      const id = this.$route.params.account_id
      const account = this.accountsById[id]
      return account && account.onBudget
    },
    isOnTransactionsOffBudgetPage() {
      const id = this.$route.params.account_id
      const account = this.accountsById[id]
      return account && !account.onBudget
    },
    draggableOnBudget: {
      get() {
        return this.draggableOnBudgetData
      },
      set(dragged_accounts) {
        this.draggableOnBudgetData = dragged_accounts
        const updated_accounts = dragged_accounts.map((previous, index) => {
          const current = {
            ...previous,
            sort: index,
            onBudget: true
          }
          return { current, previous }
        })
        this.commitBulkDocsToPouchAndVuex(updated_accounts)
      }
    },
    draggableOffBudget: {
      get() {
        return this.draggableOffBudgetData
      },
      set(dragged_accounts) {
        this.draggableOffBudgetData = dragged_accounts
        const updated_accounts = dragged_accounts.map((previous, index) => {
          const current = {
            ...previous,
            sort: index,
            onBudget: false
          }
          return { current, previous }
        })
        this.commitBulkDocsToPouchAndVuex(updated_accounts)
      }
    }
  },
  created() {
    document.addEventListener('focusin', this.onFocusIn)
    document.addEventListener('focusout', this.onFocusOut)
  },
  beforeDestroy() {
    document.removeEventListener('focusin', this.onFocusIn)
  },
  methods: {
    ...mapActions(['commitBulkDocsToPouchAndVuex']),
    getAccountTotal(account) {
      return this.intlCurrency.format(this.accountTotals[account._id.slice(-ID_LENGTH.account)] / 100)
    },
    onFocusIn(event) {
      this.focusedId = event.target.id
    },
    onFocusOut() {
      this.focusedId = ''
    }
  }
}
</script>

<style>
/* .v-list .v-list-item--active {
  color: #f5f5f5;
} */

.v-list-item__title {
  overflow: unset;
}

.v-list-item__icon:not(.v-list-group__header__append-icon) {
  margin-right: 24px !important;
}

.sidebar-group .v-list-group__header {
  margin-left: 4px;
}

#sidebar .account-sidebar-item,
.v-list-item__icon,
.v-list-item__icon .v-icon {
  color: unset;
  caret-color: unset;
}

.sidebar-item,
.sidebar-group {
  color: white;
  caret-color: white;
}

.sidebar-item:hover,
.sidebar-item:focus-within,
.sidebar-group .v-list-group__header:hover,
.sidebar-group .v-list-group__header:focus-within {
  color: var(--v-secondary-lighten2) !important;
  background-color: var(--v-background-lighten2) !important;
}
.sidebar-group .v-list-group__header {
  padding-left: 0;
}
.sidebar-group .v-list-group__header .v-list-group__header__prepend-icon {
  margin-left: 0 !important;
  height: 48px;
}

.active-sidebar-item,
.sidebar-group-active .v-list-group__header,
.sidebar-group-active .v-list-group__header {
  color: var(--v-secondary-lighten2) !important;
}

.v-list-item__icon {
  margin-top: auto !important;
  margin-bottom: auto !important;
  color: unset;
}

.header-sidebar-item.v-list-item,
.v-list-group__header,
.height-48 {
  min-height: 48px !important;
}

#sidebar {
  color: white;
}
</style>
