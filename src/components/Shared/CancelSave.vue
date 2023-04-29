<template>
  <div>
    <v-btn :data-testid="cancelId" text small @click="onCancel"> {{ cancelText }} </v-btn>
    <v-btn
      :data-testid="saveId"
      small
      elevation="0"
      color="primary darken-3"
      class="ml-2"
      @click="onSave"
      :disabled="saveDisabled"
    >
      {{ saveText }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'CancelSave',
  props: {
    cancelId: {
      type: String,
      default: 'cancel-edit-button'
    },
    saveId: {
      type: String,
      default: 'save-edit-button'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    saveText: {
      type: String,
      default: 'Save'
    },
    saveDisabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onCancel() {
      this.$emit('cancel')
    },
    onSave() {
      this.$emit('save')
    }
  }
}
</script>
