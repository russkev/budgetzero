<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    class="background"
    width="250"
    :mini-variant.sync="mini"
    permanent
    stateless
    hide-overlay
    floating
  >
    <budget-add-modal v-model="budget_add_modal_is_visible" />
    <BaseDialogModalComponent v-model="manageBudgetsModalVisible">
      <template #title> Budgets </template>
      <template #body>
        <v-select
          v-model="selectedBudget"
          :items="allBudgets"
          label=""
          class="pa-0 pb-1"
          item-text="name"
          item-value="short_id"
        />
      </template>
      <template #actions>
        <v-btn color="grey" @click.stop="manageBudgetsModalVisible = false">
          Cancel
        </v-btn>
        <v-btn color="accent" @click="loadSelectedBudget()">
          Load Budget
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <v-list-item class="pl-0">
      <v-list-item-content v-if="!mini" class="py-1">
        <v-list-item-title class="title pl-4">
          <v-img max-height="120" max-width="250" src="/logo3.png" />
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon v-if="mini" class="my-1 pb-2 ml-2">
        <v-btn class="mt-1" icon @click.stop="mini = !mini">
          <v-icon> mdi-chevron-right </v-icon>
        </v-btn>
      </v-list-item-icon>
      <v-list-item-icon v-if="!mini" class="my-1 pb-2">
        <v-btn class="mt-1" icon @click.stop="mini = !mini">
          <v-icon> mdi-chevron-left </v-icon>
        </v-btn>
      </v-list-item-icon>
    </v-list-item>
    <v-divider />

    <v-menu offset-x>
      <template #activator="{ on }">
        <v-list-item dense>
          <v-list-item-content v-if="!mini">
            <v-list-item-title>
              <v-chip small label>
                {{ budgetName ? budgetName : 'No budget loaded.' }}
              </v-chip>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon id="settingsMenuBtn" color="grey lighten-1" v-on="on"> mdi-cog </v-icon>
          </v-list-item-icon>
        </v-list-item>
      </template>
      <v-list max-width="400" color="grey lighten-4">
        <v-list-item :to="{ path: '/manage' }" :ripple="false">
          <v-list-item-avatar>
            <v-icon left color="primary"> mdi-swap-horizontal </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Manage Budgets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item id="settingsBtn" :to="{ path: '/settings' }" :ripple="false">
          <v-list-item-avatar>
            <v-icon left medium color="primary"> mdi-cog-outline </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-btn class="accent" @click="createBudget()">
              <v-icon left color="white"> mdi-pencil </v-icon>
              <span class="white--text">Create Budget</span>
            </v-btn>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-divider />

    <v-list dark dense class="text-left pt-0 sidebar">
      <v-list-item :to="{ path: `/budget/${selectedMonth}` }" data-testid="sidebar-button-budgets" :ripple="false">
        <v-list-item-icon>
          <v-icon> mdi-cash-multiple </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1"> Budget </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item :to="{ path: '/accounts' }" data-testid="sidebar-button-accounts" :ripple="false">
        <v-list-item-icon>
          <v-icon>mdi-bank</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1"> Accounts </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item :to="{ path: '/reports' }" data-testid="sidebar-button-reports" :ripple="false">
        <v-list-item-icon>
          <v-icon>mdi-chart-line</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1"> Reports </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- <v-list-item :to="{ path: '/all_transactions' }">
        <v-list-item-action>
          <v-icon>mdi-bank</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1">
            All Transactions
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->

      <v-divider>Off Budget (Tracking)</v-divider>

      <!-- <v-list-group value="true">
        <template v-slot:activator> -->
      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        ON BUDGET <span class="float-right pr-4">{{ accountTotals['on_budget'] / 100 | currency }}</span>
      </v-list-item-title>

      <!-- </template> -->

      <v-list-item
        v-for="item in accountsOnBudget"
        :key="item._id"
        :to="{ path: '/transactions/' + item._id.slice(-ID_LENGTH.account) }"
        active-class="primary white--text"
        :data-testid="`transactions-page-${item._id.slice(-ID_LENGTH.account)}`"
        >
        <!-- class="primary darken-1" -->
        <v-list-item-content>
          <v-list-item-title class="font-weight-regular subtitle-2">
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon class="subtitle-2">
          {{ accountTotals[item._id.slice(-ID_LENGTH.account)] / 100 | currency}}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />

      <!-- <v-list-group value="true">
        <template v-slot:activator> -->
      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        OFF BUDGET <span class="float-right pr-4">{{ accountTotals['off_budget'] / 100 | currency }}</span>
      </v-list-item-title>
      <!-- </template> -->

      <v-list-item
        v-for="item in accountsOffBudget"
        :key="item._id"
        :to="{ path: '/transactions/' + item._id.slice(-ID_LENGTH.account) }"
        active-class="primary white--text"
        >
        <!-- class="primary darken-1" -->
        <v-list-item-content>
          <v-list-item-title class="font-weight-regular subtitle-2">
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon class="subtitle-2">
          {{ accountTotals[item._id.slice(-ID_LENGTH.account)] / 100 | currency}}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />

      <!-- </v-list-group> -->
    </v-list>

    <template #append>
      <v-list dense>
        <!-- Help Menu -->
        <v-menu offset-x max-width="250">
          <template #activator="{ on }">
            <v-list-item v-if="mini" class="pl-2">
              <v-btn icon class="accent" v-on="on">
                <v-icon color="white"> mdi-help-circle-outline </v-icon>
              </v-btn>
            </v-list-item>
            <v-list-item v-if="!mini">
              <v-btn block text outlined v-on="on">
                <v-icon left color="white"> mdi-help-circle-outline </v-icon>
                <span>Help</span>
              </v-btn>
            </v-list-item>
          </template>

          <v-list dense color="grey lighten-4">
            <v-list-item>
                <v-btn text href="https://docs.budgetzero.io/"  target="_blank">
                  <v-icon left color="primary"> mdi-account </v-icon>
                  <span class="primary--text">Documentation</span>
                </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>

      </v-list>
      <v-btn @click="onClick()">
        Click me
      </v-btn>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import { ID_LENGTH } from '../../constants'
import BudgetAddModal from '../CategoryView/BudgetAddModal.vue'

import moment from 'moment'

export default {
  name: 'Sidebar',
  components: {
    BaseDialogModalComponent,
    BudgetAddModal,
  },
  data() {
    return {
      ID_LENGTH,
      selectedBudget: null,
      links: '',
      drawer: null,
      mini: false,
      manageBudgetsModalVisible: false,
      budget_add_modal_is_visible: false,
      // year_month: moment(new Date()).format('YYYY-MM')
      // accounts: [],
    }
  },
  computed: {
    ...mapGetters([
      'accounts',
      'accountBalances',
      'allAccountBalances',
      'sync_state',
      'accountsById',
      'accountsOnBudget',
      'accountsOffBudget',
      'selectedBudgetId',
      'allBudgets',
      'budgetsById',
    ]),
    ...mapGetters('categoryMonth',['selectedMonth']),
    budgetName() {
      if (this.selectedBudget) {
        // return this.budgetRootsMap[this.selectedBudget] ? this.budgetRootsMap[this.selectedBudget].name : 'None'
        return _.get(this.budgetsById, [this.selectedBudgetId, 'name'], '')
      } else {
        return ''
      }
    },
    accountTotals() {
      return this.accounts.reduce((partial, account) => {
        const account_id = account._id.slice(-ID_LENGTH.account)
        const account_total = _.get(this.allAccountBalances, [account_id, 'working'], 0)
        // TODO: When a new account is created and a new transaction is made, this.allAccountBalances
        // updates correctly but this computed value doesn't for some reason. Find out why.
        const account_on_budget = account.onBudget
        partial[account_id] = account_total
        if(account_on_budget) {
          partial.on_budget += account_total
        } else {
          partial.off_budget += account_total
        }
        return partial
      }, {on_budget: 0, off_budget: 0}) 
    },
  },
  watch: {
    selectedBudgetId: function(newBudget, oldBudget) {
      this.selectedBudget = newBudget //Assign value from vuex to local var when loads/updates
    }
  },
  methods: {
    createBudget() {
      this.budget_add_modal_is_visible = true
    },
  }
}
</script>

<style scoped>
a {
  color: white;
}
.list--dense.fix .list__tile__title {
  height: 15px;
}
</style>
