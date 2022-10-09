<template>
  <div class="transaction-categories-container mr-2" :style="`grid-template-columns: ${templateColumns}`">
    <v-menu
      v-for="(dataItem, index) in categoryData"
      v-bind:key="index"
      v-model="dataItem.menu"
      origin="top left"
      :close-on-content-click="false"
      offset-y
    >
      <template #activator="{on}">
        <category-chip
          :on="on"
          :color="dataItem.color"
          :name="dataItem.name"
          :value="dataItem.value"
        />
      </template>
      <category-select @selected="onSelected" />
    </v-menu>
  </div>
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
    categoryData() {
      if (this.item.splits && this.item.splits.length > 1) {
        return this.item.splits.map((split) => {
          const id = split.category;
          const value = split.value;
          let color = this.categoryColors[id] ? this.categoryColors[id] : "grey";
          const name = this.categoriesById[id].name;
          return {
            value,
            color,
            name,
            menu: false,
          };
        });
      } else {
        const id = this.item.category;
        const value = this.item.value;
        const color = this.categoryColors[id]  ? this.categoryColors[id] : "grey";
        const name = this.categoriesById[id].name;
        return [
          {
            value,
            color,
            name,
            menu: false
          },
        ];
      }
    },
    templateColumns() {
      return this.categoryData.length > 1 ? `repeat(${this.categoryData.length}, 1fr)` : "1fr";
    },
  },
  methods: {
    onSelected(categoryId) {
      console.log("onSelected", categoryId);
      const id = categoryId.slice(-ID_LENGTH.category);
      if (id !== this.item.category) {
        this.$emit("selected", { item: this.item, categoryId: id });
      }
      this.menu = false;
    },
  },
};
</script>

<style>
.transaction-categories-container {
  display: grid;
  grid-gap: 0.5rem;
  width: 150px;
}
</style>