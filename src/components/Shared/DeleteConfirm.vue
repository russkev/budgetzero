<template>
  <v-dialog max-width="300px" v-model="show">
    <template #activator="{ on }">
      <slot name="activator" :on="on" :open="show">
        <v-btn v-on="on" color="error" icon data-testid="delete-button" />
      </slot>
    </template>
    <v-card color="background">
      <v-alert text color="error" icon="mdi-alert-circle" type="error">
        <h3 class="text-h4 error--text text--lighten-1">{{titleText}}</h3>
      </v-alert>
      <v-card-text>
        <span class="text-body-1">{{bodyText}}</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn data-testid="delete-cancel-button" text @click="onCancel">Cancel</v-btn>
        <v-btn
          data-testid="delete-confirm-button"
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
  props: {
    titleText: {
      type: String,
      default: "Delete Transaction",
    },
    bodyText: {
      type: String,
      default: "Are you sure you want to delete this transaction?",
    },
  },
  methods: {
    onConfirm() {
      this.$emit("confirm");
      this.show = false;
    },
    onCancel() {
      this.show = false;
    },
  },
};
</script>
