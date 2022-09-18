<template>
  <v-autocomplete 
    v-model="selection"
    :items="items"
    :data-testid="dataTestid"
    item-text="name"
    item-value="_id"
    return-object
    dense 
    hide-details
    @blur="onApply"
    @change="onApply"
    @mouseDown="onApply"
    @keyup.enter="onApply"
    :disabled="disabled"
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
    disabled: {
      type: Boolean,
      default: false,
    },
    dataTestid: {
      type: String,
      default: '',
    }
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
