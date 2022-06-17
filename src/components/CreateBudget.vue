<template>
  <v-col xs4 align="center">
    <v-card max-width="400">
      <v-card-title class="primary white--text pb-4">
        <span class="title">Create Budget</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pb-0">
        <slot name="body">
          <v-text-field v-model="budgetName" id="budgetName" label="Name" required />
          <v-checkbox v-model="use_default_budget" id="useDefaultBudget" label="Use default budget categories?" />
        </slot>
      </v-card-text>

      <v-divider />

      <v-card-actions class=" white--text">
        <v-spacer />
        <slot name="actions">
          <v-btn color="accent" id="btn-createBudget" @click="createBudget()">
            Create
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      budgetName: null,
      use_default_budget: false,
    }
  },
  methods: {
    async createBudget() {
      this.$store.dispatch('createBudget', {name: this.budgetName, use_default: this.use_default_budget})
        .then(() => {
          this.$root.$confirm('Budget Created!', `A budget named ${this.budgetName} has been created!`, {
            onlyShowAgreeBtn: true,
            agreeBtnColor: 'accent',
            agreeBtnText: 'Ok'
          })
        })
        .then(() => {
          const year_month = new Date().toISOString().substring(0, 7)
          this.$router.push({path: `/budget/${year_month}`})
        })
        .catch((error) => {
          console.log(error.message)
        })
    }
  }
}
</script>
