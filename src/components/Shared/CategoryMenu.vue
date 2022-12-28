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
              v-if="itemIsUncategorized"
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
          <v-card-title class="ma-0 pa-0" v-if="!itemIsUncategorized">
            {{ masterCategoryName }}: {{ selectedCategoryName }}
          </v-card-title>
          <v-card-title class="ma-0 pa-0" v-else>
            {{ selectedCategoryName }}
          </v-card-title>
        </v-card>
        <div v-else></div>
      </v-tooltip>
    </template>
    <category-select @selected="onSelected" :show-balance="showBalance"/>
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
    // item: {
    //   required: true,
    //   type: Object,
    // },
    categoryId: {
      required: true,
      type: String,
    },
    splits: {
      required: false,
      type: Array,
      default: () => [],
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
    showBalance: {
      type: Boolean,
      required: false,
      default: false,
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
      const id = this.categoryId;
      const color = this.categoryColors[id];
      if (color === undefined) {
        return NONE.hexColor;
      }
      return color;
    },
    selectedCategoryName() {
      const id = this.categoryId;
      const category = this.categoriesById[id];
      if (category === undefined) {
        return NONE.name;
      }
      return category.name;
    },
    masterCategoryName() {
      const id = this.categoryId;
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
    itemIsUncategorized() {
      return isUncategorized({ categoryId: this.categoryId, splits: this.splits } );
    },
  },
  methods: {
    onSelected(categoryId) {
      const id = categoryId.slice(-ID_LENGTH.category);
      if (id !== this.categoryId) {
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
