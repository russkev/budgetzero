<template>
  <!-- transition="scale-transition" -->
  <v-menu
    v-model="menu"
    origin="top left"
    :close-on-content-click="false"
  >
    <template #activator="{on}">
      <!-- <v-chip
        class="category-chip pl-0"
        small
        label
        pill
        v-on="on"
        :color="categoryBackgroundColor"
      >
        <v-sheet width="5px" :color="selectedCategoryColor" height="100%" class="mr-2" />
        {{ item.category_name }}
      </v-chip> -->
      <category-chip
        :item="item"
        :on="on"
      />
    </template>
    <v-card max-height="80vh" color="background">
      <v-list color="background" class="pa-0 ma-0">
        <v-list-item>
          <!-- <v-sheet width="3px" height="30px" :color="selectedCategoryColor" class="mr-1" />
          <v-list-item-content>
            <v-list-item-title>{{ item.category_name }}</v-list-item-title>
            <v-list-item-subtitle>{{ masterCategoryName }}</v-list-item-subtitle>
          </v-list-item-content> -->
          <category-chip :item="item" />
        </v-list-item>
      </v-list>
      <v-row>
        <v-col class="ma-2">
          <!-- dense -->
          Search
          <!-- solo -->
          <!-- single-line -->
          <!-- rounded -->
          <!-- filled -->
          <v-text-field
            flat
            solo
            autofocus
            hide-details
            ref="search"
            v-model="search"
            background-color="background lighten-2"
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
              <!-- <v-list-item-title>{{ category.name }}</v-list-item-title> -->
              <!-- <span class="text-body2"> -->
              <v-row class="pa-0 ma-0">
                <v-sheet width="3px" height="15px" :color="categoryColor(category)" class="mr-1" />
                <v-col class="pa-0 ma-0">
                  {{ category.name }}
                </v-col>
              </v-row>
              <!-- </span> -->
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
    itemId() {
      return this.item._id.slice(-ID_LENGTH.transaction);
    },
    // selectedCategoryColor() {
    //   const id = this.item.category;
    //   const color = this.categoryColors[id];
    //   if (color === undefined) {
    //     return "grey";
    //   }
    //   return color;
    // },
    // categoryBackgroundColor() {
    //   return `${this.selectedCategoryColor}55`;
    // },
    masterCategoryName() {
      const category_id = this.item.category;
      const category = this.categoriesById[category_id];

      if (category === undefined) {
        return "";
      }
      const master_id = category.masterCategory;
      const master_category = this.masterCategoriesById[master_id];

      if (master_category === undefined) {
        return "";
      }

      return master_category.name;
    },
    searchedMasterCategories() {
      const search = this.search.toLowerCase();

      // if (!search) {
      //   return this.categoriesByMaster;
      // }
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
    ...mapActions(["commitDocToPouchAndVuex", "createCategory"]),
    onItemClick() {
      this.$emit("expand");
      this.editTransaction(this.item);
      let element;
      nextTick()
        .then(() => {
          element = document.getElementById("category-input").getElementsByTagName("input")[0];
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
    isUncategorized(item) {
      return item.category === NONE._id;
    },
    isSplits(item) {
      return item.splits && Array.isArray(item.splits) && item.splits.length > 0;
    },
    onCategorySelected(category) {
      if (category._id === this.item._id) {
        return;
      }
      this.selectCategory(category._id);
    },
    selectCategory(categoryId) {
      const current = { ...this.item, category: categoryId.slice(-ID_LENGTH.category) };
      const previous = this.item;
      this.commitDocToPouchAndVuex({ current, previous }).then(() => {
        this.getTransactions();
      });
      this.menu = false;
    },
    onCategoryAdd(masterId) {
      // console.log("MASTER ID", masterId)
      this.createCategory({ name: this.search, master_id: masterId }).then((category_id) => {
        this.selectCategory(category_id);
      });
    },
    listMasterCategoryName(masterId) {
      // console.log("MASTER", masterId)
      // masterCategory = this.masterCategoriesById[masterId]
      // if(masterCategory === undefined) {
      //   return "Uncategorized"
      // }
      // return masterCategory.name
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
