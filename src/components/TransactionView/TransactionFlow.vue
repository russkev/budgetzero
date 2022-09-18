<template>
  <div v-if="item._id !== editedTransaction._id" @click="onItemClick">
    {{ itemValue }}
  </div>
  <div v-else>
    <select-amount-transaction 
      :is-outflow="isOutflow"
      :data-testid="testId"
      :id="inputId"
      :edited-item="editedTransaction"
      @update="onEditUpdate"
      @save="save(item)"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { nextTick } from "vue";
import SelectAmountTransaction from './SelectAmountTransaction.vue';

export default {
  components: { SelectAmountTransaction },
  props: {
    item: {
      type: Object
    },
    isOutflow: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      inputId: this.isOutflow ? "outflow-input" : "inflow-input",
      testId: this.isOutflow ? "edit-row-outflow" : "edit-row-inflow",
    }
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    ...mapGetters(["intlCurrency"]),
    itemId() {
      return this.item._id.slice(-ID_LENGTH.transaction)
    },
    itemValue() {
      if (this.isOutflow && this.item.value < 0) {
        return this.intlCurrency.format(-this.item.value / 100)
      } else if (!this.isOutflow && this.item.value > 0) {
        return this.intlCurrency.format(this.item.value / 100)
      } else {
        return ""
      }
    }
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_VALUE"]),
    ...mapActions("accountTransactions", ["editTransaction", "save"]),

    onItemClick() {
      this.$emit("expand")
      this.editTransaction(this.item)
      let element
      nextTick()
        .then(() => {
          element = document.getElementById(this.inputId).getElementsByTagName('input')[0]
          element.focus()
          return nextTick()
        })
        .then(() => {
          element.select()
        })
    },
    onEditUpdate(value) {
      this.SET_EDITED_TRANSACTION_VALUE(value)
    }
  }
}
</script>