<template>
  <span class="ellipsis text-body-1">
    {{ previewDescription }}
  </span>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
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
</style>
