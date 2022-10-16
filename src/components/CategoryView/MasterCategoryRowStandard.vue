<template>
  <header-row
    :drag-id="`drag-master-category-${masterCategory._id}`"
    :title-id="`master-category-name-${masterCategory._id}`"
    :budgeted-id="`master-category-budget-${masterCategory._id}`"
    :spent-id="`master-category-spent-${masterCategory._id}`"
    :balance-id="`master-category-balance-${masterCategory._id}`"
  >
    <template #drag="{hover}">
      <v-icon v-if="hover" small class="master-handle ma-auto">
        mdi-drag-vertical
      </v-icon>
    </template>
    <template #color="{hover}">
      <v-menu offset-y v-model="colorIsOpen">
        <template #activator="{ on }">
          <!-- tile -->
          <v-btn
            elevation="0"
            min-width="10px"
            width="10px"
            height="14px"
            class="pa-0 ma-auto"
            v-on="on"
            :color="hover || colorIsOpen ? masterCategoryDoc.color.hex : 'transparent'"
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
        :id="`master-category-name-input-${masterCategory._id}`"
        :data-testid="`master-category-name-input-${masterCategory._id}`"
        :is-editing="editedMasterCategoryId == masterCategory._id"
        :value="masterCategory.name"
        @edit="onEditMasterCategoryName(masterCategory._id)"
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
        {{ intlCurrency.format(masterCategoriesStats[masterCategory._id].budget / 100) }}
      </span>
    </template>
    <template #spent>
      <span class="text-h5">
        Spent
      </span>
      <br />
      <span class="text-body-1">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory._id].spent / 100) }}
      </span>
    </template>
    <template #balance>
      <span class="text-h5">
        Balance
      </span>
      <br />
      <span :class="`text-body-1 ${balanceColor}`">
        {{ intlCurrency.format(masterCategoriesStats[masterCategory._id].balance / 100) }}
      </span>
    </template>
    <template #delete="{hover}">
      <master-category-delete :hover="hover" :master-category="masterCategory" />
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
        :data-testid="`btn-expand-${masterCategory._id}`"
        @click="toggleMasterCategoryCollapsed(masterCategory._id)"
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
import HeaderRow from "./HeaderRow.vue";
import MasterCategoryDelete from "./MasterCategoryDelete.vue";

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
    MasterCategoryDelete,
  },
  data() {
    return {
      selectedColor: { hex: "#FF0000" },
      colorIsOpen: false,
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
      return this.masterCategoriesById[this.masterCategory._id];
    },
    balanceColor() {
      const balance = this.masterCategoriesStats[this.masterCategory._id].balance
      if (balance < 0) {
        return `error--text text--lighten-3`;
      } else if (balance > 0) {
        return `success--text text--lighten-3`;
      } else {
        return "";
      }
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
    onColorSelected() {
      console.log("Color selected", this.masterCategory);
    },
    onColorChange(color) {
      this.updateMasterColor({ masterId: this.masterCategory._id, colorObject: color })
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
