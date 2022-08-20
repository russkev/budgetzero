<template>
  <v-dialog v-model="show" max-width="500px">
    <BaseModalComponent :item="editedItem" @confirm="deleteItem(editedItem)">
      <template #title>
        <span v-if="!editedItem._id">Add Account</span>
        <span v-else>Edit Account</span>
      </template>
      <template #body>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                id="nameField"
                v-model="editedItem.name"
                label="Account Name"
                :rules="nameRules"
                data-cy="account-name"
              />
            </v-col>
            <v-col cols="4">
              <v-select
                id="typeField"
                v-model="editedItem.type"
                :items="['CHECKING', 'CREDIT', 'SAVING', 'MORTGAGE', 'CASH', 'INVESTMENT', 'OTHER']"
                label="Type"
                data-cy="account-type"
                :rules="typeRules"
                @change="accountTypeChanged"
              />
            </v-col>
            <v-col cols="4">
              <v-switch
                id="onBudgetSwitch"
                v-model="editedItem.onBudget"
                label="On Budget?"
                data-cy="account-on-budget"
              />
            </v-col>
            <v-col cols="4">
              <v-switch id="balanceIsNegativeSwitch" v-model="isNegative" label="Invert Balance" />
              <span>(generally for credit card accounts)</span>
            </v-col>

            <v-col cols="12">
              <v-textarea
                id="noteField"
                v-model="editedItem.note"
                auto-grow
                dense
                label="Notes"
                rows="3"
                data-cy="account-notes"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-if="!editedItem.hasOwnProperty('_id')"
                id="startingBalanceField"
                v-model="editedItem.initialBalance"
                label="Starting Balance"
                prefix="$"
                data-cy="account-starting-balance"
              />
            </v-col>
          </v-row>
        </v-form>
      </template>
      <template #actions>
        <v-btn text id="cancelAccountBtn" @click="close()">
          Cancel
        </v-btn>
        <v-btn id="saveAccountBtn" color="accent" @click="save()">
          Save
        </v-btn>
      </template>
    </BaseModalComponent>
  </v-dialog>
</template>

<script>
import BaseModalComponent from './../Modals/BaseModalComponent.vue'

export default {
  name: 'AccountAddModal',
  components: {
    BaseModalComponent
  },
  props: ['value', 'editedItem'],
  data: () => ({
    nameRules: [v => !!v || 'Name is required', v => (v && v.length <= 200) || 'Name must be less than 200 characters'],
    typeRules: [v => !!v || 'Type is required'],
    selectTrueFalse: [
      {
        value: true,
        text: 'Yes'
      },
      {
        value: false,
        text: 'No'
      }
    ],
    valid: false
  }),
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    isNegative: {
      get() {
        return this.editedItem.sign < 0 ? true : false
      },
      set(value) {
        this.editedItem.sign = value ? -1 : 1
      }
    }
  },

  methods: {
    accountTypeChanged() {
      if (this.editedItem.type == 'CREDIT') {
        this.editedItem.sign = -1
      } else {
        this.editedItem.sign = 1
      }
    },
    close() {
      this.show = false
      this.$emit('closeModal')
    },
    save() {
      this.$refs.form.validate()
      if (this.valid) {
        this.$emit('save')
        this.close()
      }
    }
  }
}
</script>
