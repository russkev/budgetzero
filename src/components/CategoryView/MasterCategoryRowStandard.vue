<template>
  <header-row
    :drag-id="`drag-master-category-${masterCategory.id}`"
    :title-id="`master-category-name-${masterCategory.id}`"
    :budgeted-id="`master-category-budget-${masterCategory.id}`"
    :spent-id="`master-category-spent-${masterCategory.id}`"
    :balance-id="`master-category-balance-${masterCategory.id}`"
  >
    <template #drag="{hover}">
      <v-icon v-if="hover" small class="master-handle ma-auto">
        mdi-drag-vertical
      </v-icon>
    </template>
    <template #color="{hover}">
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn
            elevation="0"
            min-width="14px"
            width="14px"
            height="14px"
            class="pa-0 ma-auto"
            v-on="on"
            :color="hover ? masterCategoryDoc.color.hex : 'transparent'"
          />
        </template>
        <v-color-picker
          show-swatches
          hide-canvas
          hide-inputs
          hide-mode-switch
          hide-sliders
          :swatches="hexSwatches"
          :value="masterCategoryDoc.color.hex"
          @update:color="onColorChange"
          />
      </v-menu>
    </template>
    <template #title>
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
    </template>
    <template #budgeted>
      <span class="text-h5">
        Budgeted
      </span>
      <br />
      <span class="text-body-1">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].budget / 100) }}
      </span>
    </template>
    <template #spent>
      <span class="text-h5">
        Spent
      </span>
      <br />
      <span class="text-body-1">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].spent / 100) }}
      </span>
    </template>
    <template #balance>
      <span class="text-h5">
        Balance
      </span>
      <br />
      <span class="text-body-1">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory.id].balance / 100) }}
      </span>
    </template>
    <template #delete="{hover}">
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
    </template>
    <template #collapse>
      <v-btn
        tile
        elevation="0"
        small
        class="pa-0 ma-0"
        min-width="20px"
        height="auto"
        color="transparent"
        :data-testid="`btn-expand-${masterCategory.id}`"
        @click="toggleMasterCategoryCollapsed(masterCategory.id)"
      >
        <v-icon small>
          {{ masterCategory.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
        </v-icon>
      </v-btn>
    </template>
  </header-row>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { deleteIconColor } from "./CategoryGrid.vue";
import HeaderRow from "./HeaderRow.vue";

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
  components: {
    HeaderRow,
  },
  data() {
    return {
      selectedColor: { hex: "#FF0000" },
    };
  },
  computed: {
    ...mapGetters(["intlCurrency", "colorSwatches", "masterCategoriesById", "categoryColors"]),
    ...mapGetters("categoryMonth", ["editedMasterCategoryId", "masterCategoriesStats"]),
    data() {
      return "data";
    },
    hexSwatches() {
      return this.colorSwatches.map((colorSwatchRow) => {
        return colorSwatchRow.map((colorSwatch) => {
          return colorSwatch.hex;
        });
      });
    },
    masterCategoryDoc() {
      return this.masterCategoriesById[this.masterCategory.id];
    },
  },
  methods: {
    ...mapMutations(["SET_MASTER_CATEGORY_COLOR"]),
    ...mapActions(["toggleMasterCategoryCollapsed", "updateMasterColor"]),
    ...mapActions("categoryMonth", [
      "onDeleteMasterCategory",
      "onMasterCategoryNameChange",
      "onEditMasterCategoryName",
      "newMasterCategory",
      "newCategory",
    ]),

    deleteIconColor(hover, deleteButtonHover) {
      return deleteIconColor(hover, deleteButtonHover);
    },
    onColorSelected() {
      console.log("Color selected", this.masterCategory);
    },
    onColorChange(color) {
      this.updateMasterColor({ masterId: this.masterCategory.id, colorObject: color })
    },
  },
};
</script>

<style>
.master-handle,
.handle {
  cursor: move;
}
.row-side-widget {
  display: flex;
}

.delete-button {
  transition: background-color 0.3s;
}
</style>
