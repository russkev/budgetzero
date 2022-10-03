<template>
  <!-- <div v-if="item._id !== editedTransaction._id" class="text-truncate" @click="onItemClick">
    <span v-if="isSplits(item)" class="cyan--text row-category font-weight-medium">
      <v-icon small color="cyan">mdi-call-split</v-icon>Split
    </span>
    <span v-else-if="isUncategorized(item)" class="amber--text row-category font-weight-medium">
      {{ item.category_name }}
    </span>
    <span v-else class="row-category font-weight-medium">
      {{ item.category_name }}
    </span>
    <br />
    <span class="row-memo text-body-1 transaction-details">
      {{ item.note ? item.note : item.memo }}
    </span>
  </div>
  <div v-else>
    <select-category
      id="category-input"
      :category-id="item.category"
      @update="onCategoryUpdate"
      :disabled="item.splits.length > 0"
      data-testid="edit-row-select-category"
    />
  </div> -->
  <!-- outlined -->
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
    <v-card width="300" height="300">
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
          <v-text-field />
        </v-col>
      </v-row>
      <v-divider />
      <v-list dense subheader>
        <template v-for="[masterId, categories] in Object.entries(categoriesByMaster)" >
        <v-subheader  v-bind:key="masterId">
        {{masterCategoriesById[masterId].name}}
        </v-subheader>
          <v-list-item v-for="category in categories"  :key="`master-${category._id}`">
            <v-list-item-content :key="`category-${category._id}`">
              <v-list-item-title>{{category.name}}</v-list-item-title>
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
    };
  },
  computed: {
    ...mapGetters(["categoryColors", "categoriesById", "masterCategoriesById", "categoriesByMaster"]),
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
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_CATEGORY"]),
    ...mapActions("accountTransactions", ["editTransaction"]),
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
  },
};
</script>

<style>
/* .v-chip.category-chip .v-avatar {
  height: 12px !important;
  width: 12px !important;
  min-width: 12px !important;
} */
</style>
