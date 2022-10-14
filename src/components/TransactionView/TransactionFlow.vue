<template>
  <row-element-wrapper :item="item" right>
    <span :class="`my-auto ellipsis text-body-1 text-right ${textColor}--text text--lighten-3`">
      {{ value }}
    </span>
  </row-element-wrapper>
</template>

<script>
import { mapGetters } from "vuex";
import RowElementWrapper from "./RowElementWrapper.vue";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    isOutflow: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  components: {
    RowElementWrapper,
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    value() {
      if (this.isOutflow && this.item.value < 0) {
        return this.intlCurrency.format(Math.abs(this.item.value / 100));
      } else if (!this.isOutflow && this.item.value >= 0) {
        return this.intlCurrency.format(this.item.value / 100);
      } else {
        return "";
      }
    },
    textColor() {
      return this.isOutflow ? "error" : "success";
    }
  },
};
</script>
