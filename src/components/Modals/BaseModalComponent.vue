<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-card color="background">
      <v-card-title class="primary darken-3 pa-3 mb-4">
        <span class="title"><slot name="title" /></span>
      </v-card-title>

      <v-card-text class="pb-0">
        <slot name="body">
          <v-text-field v-model="itemName" label="Name" required />
        </slot>
      </v-card-text>

      <v-card-actions class="white--text">
        <v-spacer />
        <slot name="actions">
          <v-btn text @click="$emit('cancel')" data-testid="btn-modal-cancel">
            {{ cancelLabel }}
          </v-btn>
          <v-btn color="primary darken-3" :elevation="0" data-testid="btn-modal-confirm" @click="$emit('confirm')">
            {{ confirmLabel }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  emits: ['cancel', 'confirm'],
  props: {
    cancelLabel: {
      type: String,
      default: 'Cancel'
    },
    confirmLabel: {
      type: String,
      default: 'Confirm'
    }
  },
  data() {
    return {
      itemName: '',
      valid: true
    }
  },
  computed: {
    ...mapState(['selectedBudgetId'])
  },
  methods: {
    close() {
      this.show = false
      this.itemName = ''
    },
    create() {
      this.$emit('create', this.itemName)
      this.close()
    }
  }
}
</script>
