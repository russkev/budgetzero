<template>
  <delete-confirm
    @confirm="onDeleteMasterCategory(masterCategory)"
    titleText="Delete Group"
    bodyText="Are you sure you want to delete this group?"
  >
    <template #activator="{ on }">
      <hover-button :hover="hover" :data-testid="`btn-delete-master-category-${masterCategory._id}`" :on="on" />
    </template>
  </delete-confirm>
</template>

<script>
import { mapActions } from 'vuex'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import HoverButton from '../Shared/HoverButton.vue'

export default {
  name: 'MasterCategoryDelete',
  components: {
    DeleteConfirm,
    HoverButton
  },
  props: {
    masterCategory: {
      type: Object,
      default: {}
    },
    hover: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    ...mapActions('categoryMonth', ['onDeleteMasterCategory'])
  }
}
</script>
