<template>
  <div class="center-cluster">
    <landing-button
      icon="mdi-file-plus-outline"
      label="Create New Budget"
      to="/landing/new"
      data-testid="create-new-budget-button"
      autofocus
    />
    <landing-button
      icon="mdi-folder-upload-outline"
      label="Load budget from backup"
      to="/landing/restore"
      data-testid="restore-budget-button"
    />
    <landing-button
      icon="mdi-cloud-sync-outline"
      label="Sync with cloud account"
      to="/landing/sync"
      data-testid="sync-budget-button"
    />
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
