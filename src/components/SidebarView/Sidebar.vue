<template>
  <v-navigation-drawer
    app
    class="background"
    :mini-variant="mini"
    permanent
    floating
    :expand-on-hover="mini"
    hide-overlay
    width="250"
  >
    <v-list-item class="mt-2" r>
      <v-list-item-icon class="mr-4">
        <v-icon large> $custom </v-icon>
      </v-list-item-icon>
      <v-list-item-title>
        <zero-text-only />
      </v-list-item-title>
    </v-list-item>
    <!-- <v-list flat :class="mini ? 'ml-0 pl-0' : 'ml-3'"> -->
    <sidebar-list :mini="mini">
      <sidebar-nav-item
        :destination="{ path: `/budget/${selectedMonth}` }"
        dataTestid="sidebar-button-budgets"
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
      data-test-id="sidebar-group-accounts"
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
            :id="`nav-account-${account._id.slice(-ID_LENGTH.account)}`"
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
      data-test-id="sidebar-group-untracked"
      :child-is-selected="isOnTransactionsOffBudgetPage"
      :mini="mini"
    >
      <draggable handle=".handle" group="accounts">
        <template v-for="account in accountsOffBudget">
          <sidebar-account
            :key="account._id"
            :account="account"
            :focused-id="focusedId"
            :destination="{ path: `/transactions/${account._id.slice(-ID_LENGTH.account)}` }"
            :data-testid="`transactions-page-${account._id.slice(-ID_LENGTH.account)}`"
            :id="`nav-account-${account._id.slice(-ID_LENGTH.account)}`"
          />
        </template>
      </draggable>
      <new-account-button data-testid="btn-new-account-off-budget" />
    </sidebar-account-group>
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
      draggableOnBudgetData: []
    }
  },
  watch: {
    accountsOnBudget: {
      handler: function (val) {
        this.draggableOnBudgetData = val
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
    mini() {
      return this.$vuetify.breakpoint.mdAndDown
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
            sort: index
          }
          return { current, previous }
        })
        this.commitBulkDocsToPouchAndVuex(updated_accounts)
      }
    }
  },
  created() {
    console.log('created')
    document.addEventListener('focusin', this.onFocusIn)
    document.addEventListener('focusout', this.onFocusOut)
    // document.addEventListener('mouseover', this.onFocusIn)
    // document.addEventListener('mouseout', this.onFocusOut)
  },
  beforeDestroy() {
    console.log('beforeDestroy')
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
.v-list .v-list-item--active {
  color: #f5f5f5;
}

.v-list-item__title {
  overflow: unset;
}

.v-list-item__icon:not(.v-list-group__header__append-icon) {
  margin-right: 24px !important;
}

.sidebar-item,
.sidebar-group .v-list-group__header {
  margin-left: 3px;
}

.sidebar-item:hover,
.sidebar-item:focus,
.sidebar-group .v-list-group__header:hover,
.sidebar-group .v-list-group__header:focus {
  color: var(--v-secondary-lighten2) !important;
  background-color: var(--v-background-lighten2) !important;
}

.active-sidebar-item,
.sidebar-group-active .v-list-group__header {
  color: var(--v-secondary-lighten2) !important;
  border-left: 3px solid var(--v-secondary-lighten2);
  margin-left: 0px;
}

.v-list-item__icon {
  margin-top: auto !important;
  margin-bottom: auto !important;
}

.header-sidebar-item.v-list-item,
.v-list-group__header {
  min-height: 48px !important;
}
</style>
