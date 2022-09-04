<template>
  <v-autocomplete 
    v-model="selection"
    data-testid="edit-row-select-category"
    :items="items"
    item-text="name"
    item-value="_id"
    return-object
    dense 
    hide-details
    @blur="onApply"
    @change="onApply"
    @mouseDown="onApply"
    @keyup.enter="onApply"
  >
    <!-- <template #no-data> </template> -->
  </v-autocomplete>
</template>

<script>
import { mapGetters } from "vuex";
import { ID_LENGTH, NONE } from "../../constants";

export default {
  props: {
    categoryId: {
      type: String,
      default: NONE._id,
    },
  },
  data() {
    return {
      selection: NONE,
    };
  },
  mounted() {
    this.selection = this.categoriesById[this.categoryId]
  },
  computed: {
    ...mapGetters([
      "categoriesByMaster",
      "categoriesById",
    ]),
    items() {
      return Object.values(this.categoriesByMaster).flat();
    },
  },
  methods: {
    onApply() {
      if (this.selection) {
        this.$emit('update', this.selection._id.slice(-ID_LENGTH.category))
      }
      else {
        this.$emit('update', NONE._id)
      }
    },
  }
};
</script>
