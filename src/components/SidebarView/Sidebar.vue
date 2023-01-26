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
    <v-list flat :class="mini ? 'ml-0 pl-0' : 'ml-3'">
      <v-list-item class="ml-0" :to="{ path: `/budget/${selectedMonth}` }" data-testid="sidebar-button-budgets">
        <v-list-item-icon>
          <v-icon> mdi-shape </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> Categories </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-group prepend-icon="mdi-wallet" :value="true">
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title class="text-h6"> Accounts </v-list-item-title>
            <v-list-item-subtitle>{{ onBudgetTotal }}</v-list-item-subtitle>
          </v-list-item-content>
        </template>
        <v-list-item
          v-for="account in accountsOnBudget"
          :key="account._id"
          active-class="active-sidebar-item"
          :to="{ path: `/transactions/${account._id.slice(-ID_LENGTH.account)}` }"
          :data-testid="`transactions-page-${account._id.slice(-ID_LENGTH.account)}`"
          dense
          :ripple="false"
        >
          <v-list-item-avatar color="secondary darken-1" size="24">
            {{ account.name.slice(0, 2) }}
          </v-list-item-avatar>
          <v-list-item-content class="ml-5">
            <v-list-item-title class="text-h5">
              {{ account.name }}
            </v-list-item-title>
            <v-list-item-subtitle> {{ getAccountTotal(account) }}</v-list-item-subtitle>
          </v-list-item-content>
          <!-- <v-list-item-subtitle> -->
          <!-- {{ intlCurrency.format(accountTotals[account._id.slice(-ID_LENGTH.account)] / 100) }} -->
          <!-- $34.50 -->
          <!-- </v-list-item-subtitle> -->
          <!-- <v-list-item-subtitle>$1.50</v-list-item-subtitle> -->
        </v-list-item>
      </v-list-group>

      <v-list-item>
        <v-list-item-icon>
          <v-icon> mdi-piggy-bank </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Untracked</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import { ID_LENGTH } from '../../constants'
import ZeroIconWithText from '../Icons/zerowithtext.vue'
import ZeroTextOnly from '../Icons/zerotextonly.vue'

export default {
  name: 'Sidebar',
  components: {
    ZeroIconWithText,
    ZeroTextOnly
  },
  data() {
    return {
      ID_LENGTH
    }
  },
  computed: {
    ...mapGetters(['accountsOnBudget', 'accounts', 'intlCurrency', 'allAccountBalances']),
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
    }
  },
  methods: {
    getAccountTotal(account) {
      return this.intlCurrency.format(this.accountTotals[account._id.slice(-ID_LENGTH.account)] / 100)
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

.active-sidebar-item {
  /* background-color: var(--v-background-darken2) !important; */
  /* background-color: black; */
  /* background-color: transparent; */
  color: red !important;
}
</style>
