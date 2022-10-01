<template>
  <v-hover v-slot="{ hover: buttonHover }">
    <v-btn
      tile
      elevation="0"
      small
      class="pa-0 ma-0 delete-button"
      min-width="20px"
      height="auto"
      :data-testid="`btn-restore-category-${category.id}`"
      :color="buttonHover ? 'unhide' : 'transparent'"
      @click="onUnhideCategory(category.id)"
    >
      <v-icon x-small :color="unhideIconColor(hover, buttonHover)">
        mdi-restore
      </v-icon>
    </v-btn>
  </v-hover>
</template>

<script>
import { mapActions } from 'vuex'
import { unhideIconColor } from './CategoryGrid.vue'

export default {
  props: {
    category: {
      type: Object,
      default: {},
    },
    hover: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
        ...mapActions("categoryMonth", ["onUnhideCategory",]),
    unhideIconColor(hover, hideButton) {
      return unhideIconColor(hover, hideButton);
    },
  },
};
</script>
