<template>
  <v-menu
    v-model="menu"
    origin="top left"
    :close-on-content-click="false"
    offset-y
  >
    <template #activator="{on}">
      <category-chip
        :item="item"
        :on="on"
      />
    </template>
    <transaction-category-select @selected="onSelected" />
  </v-menu>
</template>

<script>
import CategoryChip from "./CategoryChip.vue";
import { ID_LENGTH, } from "../../constants";
import TransactionCategorySelect from "./TransactionCategorySelect.vue";

export default {
  emits: ["selected"],
  components: { CategoryChip, TransactionCategorySelect, },
  props: {
    item: {
      type: Object,
    },
  },
  data() {
    return {
      menu: false,
      search: "",
    };
  },
  methods: {
    onSelected(categoryId) {
      const id = categoryId.slice(-ID_LENGTH.category);
      if (id !== this.item.category) {
        this.$emit('selected', {item: this.item, categoryId: id});
      }
      this.menu = false;
    },
  },
};
</script>