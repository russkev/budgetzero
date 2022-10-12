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
    <v-card color="background">

      <v-alert text color="error" icon="mdi-alert-circle" type="error">
        <h3 class="text-h4 error--text text--lighten-1">Delete Transaction</h3>
      </v-alert>
      <v-card-text>
        <span class="text-body-1">Are you sure you want to delete this transaction?</span>
      </v-card-text>
      <v-card-actions>

        <v-spacer />
        <v-btn text @click="onCancel">Cancel</v-btn>
        <v-btn 
          color="primary darken-2"
          elevation="0"
          @click="onConfirm"
        >
          <span>Confirm</span>
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
    onConfirm() {
      this.$emit("confirm");
      this.show = false
    },
    onCancel() {
      this.show = false;
    },
  },
}
</script>