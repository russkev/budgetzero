<template>
  <v-container class="background lighten-1">
    <v-row class="master-row white--text">
      <v-col :data-testid="`master-category-name-${masterCategory.id}`">
        <v-row>
          <v-col align-self="center" sm="1" class="mr-2">
            <v-icon class="master-handle" :data-testid="`drag-master-category-${masterCategory.id}`">
              mdi-drag-horizontal
            </v-icon>
          </v-col>
          <v-col>
            <category-grid-input
              background-color="background lighten-1"
              :id="`master-category-name-input-${masterCategory.id}`"
              :data-testid="`master-category-name-input-${masterCategory.id}`"
              :is-editing="editedMasterCategoryId == masterCategory.id"
              :value="masterCategory.name"
              @edit="onEditMasterCategoryName(masterCategory.id)"
              @apply="onMasterCategoryNameChange"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col :data-testid="`master-category-budget-${masterCategory.id}`" align="right">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].budget / 100) }}
      </v-col>
      <v-col :data-testid="`master-category-spent-${masterCategory.id}`" align="right">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].spent / 100) }}
      </v-col>
      <v-col :data-testid="`master-category-balance-${masterCategory.id}`" align="right">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].balance / 100) }}
        <v-icon
          dark
          small
          right
          :data-testid="`btn-new-master-category-${masterCategory.id}`"
          @click="onNewMasterCategory(masterIndex)"
        >
          mdi-plus-circle-outline
        </v-icon>
        <v-icon
          dark
          small
          right
          :data-testid="`btn-delete-master-category-${masterCategory.id}`"
          @click="deleteMasterCategory(masterCategory)"
        >
          mdi-delete-circle-outline
        </v-icon>
        <v-icon
          dark
          small
          right
          :data-testid="`btn-new-category-${masterCategory.id}`"
          @click="onNewCategory(masterCategory)"
        >
          mdi-note-plus-outline
        </v-icon>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { nextTick } from "vue";

export default {
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    masterIndex: {
      type: Number,
      default: 0,
    }
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    ...mapGetters("categoryMonth", [
      "editedMasterCategoryId", 
      "masterCategoriesStats",
    ]),
  },
  methods: {
    ...mapActions("categoryMonth", [
      "deleteMasterCategory",
      "onMasterCategoryNameChange",
      "onEditMasterCategoryName",
      "newMasterCategory",
      "newCategory",
    ]),
    onNewMasterCategory(index) {
      // this.createMasterCategory({ name: 'Name', is_income: false, sort: index - 0.5 }).then((id) => {
      //     this.SET_EDITED_MASTER_CATEGORY_ID(id)
      this.newMasterCategory(index).then((id) => {
        const element_id = `master-category-name-input-${id}`;

        nextTick(() => {
          const new_element = document.getElementById(element_id);
          if (!new_element) {
            return;
          }
          new_element.focus();
          new_element.select();
        });
      });
    },
    onNewCategory(master_category) {
      // this.createCategory({ name: "Name", master_id: master_category.id }).then((id) => {
      //   this.SET_EDITED_CATEGORY_NAME_ID(id);
      this.newCategory(master_category).then((id) => {
        const element_id = `category-name-input-${id}`;

        nextTick(() => {
          const new_element = document.getElementById(element_id);
          if (!new_element) {
            return;
          }
          new_element.focus();
          new_element.select();
        });
      });
    },
  },
};
</script>
