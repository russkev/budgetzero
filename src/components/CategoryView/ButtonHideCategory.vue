<template>
  <v-hover v-slot="{ hover: buttonHover }">
    <v-btn
      tile
      elevation="0"
      small
      class="pa-0 ma-0 delete-button"
      min-width="20px"
      height="auto"
      :data-testid="`btn-hide-category-${category.id}`"
      :color="buttonHover ? 'delete' : 'transparent'"
      @click="onHideCategory(category.id)"
    >
      <v-icon x-small :color="deleteIconColor(hover, buttonHover)">
        mdi-eye-off-outline
      </v-icon>
    </v-btn>
  </v-hover>
</template>

<script>
import { mapActions } from 'vuex'
import { deleteIconColor } from './CategoryGrid.vue'

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
        ...mapActions("categoryMonth", ["onHideCategory",]),
    deleteIconColor(hover, hideButton) {
      return deleteIconColor(hover, hideButton);
    },
  },
};
</script>
