<template>
  <v-row class="ma-0 header_background">
    <v-col sm="auto" class="pa-0">
      <v-card flat class="header_background">
        <v-card-title class="headline font-weight-bold primary--text">
          {{ accountName }}
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 grey--text text--darken-2"> ACCOUNT</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col sm="auto" class="pa-0">
      <v-card flat class="header_background">
        <v-card-title class="title font-weight-bold primary--text">
          {{ (accountBalance.cleared / 100) | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 grey--text text--darken-2">CLEARED</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col sm="auto" style="display: inline-flex; align-items: center" class="pa-0 header_background">
      <span class="headline pa-0 grey--text">+</span>
    </v-col>

    <v-col sm="auto" class="pa-0">
      <v-card flat class="header_background">
        <v-card-title class="title font-weight-bold primary--text">
          {{ (accountBalance.uncleared / 100) | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2">UNCLEARED</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col sm="auto" style="display: inline-flex; align-items: center" class="pa-0 header_background">
      <span class="headline pa-0 grey--text">=</span>
    </v-col>

    <v-col sm="auto" class="pa-0">
      <v-card flat class="header_background">
        <v-card-title class="headline-5 font-weight-bold primary--text">
          {{ (accountBalance.cleared / 100 + accountBalance.uncleared / 100) | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 grey--text text--darken-2">WORKING BALANCE</span>
        </v-card-subtitle>
      </v-card>
    </v-col>
    <v-col cols="1" class="ml-auto">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            id="btn-reconcile"
            large
            class="white--text mb-2 ml-2"
            color="primary"
            icon
            tile
            @click="$emit('showReconcileModal')"
          >
            <v-icon large color="primary lighten-1" v-on="on"> mdi-lock </v-icon>
          </v-btn>
        </template>
        <span>Reconcile</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { DEFAULT_ACCOUNT_BALANCE } from '../../constants'
import _ from 'lodash'

export default {
  props: ['selected_account_id'],
  computed: {
    ...mapGetters(['allAccountBalances', 'accountsById']),
    accountBalance() {
      const accountBalance = this.allAccountBalances[this.selected_account_id]
      return accountBalance ? accountBalance : DEFAULT_ACCOUNT_BALANCE
    },
    accountName() {
      return _.get(this.accountsById, [this.selected_account_id, 'name'], '')
    }
  },
  methods: {}
}
</script>
