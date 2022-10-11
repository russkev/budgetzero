<template>
  <div id="transactions-header">
    <transactions-header-balance left :heading="accountName" />
    <v-alert
      border="left"
      align="right"
      :type="accountBalance.working < 0 ? 'error' : 'success'"
      text
      class="pa-2 ma-2"
      icon="false"
      :class="accountBalance.working < 0 ? 'error--text text--lighten-1' : 'success--text text--lighten-1'"
    >
      <template #prepend>
        <div class="mr-2"></div>
      </template>

      <transactions-header-balance
        :heading="intlCurrency.format(accountBalance.cleared / 100)"
        headingStyle="h4"
        subheading="Cleared"
      />
      <transactions-header-balance heading="+" headingStyle="h3" />
      <transactions-header-balance
        :heading="intlCurrency.format(accountBalance.uncleared / 100)"
        headingStyle="h4"
        subheading="Uncleared"
      />
      <transactions-header-balance heading="=" headingStyle="h3" />
      <transactions-header-balance
        :heading="intlCurrency.format(accountBalance.working / 100)"
        headingStyle="h3"
      />
    </v-alert>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { DEFAULT_ACCOUNT_BALANCE } from "../../constants";
import TransactionsHeaderBalance from "./TransactionsHeaderBalance.vue";

import _ from "lodash";

export default {
  components: {
    TransactionsHeaderBalance,
  },
  props: ["selected_account_id"],
  computed: {
    ...mapGetters(["allAccountBalances", "accountsById", "intlCurrency"]),
    accountBalance() {
      const accountBalance = this.allAccountBalances[this.selected_account_id];
      return accountBalance ? accountBalance : DEFAULT_ACCOUNT_BALANCE;
    },
    accountName() {
      return _.get(this.accountsById, [this.selected_account_id, "name"], "");
    },
  },
};
</script>

<style>
#transactions-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#transactions-header > div:nth-child(2) > div > div {
  display: flex;
  flex-direction: row;
}
</style>
