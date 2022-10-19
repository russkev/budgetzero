<template>
  <v-menu offset-y v-model="colorIsOpen">
    <template #activator="{ on }">
      <v-btn
        elevation="0"
        min-width="10px"
        width="10px"
        height="14px"
        class="pa-0 ma-auto"
        v-on="on"
        :color="hover || colorIsOpen ? color : 'transparent'"
        />
    </template>
    <v-color-picker
      show-swatches
      hide-canvas
      hide-inputs
      hide-mode-switch
      hide-sliders
      :swatches="hexSwatches"
      swatches-max-height="600"
      :value="color"
      @update:color="onColorChange"
      width="500px"
    />
  </v-menu>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    color: {
      type: String,
      required: true,
    },
    hover: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      colorIsOpen: false,
    };
  },
  computed: {
    ...mapGetters(["colorSwatches"]),
    hexSwatches() {
      return this.colorSwatches.map((colorSwatchRow) => {
        return colorSwatchRow.map((colorSwatch) => {
          return colorSwatch.hex;
        });
      });
    },
  },
  methods: {
    ...mapActions(["updateMasterColor"]),
    onColorChange(color) {
      // this.updateMasterColor({ masterId: this.masterCategory._id, colorObject: color });
      this.$emit('updated', color);
    },
  },
};
</script>
