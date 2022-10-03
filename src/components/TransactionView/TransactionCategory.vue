<template>
  <v-menu
    v-model="menu"
    transition="scale-transition"
    origin="top left"
    :close-on-content-click="false"
  >
    <template #activator="{on}">
      <v-chip
        class="category-chip pl-0"
        small
        label
        pill
        v-on="on"
        :color="categoryBackgroundColor"
      >
        <!-- <v-avatar :color="categoryColor(item)" left/> -->
        <v-sheet width="5px" :color="categoryColor" height="100%" class="mr-2" />
        {{ item.category_name }}
      </v-chip>
    </template>
    <v-card max-height="80vh">
      <v-list>
        <v-list-item>
          <v-list-item-avatar size="24" :color="categoryColor"> </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.category_name }}</v-list-item-title>
            <v-list-item-subtitle>{{ masterCategoryName }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-row>
        <v-col>
          <v-text-field
            ref="search"
            v-model="search"
            full-width
            hide-details
            label="Search"
            single-line
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-list dense subheader>
        <template v-for="[masterId, categories] in Object.entries(searchedMasterCategories)">
          <v-subheader v-bind:key="masterId">
            {{ listMasterCategoryName(masterId) }}
          </v-subheader>
          <v-list-item v-for="category in categories" :key="`master-${category._id}`" @click="onCategorySelected(category)">
            <v-list-item-content :key="`category-${category._id}`">
              <v-list-item-title>{{ category.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="showAddCategory()" :key="`add-${masterId}`" @click="onCategoryAdd(masterId)">
            <v-list-item-content>
              <v-list-item-title>
                <v-list-item-title>Add '{{search}}' to {{ listMasterCategoryName(masterId)}}</v-list-item-title>
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
import { ID_LENGTH, NONE } from "../../constants";

export default {
  components: { SelectCategory },
  props: {
    item: {
      type: Object,
    },
  },
  data() {
    return {
      menu: false,
      search: '',
    };
  },
  computed: {
    ...mapGetters([
      "categoryColors",
      "categoriesById",
      "masterCategoriesById",
      "categoriesByMaster",
    ]),
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    itemId() {
      return this.item._id.slice(-ID_LENGTH.transaction);
    },
    categoryColor() {
      const id = this.item.category;
      const color = this.categoryColors[id];
      if (color === undefined) {
        return "grey";
      }
      return color;
    },
    categoryBackgroundColor() {
      return `${this.categoryColor}55`;
    },
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
      console.log("SEARCH", this.search)
      const search = this.search.toLowerCase();
      
      if (!search) {
        return this.categoriesByMaster
      }
      console.log( Object.entries(this.categoriesByMaster))
      return Object.entries(this.categoriesByMaster).reduce((acc, [masterId, categories]) => {
        const filteredCategories = categories.filter(category => category.name.toLowerCase().includes(search))
        acc[masterId] = filteredCategories
        return acc
      }, {})
    }
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
      const current = {...this.item, category: categoryId.slice(-ID_LENGTH.category)};
      const previous = this.item
      this.commitDocToPouchAndVuex({current, previous}).then(() => {
        this.getTransactions()
      })
      this.menu = false;
    },
    onCategoryAdd(masterId) {
      // console.log("MASTER ID", masterId)
      this.createCategory({name: this.search, master_id: masterId}).then((category_id) => {
        this.selectCategory(category_id)
      })
    },
    listMasterCategoryName(masterId) {
      // console.log("MASTER", masterId)
      // masterCategory = this.masterCategoriesById[masterId]
      // if(masterCategory === undefined) {
      //   return "Uncategorized"
      // }
      // return masterCategory.name
      return _.get(this.masterCategoriesById, [masterId, "name"], "Undefined")
    },
    showAddCategory(masterId) {
      if (this.search.length < 1) {
        return false
      }
      return !(masterId === NONE._id)
    }
  },
};
</script>
