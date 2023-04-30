<template>
  <v-card flat color="background lighten-2" class="pa-2 mb-4">
    <div class="budgets-details">
      <div class="mb-2">Backup all budgets to the hard drive</div>
      <button-transparent icon="mdi-content-save" @click="onBackup" data-testid="do-backup-button">
        Do Backup
      </button-transparent>
      <div>Last backup:</div>
      <span data-testid="last-backup-time" style="font-size: 10px">{{
        lastBackupTime ? lastBackupTime : 'None recorded'
      }}</span>
    </div>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Backup',
  props: {},
  beforeMount() {
    this.updateBackupTime()
  },
  data() {
    return {
      lastBackupTime: null
    }
  },
  computed: {},
  methods: {
    ...mapActions(['exportBudgetAsJSON']),
    async onBackup() {
      await this.exportBudgetAsJSON()
      this.updateBackupTime()
    },
    updateBackupTime() {
      this.lastBackupTime = localStorage.getItem('lastBackup')
    }
  }
}
</script>
