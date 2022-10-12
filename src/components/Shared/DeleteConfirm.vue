<template>
  <v-dialog max-width="300px" v-model="show">
    <template #activator="{ on }">
      <slot name="activator" :on="on" :open="show">
        <v-btn
          v-on="on"
          color="error"
          icon
          data-testid="delete-button"
        />
      </slot>
    </template>
    <v-card >
      <v-card-title class="headline">Delete Transaction</v-card-title>
      <v-card-text>
        Are you sure you want to delete this transaction?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          text
          data-testid="delete-confirm-button"
          @click="onDelete"
        >
          Delete
        </v-btn>
        <v-btn
          color="primary"
          text
          data-testid="delete-cancel-button"
          @click="onCancel"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  data() {
    return {
      show: false,
    };
  },
  methods: {
    onDelete() {
      console.log("Delete");
      // this.$emit("delete");
    },
    onCancel() {
      console.log("Cancel");
      this.show = false;
      // this.$emit("cancel");
    },
  },
}
</script>