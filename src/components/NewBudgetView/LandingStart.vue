<template>
  <div class="center-cluster">
    <landing-button icon="mdi-file-plus-outline" label="Create New Budget" to="/landing/new" />
    <landing-button icon="mdi-folder-upload-outline" label="Load budget from backup" to="/landing/restore" />
    <landing-button icon="mdi-cloud-sync-outline" label="Sync with cloud account" to="/landing/sync" />
  </div>
</template>

<script>
import LandingButton from './LandingButton.vue'

export default {
  name: 'LandingPage',
  components: {
    LandingButton
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
