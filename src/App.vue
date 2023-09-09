<template>
  <v-app id="app">
    <v-icon icon="mdi-account" size="200" color="red"></v-icon>
    <v-icon icon="mdi-account" size="x-large"></v-icon>
    <v-icon size="x-large">mdi-account</v-icon>
    <v-icon size="large" icon="mdi-account" ></v-icon>
    <v-avatar color="surface-variant" size="40"></v-avatar>
    <v-progress-circular model-value="20" :size="114"></v-progress-circular>
    <!-- <loading-full-screen :value="isLoadingFullscreen" />
    <confirm-dialog ref="confirm"></confirm-dialog>
    <sidebar />
    <v-main>
      <router-view class="animated" />
    </v-main>
    <v-snackbar v-model="snackbar" :color="snackBarColor">
      {{ snackbarMessage }}

      <template #action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar> -->
    <div>
      HOME PAGE
      <router-view class="animated" />
    </div>
  </v-app>
</template>

<script>
window.global ||= window
import { mapGetters } from 'vuex'
import Sidebar from './components/SidebarView/Sidebar.vue'
import BaseDialogModalComponent from './components/Modals/BaseDialogModalComponent.vue'
import ConfirmDialog from './components/Modals/ConfirmDialog.vue'
import LoadingFullScreen from './components/Shared/LoadingFullScreen.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    BaseDialogModalComponent,
    ConfirmDialog,
    LoadingFullScreen
  },
  data() {
    return {
      drawer: null,
      mini: false
    }
  },
  watch: {
    budgetExists(value) {
      if (value) {
        if (this.targetPage) {
          this.$router.push({ path: this.targetPage })
        } else {
          this.$router.push({ name: 'categories' })
        }
      } else {
        this.$router.push({ name: 'landing' })
      }
    }
  },
  computed: {
    ...mapGetters(['isLoadingFullscreen', 'budgetExists', 'targetPage']),
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
  }
  // mounted() {
  //   this.$root.$confirm = this.$refs.confirm.open
  // }
}
</script>

<style lang="scss">
@import './styles/variables.scss';

#app {
  background-color: var(--v-background-base);
}
html {
  overflow: auto;
}
</style>

<style lang="scss">
.dialog-right-transition {
  &-enter,
  &-leave-to {
    transform: translateX(100%);
  }
}
</style>
