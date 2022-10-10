<template>
  <row-element-wrapper :item="item">
    <span class="ellipsis text-body-1">
      {{ previewDescription }}
    </span>
    </row-element-wrapper>
</template>

<script>
import RowElementWrapper from "./RowElementWrapper.vue"

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  components: {
    RowElementWrapper,
  },
  computed: {
    previewDescription() {
      if (this.item.note) {
        return this.item.note;
      } else if (this.item.payee) {
        return this.item.payee;
      } else if (this.item.memo) {
        return this.item.memo;
      } else {
        return "";
      }
    },
  },
};
</script>

<style>
.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.transaction-row-sheet {
  cursor: default;
}
</style>
