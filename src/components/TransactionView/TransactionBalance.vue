<template>
  <row-element-wrapper @click="onTransactionDetailsClick(item)" class="text-right" right>
    <span class="my-auto">
      {{ intlCurrency.format(item.balance / 100) }}
    </span>
  </row-element-wrapper>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
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
  methods: {
    ...mapActions("accountTransactions", ["onTransactionDetailsClick"]),
  }
};
</script>

<style>
.text-right {
  text-align: right;
}
</style>