<template>
  <row-element-wrapper :item="item">
    <span class="text-right">
      {{ intlCurrency.format(item.balance / 100) }}
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
    },
  },
  components: {
    RowElementWrapper,
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
  },
};
</script>

<style>
.text-right {
  text-align: right;
}
</style>