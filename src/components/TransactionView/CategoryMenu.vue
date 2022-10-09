<template>
    <v-menu
      v-model="menu"
      origin="top left"
      :close-on-content-click="false"
      offset-y
    >
      <template #activator="{on}">
        <category-chip
          :on="on"
          :item="item"
        />
      </template>
      <category-select @selected="onSelected" />
    </v-menu>
</template>

<script>
import { mapGetters } from "vuex";
import CategoryChip from "./CategoryChip.vue";
import { ID_LENGTH } from "../../constants";
import CategorySelect from "./CategorySelect.vue";

export default {
  emits: ["selected"],
  components: { CategoryChip, CategorySelect },
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
  computed: {
    ...mapGetters(["categoryColors", "categoriesById"]),    
  },
  methods: {
    onSelected(categoryId) {
      console.log("onSelected", categoryId);
      const id = categoryId.slice(-ID_LENGTH.category);
      if (id !== this.item.category) {
        this.$emit("selected", id );
      }
      this.menu = false;
    },
  },
};
</script>

