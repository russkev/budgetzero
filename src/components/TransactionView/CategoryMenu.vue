<template>
  <v-menu offset-y>
    <template #activator="{ on: menuOn }">
      <v-tooltip bottom class="pa-0" color="transparent" :open-delay="500">
        <template #activator="{ on: tooltipOn }">
          <v-chip
            small
            label
            class="category-chip simple-ellipsis pl-0"
            v-on="{ ...tooltipOn, ...menuOn }"
            :color="categoryBackgroundColor"
            :disabled="disabled"
            :data-testid="buttonTestid"
          >
            <v-sheet
              width="5px"
              min-width="5px"
              :color="selectedCategoryColor"
              height="100%"
              class="mr-2"
            />
            <div
              v-if="isUncategorized"
              class="simple-ellipsis info--text text--lighten-1 font-weight-bold"
            >
              {{ selectedCategoryName }}
            </div>
            <div v-else class="simple-ellipsis">
              {{ selectedCategoryName }}
            </div>
          </v-chip>
        </template>
        <v-card v-if="!menu" flat outlined color="outline background" class="ma-0 px-4 py-1">
          <v-card-subtitle class="ma-0 pa-0">
            Category:
          </v-card-subtitle>
          <v-card-title class="ma-0 pa-0" v-if="!isUncategorized">
            {{ masterCategoryName }}: {{ selectedCategoryName }}
          </v-card-title>
          <v-card-title class="ma-0 pa-0" v-else>
            {{ selectedCategoryName }}
          </v-card-title>
        </v-card>
        <div v-else></div>
      </v-tooltip>
    </template>
    <category-select @selected="onSelected" />
  </v-menu>
</template>

<script>
import { mapGetters } from "vuex";
import { ID_LENGTH, NONE } from "../../constants";
import CategorySelect from "./CategorySelect.vue";
import { isUncategorized } from "../../store/modules/transaction-module";

export default {
  emits: ["selected"],
  components: { CategorySelect },
  props: {
    item: {
      type: Object,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    buttonTestid: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      menu: false,
      search: "",
    };
  },
  computed: {
    ...mapGetters(["categoryColors", "categoriesById", "masterCategoriesById"]),
    ...mapGetters("accountTransactions", ["selectedTransactions"]),

    selectedCategoryColor() {
      const id = this.item.category;
      const color = this.categoryColors[id];
      if (color === undefined) {
        return NONE.hexColor;
      }
      return color;
    },
    selectedCategoryName() {
      const id = this.item.category;
      const category = this.categoriesById[id];
      if (category === undefined) {
        return NONE.name;
      }
      return category.name;
    },
    masterCategoryName() {
      const id = this.item.category;
      const category = this.categoriesById[id];
      if (category === undefined || category === null || category.masterCategory === undefined) {
        return NONE.name;
      }
      const masterCategory = this.masterCategoriesById[category.masterCategory];
      if (masterCategory === undefined) {
        return NONE.name;
      }
      return masterCategory.name;
    },
    categoryBackgroundColor() {
      return `${this.selectedCategoryColor}55`;
    },
    isUncategorized() {
      // return this.item.category === undefined || this.item.category === NONE._id;
      return isUncategorized(this.item);
    },
  },
  methods: {
    onSelected(categoryId) {
      const id = categoryId.slice(-ID_LENGTH.category);
      if (id !== this.item.category) {
        this.$emit("selected", id);
      }
      this.menu = false;
    },
  },
};
</script>

<style>
.outline {
  outline: 1px solid var(--v-background-lighten5);
}

.simple-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
