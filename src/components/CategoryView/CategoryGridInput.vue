<template>
  <div>
    <div v-if="!isEditing">
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
        background-color="primary"
        :reverse="currency"
      />
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
  },
  data() {
    return {
      isSelected: false,
    }
  },
  computed: {
    ...mapGetters(["intlCurrency",]),
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
