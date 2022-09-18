<template>
  <div v-if="item._id !== editedTransaction._id" class="text-truncate" @click="onItemClick">
    <span class="row-category font-weight-medium">
      {{ item.category_name }}
    </span>
    <br />
    <span class="row-memo text-caption transaction-details">
      {{ item.note ? item.note : item.memo }}
    </span>
  </div>
  <div v-else>
    <select-category
      id="category-input"
      :category-id="item.category"
      @update="onCategoryUpdate"
      :disabled="item.splits.length > 0"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { nextTick } from "vue";
import SelectCategory from "./SelectCategory.vue";
import { ID_LENGTH } from "../../constants";


export default {
  components: { SelectCategory },
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    itemId() {
      return this.item._id.slice(-ID_LENGTH.transaction)
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_CATEGORY"]),
    ...mapActions("accountTransactions", ["editTransaction"]),
    onItemClick() {
      this.$emit("expand");
      this.editTransaction(this.item);
      let element
      nextTick()
        .then(() => {
          element = document.getElementById("category-input").getElementsByTagName('input')[0]
          element.focus();
          return nextTick();
        })
        .then(() => {
          element.select();
        });
    },
    onCategoryUpdate(category_id) {
      this.SET_EDITED_TRANSACTION_CATEGORY(category_id);
    },
  },
};
</script>
