<template>
    <v-tooltip bottom class="pa-0" color="transparent" :open-delay="500">
      <template #activator="{on}">
  <row-element-wrapper :item="item">
        <span class="ellipsis text-body-1" v-on="on">
          {{ previewDescription }}
        </span>
  </row-element-wrapper>
      </template>
      <v-card max-width="400px" flat outlined color="outline background" class="ma-0 px-4 py-1">
        <v-card-subtitle class="ma-0 pa-0">
          Memo:
        </v-card-subtitle>
        {{ item.memo }}
        <div v-if="item.note !== undefined && item.note !== ''">
          <v-card-subtitle class="ma-0 mt-2 pa-0">
            Note:
          </v-card-subtitle>
          {{ item.note }}
        </div>
      </v-card>
    </v-tooltip>
</template>

<script>
import RowElementWrapper from "./RowElementWrapper.vue";

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
