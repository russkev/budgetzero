<template>
  <master-category-row-standard
    :master-category="masterCategory"
    :masterIndex="masterIndex"
    v-if="isStandard()"
  />
  <master-category-row-hidden
    :master-category="masterCategory"
    :masterIndex="masterIndex"
    v-else
  />
</template>

<script>
import MasterCategoryRowStandard from "./MasterCategoryRowStandard.vue";
import MasterCategoryRowHidden from "./MasterCategoryRowHidden.vue";
import { HIDDEN, NONE, ID_LENGTH } from "../../constants";
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
    MasterCategoryRowStandard,
    MasterCategoryRowHidden
  },
  methods: {
    isStandard() {
      return !([HIDDEN._id, NONE._id].includes(this.masterCategory.id));
    },
  },
};
</script>