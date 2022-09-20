<template>
  <div>
    <div v-if="!isEditing">
      <v-hover v-slot="{hover}">

        <v-text-field
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
        :background-color="hover ? activeBackgroundColor : backgroundColor"
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
        :id="id"
        :data-testid="dataTestid"
        :value="value"
        @blur="onApply"
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
    backgroundColor: {
      type: String,
      default: "background"
    }
  },
  data() {
    return {
      isSelected: false,
      height: "26px",
      isHovering: false,
      activeBackgroundColor: "background lighten-2"
    }
  },
  computed: {
    ...mapGetters(["intlCurrency",]),
    nonEditingBackgroundColor() {
      if(this.isHovering) {
        return this.activeBackgroundColor
      } else {
        return this.backgroundColor
      }
    }
  },
  methods: {
    onApply(event) {
      this.$emit("apply", event);
      this.isSelected = false
    },
    onClick() {
      this.$emit("edit");
    },
    onEnterPressed(event) {
      this.$emit("enter", event)
    },
    onEditedClicked(event) {
      if (!this.isSelected) {
        event.target.select()
        this.isSelected = true
      }
    }

  },
};
</script>

<style>

.v-text-field .v-input__control .v-input__slot {
  min-height: 0px !important
}

</style>