<template>
  <div>
    <v-btn :data-testid="cancelId" text small @click="onCancel"> Cancel </v-btn>
    <v-btn :data-testid="saveId" small elevation="0" color="primary darken-3" class="ml-2" @click="onSave">
      Save
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
