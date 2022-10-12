<template>
  <v-hover v-slot="{ hover: deleteButtonHover }">
    <v-btn
      tile
      elevation="0"
      small
      class="pa-0 ma-0 delete-button"
      min-width="20px"
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
      default: "delete_text",
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
  },
  computed: {},

  methods: {
    onClick() {
      this.$emit("click");
    },
    deleteIconColor(deleteButtonHover) {
      console.log("DIALOG OPEN", this.dialogOpen);
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
