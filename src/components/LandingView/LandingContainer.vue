<template>
  <v-overlay opacity="1" z-index="9000" color="background" id="landing-page-overlay">
    <v-container>
      <div class="landing-page">
        <v-icon icon dark color="primary" size="50">{{ icon }} </v-icon>
        <div class="text-h4 mb-4" style="color: var(--v-primary-base)">{{ title }}</div>
        <router-view></router-view>
        <div style="width: 100%; display: flex; flex-direction: row" class="mt-3">
          <landing-button
            v-if="!isLandingPage"
            label="Back"
            icon="mdi-arrow-left"
            :to="{ path: '/landing' }"
            width="80px"
          />
        </div>
      </div>
    </v-container>
  </v-overlay>
</template>

<script>
import LandingButton from './LandingButton.vue'

export default {
  components: {
    LandingButton
  },
  data() {
    return {
      titleData: {
        landing: {
          title: 'No budget loaded',
          icon: 'mdi-file-outline'
        },
        new: {
          title: 'Create new budget',
          icon: 'mdi-file-plus-outline'
        },
        restore: {
          title: 'Load budget from backup',
          icon: 'mdi-folder-upload-outline'
        },
        sync: {
          title: 'Sync with cloud account',
          icon: 'mdi-cloud-sync-outline'
        }
      }
    }
  },
  name: 'LandingContainer',
  computed: {
    title() {
      return this.titleData[this.$route.name].title
    },
    icon() {
      return this.titleData[this.$route.name].icon
    },
    isLandingPage() {
      return this.$route.name === 'landing'
    }
  }
}
</script>

<style>
/* #landing-page-overlay {
  width: 100%;

} */

#landing-page-overlay .v-overlay__content {
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.landing-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
}
.center-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
