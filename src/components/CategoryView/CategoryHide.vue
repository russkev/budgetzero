<template>
  <delete-confirm
    v-if="isStandard"
    @confirm="onHideCategory(category._id)"
    titleText="Hide Category"
    bodyText="Are you sure you want to hide this category?"
  >
    <template #activator="{ on }">
      <hover-button
        :data-testid="`btn-hide-category-${category._id}`"
        :hover="hover"
        icon="mdi-eye-off-outline"
        :on="on"
      />
    </template>
  </delete-confirm>
  <hover-button
    v-else
    :data-testid="`btn-restore-category-${category._id}`"
    :hover="hover"
    icon="mdi-restore"
    active-color="unhide_text"
    active-background-color="unhide"
    @click="onUnhideCategory(category._id)"
  />
</template>

<script>
import { mapActions } from 'vuex'
import DeleteConfirm from '../Shared/DeleteConfirm.vue'
import HoverButton from '../Shared/HoverButton.vue'
import { HIDDEN, NONE } from '../../constants'

export default {
  name: 'CategoryHide',
  components: {
    DeleteConfirm,
    HoverButton
  },
  props: {
    masterCategory: {
      type: Object,
      default: {}
    },
    category: {
      type: Object,
      default: {}
    },
    hover: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isStandard() {
      return ![HIDDEN._id, NONE._id].includes(this.masterCategory._id)
    }
  },
  methods: {
    ...mapActions('categoryMonth', ['onHideCategory', 'onUnhideCategory']),
    testConfirm() {
      console.log('testConform')
    }
  }
}
</script>
