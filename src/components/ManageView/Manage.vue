<template>
  <div>
    <v-container fluid class="py-0">
      <page-heading title="Budgets" />
      <v-sheet max-width="800px" justify="center" id="budgets-container-sheet" class="mx-auto pa-2" color="transparent">
        <div class="transaction-details-grid pa-2 pb-0 mt-3">
          <div class="text-h5">Backup</div>
          <div>
            <backup />
          </div>
          <div class="text-h5">Restore</div>
          <div>
            <restore />
          </div>
          <div class="text-h5">Cloud</div>
          <div><cloud-sync /></div>
          <div class="text-h5">Danger</div>
          <div>
            <delete-budgets />
          </div>
        </div>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import PageHeading from '../Shared/PageHeading.vue'
import ButtonTransparent from '../Shared/ButtonTransparent.vue'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import StringInput from '../Shared/StringInput.vue'
import Restore from './Restore.vue'
import Backup from './Backup.vue'
import CloudSync from './CloudSync.vue'
import DeleteBudgets from './DeleteBudgets.vue'

export default {
  name: 'Budgets',
  components: {
    PageHeading,
    ButtonTransparent,
    DeleteConfirm,
    StringInput,
    Restore,
    Backup,
    CloudSync,
    DeleteBudgets
  }
}
</script>

<style>
.budgets-details {
  display: flex;
  flex-direction: column;
}

#budgets-container-sheet .v-input__prepend-outer {
  margin-top: 4px;
}

#budgets-container-sheet .v-input__icon button {
  color: unset;
  caret-color: unset;
}

#budgets-container-sheet .v-input__icon {
  min-width: 18px;
  width: 18px;
}

#budgets-container-sheet .v-input__icon .v-icon {
  font-size: 18px;
}

#budgets-container-sheet .v-btn {
  text-transform: unset;
}

.manage-card {
  width: 100%;
}

/* #budgets-container-sheet .sync-stats > div:nth-child(2n + 1) {
  text-align: right;
} */
</style>
