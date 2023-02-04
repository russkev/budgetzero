<template>
  <div>
    <v-container fluid class="py-0">
      <page-heading title="Budgets" />
      <v-sheet max-width="800px" justify="center" id="budgets-container-sheet" class="mx-auto pa-2" color="transparent">
        <div class="transaction-details-grid pa-2 pb-0 mt-3">
          <div class="text-h5">Backup</div>
          <div>
            <div class="budgets-details">
              <div class="mb-2">Backup all budgets to the hard drive</div>
              <!-- <v-btn text width="min-content" @click="onBackup"><v-icon left>mdi-content-save</v-icon>Do Backup</v-btn> -->
              <button-transparent icon="mdi-content-save" @click="onBackup">Do Backup</button-transparent>
              Last backup: {{ lastBackupDate ? lastBackupDate : 'None recorded' }}
              <!-- {{ lastBackupDate ? `Last backup: ${lastBackupDate}` : '' }} -->
            </div>
          </div>
          <div class="text-h5">Restore</div>
          <div>
            <!-- <v-btn @click="onRestore">Restore</v-btn> -->
            <button-transparent icon="mdi-file-restore" @click="onRestore">Restore</button-transparent>
          </div>
          <div class="text-h5">Cloud</div>
          <div>
            <!-- <v-btn @click="onSync">Sync with cloud</v-btn> -->
            <button-transparent icon="mdi-cloud-sync" @click="onSync">Sync with cloud</button-transparent>
          </div>
          <div class="text-h5">Debugging</div>
          <div>
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header>Log</v-expansion-panel-header>

                <v-expansion-panel-content>
                  <v-list>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Log</v-list-item-title>
                        <v-list-item-subtitle>View log</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon>
                          <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import PageHeading from '../Shared/PageHeading.vue'
import ButtonTransparent from '../Shared/ButtonTransparent.vue'

export default {
  name: 'Budgets',
  components: {
    PageHeading,
    ButtonTransparent
  },
  props: {},
  data() {
    return {}
  },
  computed: {
    lastBackupDate() {
      return localStorage.getItem('lastBackup')
    }
  },
  methods: {
    ...mapActions(['exportBudgetAsJSON']),
    onBackup() {
      this.exportBudgetAsJSON()
      // this.$store.dispatch('backup')
      console.log('Backup')
    },
    onRestore() {
      // this.$store.dispatch('restore')
      console.log('Restore')
    },
    onSync() {
      console.log('sync')
    }
  }
}
</script>

<style>
.budgets-details {
  display: flex;
  flex-direction: column;
}
</style>
