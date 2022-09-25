<template>
  <v-container class="background lighten-1 pa-0">
    <v-hover v-slot="{ hover }">
      <v-row class="ma-0 pa-0">
        <v-sheet 
          width="20px" 
          color="transparent" 
          class="row-side-widget"
          :data-testid="`drag-master-category-${masterCategory.id}`"
        >
          <v-icon
            v-if="hover"
            small
            class="master-handle ma-auto"
          >
            mdi-drag-vertical
          </v-icon>
        </v-sheet>
        <v-col class="pa-0">
          <v-row class="master-row white--text ma-0">
            <v-col
              :data-testid="`master-category-name-${masterCategory.id}`"
              :cols="nameCols"
              class="pa-0 ma-0 my-auto"
            >
                <category-grid-input
                  background-color="background lighten-1"
                  :id="`master-category-name-input-${masterCategory.id}`"
                  :data-testid="`master-category-name-input-${masterCategory.id}`"
                  :is-editing="editedMasterCategoryId == masterCategory.id"
                  :value="masterCategory.name"
                  @edit="onEditMasterCategoryName(masterCategory.id)"
                  @apply="onMasterCategoryNameChange"
                  text="h4"
                />
            </v-col>
            <v-col
              class="pa-0 my-auto"
              :data-testid="`master-category-budget-${masterCategory.id}`"
              align="right"
            >
              <span class="text-h5">
                Budgeted
              </span>
              <br />
              <span class="text-body-1">
                {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].budget / 100) }}
              </span>
            </v-col>
            <v-col
              class="pa-0 my-auto"
              :data-testid="`master-category-spent-${masterCategory.id}`"
              align="right"
            ><span class="text-h5">
                Spent
              </span>
              <br />
              <span class="text-body-1">
              {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].spent / 100) }}
              </span>
            </v-col>
            <v-col
              class="pa-0 my-auto"
              :data-testid="`master-category-balance-${masterCategory.id}`"
              align="right"
            ><span class="text-h5">
                Balance
              </span>
              <br />
              <span class="text-body-1">
              {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].balance / 100) }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-hover v-slot="{ hover: deleteButtonHover }">
          <v-btn
            tile
            elevation="0"
            small
            class="pa-0 ma-0 delete-button"
            min-width="20px"
            height="auto"
            :data-testid="`btn-delete-master-category-${masterCategory.id}`"
            :color="deleteButtonHover ? 'delete' : 'transparent'"
            @click="onDeleteMasterCategory(masterCategory)"
          >
            <v-icon small :color="deleteIconColor(hover, deleteButtonHover)">
              mdi-delete-outline
            </v-icon>
          </v-btn>
        </v-hover>
      </v-row>
    </v-hover>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { deleteIconColor } from "./CategoryGrid.vue";
export default {
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    masterIndex: {
      type: Number,
      default: 0,
    },
    nameCols: {
      type: Number,
      default: 5,
    },
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    ...mapGetters("categoryMonth", ["editedMasterCategoryId", "masterCategoriesStats"]),
  },
  methods: {
    ...mapActions("categoryMonth", [
      "onDeleteMasterCategory",
      "onMasterCategoryNameChange",
      "onEditMasterCategoryName",
      "newMasterCategory",
      "newCategory",
    ]),
   

    deleteIconColor (hover, deleteButtonHover) {
      return deleteIconColor(hover, deleteButtonHover)
    },

  },
};
</script>

<style>
.master-handle, .handle {
  cursor: move;
}
.row-side-widget {
  display: flex;
}

.delete-button {
  transition: background-color 0.3s;
}
</style>
