<template>
  <div @blur="onBlur" @focusout="onBlur">
    <div v-if="!isEditing">
      <v-hover v-slot="{ hover }">
        <v-text-field
          :class="`ma-0 text-${text}`"
          dense
          flat
          solo
          hide-details
          readonly
          :id="id"
          :data-testid="dataTestid"
          :value="currency ? intlCurrency.format(value) : value"
          @click="onClick"
          @focus="onClick"
          :reverse="currency"
          :background-color="hover ? activeBackgroundColor : 'transparent'"
          :height="height"
        />
      </v-hover>
    </div>
    <div v-else>
      <v-text-field
        hide-details
        dark
        dense
        flat
        solo
        autofocus
        :class="`ma-0 text-${text}`"
        :id="id"
        :data-testid="dataTestid"
        :value="value"
        @change="onApply"
        @keyup.enter="onEnterPressed"
        @click="onEditedClicked"
        :suffix="currency ? '$' : ''"
        :reverse="currency"
        :background-color="activeBackgroundColor"
        :height="height"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { nextTick } from "vue";

export default {
  emits: ["apply", "edit", "enter"],
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: "",
    },
    dataTestid: {
      type: String,
      default: "",
    },
    currency: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "body-1",
    },
  },
  data() {
    return {
      isSelected: false,
      height: "26px",
      isHovering: false,
      activeBackgroundColor: "background lighten-2",
    };
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    nonEditingBackgroundColor() {
      if (this.isHovering) {
        return this.activeBackgroundColor;
      } else {
        return this.backgroundColor;
      }
    },
  },
  methods: {
    onBlur(event) {
      console.log("ON BLUR");
      this.onApply(event);
    },
    onApply(event) {
      this.$emit("apply", event);
      this.isSelected = false;
    },
    onClick() {
      this.$emit("edit");
      nextTick(() => {
        document.getElementById(this.id).select();
        this.isSelected = true;
      });
    },
    onEnterPressed(event) {
      this.$emit("enter", event);
    },
    onEditedClicked(event) {
      if (!this.isSelected) {
        event.target.select();
        this.isSelected = true;
      }
    },
  },
};
</script>

<style>
.v-text-field .v-input__control .v-input__slot {
  min-height: 0px !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
}
.v-text-field .v-input__control {
  min-height: 0px !important;
}
</style>
