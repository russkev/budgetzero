<template>
  <v-hover v-slot="{ hover: deleteButtonHover }">
    <v-btn
      v-if="!disabled"
      tile
      elevation="0"
      small
      class="pa-0 ma-0 delete-button"
      :min-width="width"
      :height="height"
      :data-testid="dataTestid"
      :color="deleteButtonHover ? activeBackgroundColor : 'transparent'"
      @click="onClick()"
      v-on="on"
    >
      <slot>
        <v-icon small :color="deleteIconColor(deleteButtonHover)">
          {{ icon }}
        </v-icon>
      </slot>
    </v-btn>
    <v-sheet :min-width="width" color="transparent" v-else></v-sheet>
  </v-hover>
</template>

<script>

export default {
  emits: ["click"],
  props: {
    hover: {
      type: Boolean,
      default: false,
    },
    dataTestid: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "mdi-delete-outline",
    },
    activeColor: {
      type: String,
      default: "error lighten-2",
    },
    activeBackgroundColor: {
      type: String,
      default: "delete",
    },
    height: {
      type: String,
      default: "auto",
    },
    on: {
      type: Object,
    },
    dialogOpen: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      width: "20px"
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    },
    deleteIconColor(deleteButtonHover) {
      if (this.hover || this.dialogOpen) {
        if (deleteButtonHover || this.dialogOpen) {
          return this.activeColor;
        } else {
          return "white";
        }
      } else {
        return "transparent";
      }
    },
  },
};
</script>
