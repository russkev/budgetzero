<template>
  <base-dialog-modal-component v-model="show">
    <template #title>
      Let's get started!
    </template>
    <template #body>
      <v-text-field v-model="budget_name" required label="Budget name"/>
      <v-checkbox v-model="use_default_categories" label="Use default categories?" />
    </template>
    <template #actions>
      <v-spacer />
      <v-btn @click="createBudget()" :loading="create_budget_is_loading">
        Create Budget
      </v-btn>
    </template>
  </base-dialog-modal-component>
</template>

<script>
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
// import BaseDialogModalComponent from './components/Modals/BaseDialogModalComponent.vue'
import moment from 'moment'

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
        .finally(() => {
          this.create_budget_is_loading = false
        })
      // this.createBudgetIsLoading = true
      // await this.$store.dispatch('loadLocalBudget')
      // await this.$store.dispatch('createBudget', {name: this.budgetName, use_default: this.useDefaultCategories})
      // this.createBudgetIsLoading = false
      // if (
      //   await this.$root.$confirm('Budget Created!', `A budget named ${this.budgetName} has been created!`, {
      //     onlyShowAgreeBtn: true,
      //     agreeBtnColor: 'accent',
      //     agreeBtnText: 'Ok'
      //   })
      // ) {
      //   if(!this.$router.history.current.path.startsWith('/budget')) {
      //     const year_month =  moment(new Date()).format('YYYY-MM')
      //     this.$router.push({ path: `/budget/${year_month}` })
      //   }
      // }
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