<template>
  <div class="center-cluster">
    <landing-button
      icon="mdi-file-plus-outline"
      label="Create New Budget"
      data-testid="create-new-budget-button"
      autofocus
    />
    <!-- to="/landing/new" -->
    <landing-button
      icon="mdi-folder-upload-outline"
      label="Load budget from backup"
      data-testid="restore-budget-button"
    />
    <!-- to="/landing/restore" -->
    <landing-button icon="mdi-cloud-sync-outline" label="Sync with cloud account" data-testid="sync-budget-button" />
    <!-- to="/landing/sync" -->
  </div>
</template>

<script>
import LandingButton from './LandingButton.vue'

export default {
  name: 'LandingPage',
  components: {
    LandingButton
  }
}
</script>
