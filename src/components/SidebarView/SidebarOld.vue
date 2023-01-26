<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    class="background"
    width="250"
    :mini-variant="$vuetify.breakpoint.mdAndDown"
    permanent
    hide-overlay
    floating
  >
    <!-- stateless -->
    <!-- :mini-variant.sync="mini" -->
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
        <v-btn color="grey" @click.stop="manageBudgetsModalVisible = false"> Cancel </v-btn>
        <v-btn color="accent" @click="loadSelectedBudget()"> Load Budget </v-btn>
      </template>
    </BaseDialogModalComponent>

    <v-list-item class="pl-0">
      <v-list-item-content v-if="!mini" class="py-1">
        <v-list-item-title class="title pl-4">
          <zero-icon-with-text />
          <!-- <v-img max-height="120" max-width="250" src="/logo3.png" /> -->
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon data-testid="toggle-sidebar" v-if="mini" class="my-1 pb-2 ml-2">
        <v-btn class="mt-1" icon @click.stop="mini = !mini">
          <v-icon> mdi-chevron-right </v-icon>
        </v-btn>
      </v-list-item-icon>
      <v-list-item-icon data-testid="toggle-sidebar" v-if="!mini" class="my-1 pb-2">
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
          <v-list-item-title class="subtitle-1"> All Transactions </v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->

      <v-divider>Off Budget (Tracking)</v-divider>

      <!-- <v-list-group value="true">
        <template v-slot:activator> -->
      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        ON BUDGET <span class="float-right pr-4">{{ (accountTotals['on_budget'] / 100) | currency }}</span>
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
          {{ (accountTotals[item._id.slice(-ID_LENGTH.account)] / 100) | currency }}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />

      <!-- <v-list-group value="true">
        <template v-slot:activator> -->
      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        OFF BUDGET <span class="float-right pr-4">{{ (accountTotals['off_budget'] / 100) | currency }}</span>
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
          {{ (accountTotals[item._id.slice(-ID_LENGTH.account)] / 100) | currency }}
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
              <v-btn text href="https://docs.budgetzero.io/" target="_blank">
                <v-icon left color="primary"> mdi-account </v-icon>
                <span class="primary--text">Documentation</span>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list>
      <v-icon>$vuetify.icons.custom</v-icon>
      <!-- <svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M15 26.5C13.8954 26.5 13 25.6046 13 24.5V7.5C13 6.39543 13.8954 5.5 15 5.5H56C65.6184 5.5 73.4259 9.2008 78.64 15.479C83.6036 21.4555 85.5 28.8819 85.5 35.5C85.5 43.9912 81.8239 49.981 77.5429 54.8962C75.611 57.1143 73.3605 59.3337 71.2183 61.4463L70.983 61.6784C68.8626 63.7699 66.6657 65.9418 64.337 68.4483C63.9554 68.8591 63.4209 69.0951 62.8603 69.0951H42.0465C40.3063 69.0951 39.3901 67.0208 40.5484 65.7221C47.7512 57.6467 54.6084 49.2542 61.7071 41.1038C64.1761 38.269 64.5 37.0088 64.5 35.5C64.5 32.6181 63.6464 30.2945 62.485 28.896C61.5741 27.7992 59.8816 26.5 56 26.5H15Z"
          fill="url(#paint0_linear_303_1086)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M84 71.5C85.1046 71.5 86 72.3954 86 73.5V90.5C86 91.6046 85.1046 92.5 84 92.5L43 92.5C33.3817 92.5 25.5741 88.7992 20.36 82.521C15.3965 76.5445 13.5 69.1181 13.5 62.5C13.5 54.0088 17.1762 48.019 21.4572 43.1038C23.3891 40.8857 25.6395 38.6663 27.7817 36.5537L28.0171 36.3216C30.1374 34.2301 32.3343 32.0582 34.663 29.5516C35.0446 29.1409 35.5791 28.9049 36.1397 28.9049L56.9536 28.9049C58.6938 28.9049 59.6099 30.9792 58.4516 32.2779C51.2489 40.3533 44.3916 48.7458 37.2929 56.8962C34.8239 59.731 34.5 60.9912 34.5 62.5C34.5 65.3819 35.3536 67.7055 36.5151 69.104C37.4259 70.2008 39.1184 71.5 43 71.5L84 71.5Z"
          fill="url(#paint1_linear_303_1086)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_303_1086"
            x1="23.3775"
            y1="5.93069"
            x2="90.2022"
            y2="79.2193"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF9432" />
            <stop offset="1" stop-color="#F14DFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_303_1086"
            x1="23.3775"
            y1="5.93069"
            x2="90.2022"
            y2="79.2193"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF9432" />
            <stop offset="1" stop-color="#F14DFF" />
          </linearGradient>
        </defs>
      </svg> -->
      <!-- <zero-icon /> -->
      <v-btn @click="onClick()"> Click me </v-btn>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import { ID_LENGTH } from '../../constants'
import BudgetAddModal from '../CategoryView/BudgetAddModal.vue'
import ZeroIconWithText from '../Icons/zerowithtext.vue'
import moment from 'moment'

export default {
  name: 'Sidebar',
  components: {
    BaseDialogModalComponent,
    BudgetAddModal,
    ZeroIconWithText
  },
  data() {
    return {
      ID_LENGTH,
      selectedBudget: null,
      links: '',
      drawer: null,
      mini: false,
      manageBudgetsModalVisible: false,
      budget_add_modal_is_visible: false
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
      'budgetsById'
    ]),
    ...mapGetters('categoryMonth', ['selectedMonth']),
    budgetName() {
      if (this.selectedBudget) {
        // return this.budgetRootsMap[this.selectedBudget] ? this.budgetRootsMap[this.selectedBudget].name : 'None'
        return _.get(this.budgetsById, [this.selectedBudgetId, 'name'], '')
      } else {
        return ''
      }
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
    }
  },
  watch: {
    selectedBudgetId: function (newBudget, oldBudget) {
      this.selectedBudget = newBudget //Assign value from vuex to local var when loads/updates
    }
  },
  methods: {
    createBudget() {
      this.budget_add_modal_is_visible = true
    }
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
