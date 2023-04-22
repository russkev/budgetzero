<template>
  <v-card flat color="background lighten-2" class="pa-2 mb-4">
    <delete-confirm @confirm="onDeleteLocalDatabase" titleText="Delete Database">
      <template #body>
        <div>
          <strong> Are you want to sure you want to delete the entire local database? </strong>
        </div>
        <div class="mt-3">
          This will delete the cached database but will leave the cloud data intact. If the sync address is valid, the
          database will automatically be re-downloaded.
        </div>
      </template>
      <template #activator="{ on }">
        <button-transparent
          icon="mdi-delete"
          :on="on"
          data-testid="delete-local-db-button"
          :disabled="!budgetExists"
          color="error lighten-2"
        >
          Delete local database
        </button-transparent>
      </template>
    </delete-confirm>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DeleteDB',
  computed: {
    ...mapGetters(['budgetExists'])
  },
  methods: {
    ...mapActions(['deleteLocalDatabase']),

    onDeleteLocalDatabase() {
      this.deleteLocalDatabase()
    }
  }
}
</script>
