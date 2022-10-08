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
    <v-card max-height="80vh" color="background">
      <v-row>
        <v-col class="ma-2">
          Search
          <v-text-field
            flat
            solo
            autofocus
            hide-details
            ref="search"
            v-model="search"
            background-color="background lighten-2"
            class="text-body-1"
          />
        </v-col>
      </v-row>
      <!-- <v-divider /> -->
      <v-list dense subheader color="background">
        <template v-for="[masterId, categories] in Object.entries(searchedMasterCategories)">
          <v-subheader class="master-category-list-item text-h5" v-bind:key="masterId">
            {{ listMasterCategoryName(masterId) }}
          </v-subheader>
          <v-list-item
            class="category-list-item"
            v-for="category in categories"
            :key="`master-${category._id}`"
            @click="onCategorySelected(category)"
          >
            <v-list-item-content :key="`category-${category._id}`">
              <v-row class="pa-0 ma-0">
                <v-sheet width="3px" height="15px" :color="categoryColor(category)" class="mr-1" />
                <v-col class="pa-0 ma-0">
                  {{ category.name }}
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            dense
            class="category-list-item"
            v-if="showAddCategory(masterId)"
            :key="`add-${masterId}`"
            @click="onCategoryAdd(masterId)"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-row class="pa-0 ma-0">
                  <v-sheet
                    width="3px"
                    height="15px"
                    :color="masterCategoryColor(masterId)"
                    class="mr-1"
                  />
                  <v-col class="ma-0 pa-0">
                    Add '{{ search }}' to {{ listMasterCategoryName(masterId) }}
                  </v-col>
                </v-row>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { nextTick } from "vue";
import SelectCategory from "./SelectCategory.vue";
import CategoryChip from "./CategoryChip.vue";
import { ID_LENGTH, NONE, HIDDEN } from "../../constants";

export default {
  emits: ["selected"],
  components: { SelectCategory, CategoryChip },
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
    ...mapGetters([
      "categoryColors",
      "categoriesById",
      "masterCategoriesById",
      "categoriesByMaster",
      "masterCategoriesById",
    ]),
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    // itemId() {
    //   return this.item._id.slice(-ID_LENGTH.transaction);
    // },
    // masterCategoryName() {
    //   console.log("MASTER CATEGORY NAME", this.item);
    //   const category_id = this.item.category;
    //   const category = this.categoriesById[category_id];

    //   if (category === undefined) {
    //     return "";
    //   }
    //   const master_id = category.masterCategory;
    //   const master_category = this.masterCategoriesById[master_id];

    //   if (master_category === undefined) {
    //     return "";
    //   }

    //   return master_category.name;
    // },
    searchedMasterCategories() {
      const search = this.search.toLowerCase();
      return Object.entries(this.categoriesByMaster).reduce((partial, [masterId, categories]) => {
        if ([HIDDEN._id, "undefined"].includes(masterId)) {
          return partial;
        }
        if (search) {
          const filteredCategories = categories.filter((category) =>
            category.name.toLowerCase().includes(search)
          );
          partial[masterId] = filteredCategories;
        } else {
          partial[masterId] = categories;
        }
        return partial;
      }, {});
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_CATEGORY"]),
    ...mapActions("accountTransactions", ["editTransaction", "getTransactions"]),
    ...mapActions(["createCategory"]),
    // onItemClick() {
    //   this.$emit("expand");
    //   this.editTransaction(this.item);
    //   let element;
    //   nextTick()
    //     .then(() => {
    //       element = document.getElementById("category-input").getElementsByTagName("input")[0];
    //       element.focus();
    //       return nextTick();
    //     })
    //     .then(() => {
    //       element.select();
    //     });
    // },
    // onCategoryUpdate(category_id) {
    //   this.SET_EDITED_TRANSACTION_CATEGORY(category_id);
    // },
    isUncategorized(item) {
      return item.category === NONE._id;
    },
    isSplits(item) {
      return item.splits && Array.isArray(item.splits) && item.splits.length > 0;
    },
    onCategorySelected(category) {
      if (category._id.slice(-ID_LENGTH.category) === this.item.category) {
        return;
      }
      this.selectCategory(category._id);
    },
    selectCategory(categoryId) {
      this.$emit('selected', {item: this.item, categoryId: categoryId.slice(-ID_LENGTH.category)});
      // const current = { ...this.item, category: categoryId.slice(-ID_LENGTH.category) };
      // const previous = this.item;
      // this.commitDocToPouchAndVuex({ current, previous }).then(() => {
      //   this.getTransactions();
      // });
      this.menu = false;
    },
    onCategoryAdd(masterId) {
      this.createCategory({ name: this.search, master_id: masterId }).then((category_id) => {
        this.selectCategory(category_id);
      });
    },
    listMasterCategoryName(masterId) {
      return _.get(this.masterCategoriesById, [masterId, "name"], "Undefined");
    },
    showAddCategory(masterId) {
      if (this.search.length < 1) {
        return false;
      }
      return ![NONE._id].includes(masterId);
    },
    categoryColor(category) {
      return this.categoryColors[category._id.slice(-ID_LENGTH.category)];
    },
    masterCategoryColor(master_id) {
      return _.get(this, ["masterCategoriesById", master_id, "color", "hex"], "transparent");
    },
  },
};
</script>

<style>
.v-subheader.master-category-list-item {
  height: 20px;
}

.v-list-item.category-list-item {
  min-height: 20px;
}

.v-list-item.category-list-item .v-list-item__content {
  padding: 2px 5px;
}
</style>
