<template>
  <v-list-item dense>
    <account-edit-modal is-new v-model="dialogIsOpen" :edited-item="editedItem" @save="onSave" />
    <!-- @close="onClose" -->
    <v-btn
      small
      tile
      text
      class="ml-5 text-none sidebar-item"
      :data-testid="`btn-new-account-off-budget`"
      @click="onClick"
    >
      <v-icon small class="ma-1">mdi-plus</v-icon>
      <span> New Account </span>
    </v-btn>
  </v-list-item>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AccountEditModal from '../AccountView/AccountEditModal.vue'
import { DEFAULT_ACCOUNT, ID_NAME } from '../../constants'
// import { generateShortId } from '../modules/id-module'

export default {
  name: 'NewAccountButton',
  components: {
    AccountEditModal
  },
  props: {
    dataTestid: {
      type: String,
      default: ''
    },
    isOnBudget: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogIsOpen: false,
      editedItem: {}
    }
  },
  computed: {
    ...mapGetters(['accountsOnBudget', 'accountsOffBudget', 'selectedBudgetId'])
  },
  methods: {
    ...mapActions(['commitDocToPouchAndVuex', 'calculateAllValues']),
    onClick() {
      this.editedItem = {
        ...DEFAULT_ACCOUNT,
        onBudget: this.isOnBudget,
        sort: this.isOnBudget ? this.accountsOnBudget.length : this.accountsOffBudget.length,
        _id: `b_${this.selectedBudgetId}${ID_NAME.account}${this.generateShortId()}`
      }
      this.dialogIsOpen = true
    },
    onSave(currentAccount) {
      this.commitDocToPouchAndVuex({ current: currentAccount, previous: null }).then(() => {
        this.calculateAllValues()
      })
      // this.$emit('save', currentAccount)
      // this.dialogIsOpen = false
    }
  }
}
</script>
