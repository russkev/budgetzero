<template>
  <delete-confirm
    v-if="isStandard" @confirm="onHideCategory(category.id)"
    titleText="Hide Category"
    bodyText="Are you sure you want to hide this category?"
  >
  <template #activator="{on}">
    <delete-button
      
      :data-testid="`btn-hide-category-${category.id}`"
      :hover="hover"
      icon="mdi-eye-off-outline"
      :on="on"
      />
    </template>
  </delete-confirm>
      <delete-button
      v-else
      :data-testid="`btn-restore-category-${category.id}`"
      :hover="hover"
      icon="mdi-restore"
      active-color="unhide_text"
      active-background-color="unhide"
      @click="onUnhideCategory(category.id)"
    />
</template>

<script>
import { mapActions } from "vuex";
import DeleteConfirm from "../Shared/DeleteConfirm.vue";
import DeleteButton from "../Shared/DeleteButton.vue";
import { HIDDEN, NONE } from "../../constants";

export default {
  name: "CategoryHide",
  components: {
    DeleteConfirm,
    DeleteButton,
  },
  props: {
    masterCategory: {
      type: Object,
      default: {},
    },
    category: {
      type: Object,
      default: {},
    },
    hover: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isStandard() {
      return ![HIDDEN._id, NONE._id].includes(this.masterCategory.id);
    },
  },
  methods: {
    ...mapActions("categoryMonth", ["onHideCategory", "onUnhideCategory"]),
  },
};
</script>
