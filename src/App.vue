<template>
  <v-app id="app">
    <!-- Global confirm dialog -->
    <confirm-dialog ref="confirm"></confirm-dialog>

    <budget-add-modal v-model="isModalVisibleCreateBudget"/>

    <sidebar />

    <v-main>
      <router-view class="animated" />
    </v-main>
    <v-snackbar v-model="snackbar" :color="snackBarColor">
      {{ snackbarMessage }}

      <template #action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
window.global ||= window;
import Sidebar from './components/Sidebar.vue'
import BaseDialogModalComponent from './components/Modals/BaseDialogModalComponent.vue'
import ConfirmDialog from './components/Modals/ConfirmDialog.vue'
import BudgetAddModal from './components/CategoryView/BudgetAddModal.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    BaseDialogModalComponent,
    ConfirmDialog,
    BudgetAddModal,
  },
  data() {
    return {
      drawer: null,
      mini: false,
    }
  },
  computed: {
    isModalVisibleCreateBudget: {
      get() {
        return !this.$store.getters.budgetExists || this.createBudgetIsLoading
      },
      set() {
        return
      }
    },
    snackbarMessage() {
      return this.$store.getters.snackbarMessage
    },
    snackBarColor() {
      return this.$store.getters.snackbarColor
    },
    snackbar: {
      get() {
        return this.$store.getters.snackbar
      },
      set(value) {
        this.$store.dispatch('setSnackBarBoolean', value)
      }
    }
  },
  mounted() {
    this.$root.$confirm = this.$refs.confirm.open
  }
}
</script>
<!-- 
<style lang="scss">
@import './styles/variables.scss';

#app {
  background-color: var(--v-background-base);
}
</style> -->
