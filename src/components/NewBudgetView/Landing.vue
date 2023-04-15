<template>
  <v-container>
    <div class="landing-page">
      <div class="center-cluster">
        <v-icon icon dark color="primary" size="100"> mdi-file-outline </v-icon>
        <div class="text-h4 mb-4" style="color: var(--v-primary-base)">No Budget Loaded</div>
        <landing-page-button icon="mdi-file-plus-outline" label="Create New Budget" @click="onCreateNewBudget" />
        <landing-page-button icon="mdi-folder-upload-outline" label="Load budget from backup" @click="onLoadBudget" />
        <landing-page-button icon="mdi-cloud-sync-outline" label="Sync with cloud account" @click="onSyncWithCloud" />
      </div>
    </div>
    <span class="text-red">sdf</span>
  </v-container>
</template>

<script>
import LandingPageButton from './LandingPageButton.vue'

export default {
  name: 'LandingPage',
  components: {
    LandingPageButton
  },
  methods: {
    onCreateNewBudget() {
      console.log('create new budget')
    },
    onLoadBudget() {
      console.log('load budget')
    },
    onSyncWithCloud() {
      console.log('sync with cloud')
    }
  }
}
</script>

<style>
.landing-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.center-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
