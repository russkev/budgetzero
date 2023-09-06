<template>
  <div class="center-cluster">
    <!-- <v-btn :to="{ name: 'LandingNew' }">Button</v-btn> -->
    <landing-button
      icon="mdi-file-plus-outline"
      label="Create New Budget"
      data-testid="create-new-budget-button"
      autofocus
      :to="{ name: 'LandingNew' }"
    />
    <!-- <v-btn width="240" class="mb-2" data-testid="landing-button" :to="{ name: 'LandingNew' }" @click="onClick">
      <v-icon left>mdi-file-plus-outline</v-icon>
      Create New Budget
    </v-btn> -->
    <!-- <v-btn
      text
      class="no-uppercase justify-start test-h5"
      :width="240"
      v-on="on"
      v-bind="attrs"
      @click="onClick"
      exact
      :to="{ name: 'LandingNew' }"
      :loading="false"
      :disabled="false"
    >
      <v-icon left :size="iconSize"> mdi-file-plus-outline </v-icon>
      Create New Budget
    </v-btn> -->
    <!-- to="/landing/new/" -->

    <!-- <details-button
      icon="mdi-file-plus-outline"
      label="Create New Budget"
      data-testid="create-new-budget-button"
      width="240"
      :to="{ name: 'LandingNew' }"
    /> -->
    <landing-button
      icon="mdi-folder-upload-outline"
      label="Load budget from backup"
      data-testid="restore-budget-button"
      :to="{ name: 'LandingRestore' }"
    />
    <landing-button
      icon="mdi-cloud-sync-outline"
      label="Sync with cloud account"
      data-testid="sync-budget-button"
      :to="{ name: 'LandingCloudSync' }"
    />
    <!-- to="/landing/sync" -->
  </div>
</template>

<script>
import DetailsButton from '../Shared/DetailsButton.vue'
import LandingButton from './LandingButton.vue'

export default {
  name: 'LandingPage',
  components: {
    LandingButton,
    DetailsButton
  },
  methods: {
    onClick(event) {
      console.log('clicked')
    }
  }
}
</script>
