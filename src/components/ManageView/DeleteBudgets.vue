<template>
  <v-card flat color="background lighten-2" class="pa-2 mb-4">
    <delete-confirm @confirm="onDeleteLocalDatabase" titleText="Delete Database">
      <!-- bodyText="Are you want to sure you want to delete the entire local database?<br>This will delete the cached database but will leave the cloud data intact" -->
      <template #body>
        <div>
          <strong> Are you want to sure you want to delete the entire local database? </strong>
        </div>
        <div class="mt-3">This will delete the cached database but will leave the cloud data intact</div>
      </template>
      <template #activator="{ on }">
        <button-transparent icon="mdi-delete" :on="on" data-testid="delete-local-db-button">
          Delete local database
        </button-transparent>
      </template>
    </delete-confirm>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'DeleteDB',
  methods: {
    ...mapActions(['deleteLocalDatabase']),

    onDeleteLocalDatabase() {
      this.deleteLocalDatabase()
    }
  }
}
</script>
