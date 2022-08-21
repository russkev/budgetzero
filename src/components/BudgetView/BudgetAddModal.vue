<template>
  <base-dialog-modal-component v-model="show">
    <template #title>
      Let's get started!
    </template>
    <template #body>
      <v-text-field id="budget-name-field" v-model="budget_name" required label="Budget name"/>
      <v-checkbox id="budget-use-default-categories" v-model="use_default_categories" label="Use default categories?" />
    </template>
    <template #actions>
      <v-spacer />
      <v-btn id="budget-create" @click="createBudget()" :loading="create_budget_is_loading">
        Create Budget
      </v-btn>
    </template>
  </base-dialog-modal-component>
</template>

<script>
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'

export default {
  name: 'BudgetAddModal',
  components: {
    BaseDialogModalComponent
  },
  // props: ['value'],
  props: {
    value: Boolean
  },
  data() {
    return {
      budget_name: "",
      use_default_categories: false,
      create_budget_is_loading: false,
    }
  },

  methods: {
    async createBudget() {
      this.create_budget_is_loading = true
      this.$store
        .dispatch('createBudget', {name: this.budget_name, use_default: this.use_default_categories})
        .then(() => {
          this.create_budget_is_loading = false
          this.$emit('input', false)
          return this.$root.$confirm('Budget Created!', `A budget named ${this.budget_name} has been created!`, {
            onlyShowAgreeBtn: true,
            agreeBtnColor: 'accent',
            agreeBtnText: 'Ok'
          })
        })
        .finally(() => {
          this.create_budget_is_loading = false
          this.$emit('input', false)
        })
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },

}
</script>