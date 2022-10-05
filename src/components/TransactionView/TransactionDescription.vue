<template>
  <v-menu :close-on-content-click="false" left>
    <template #activator="{ on }">
      <v-card flat height="100%" v-on="on" color="transparent" class="py-1 text-body-1">
        <span class="ellipsis">
          {{ previewDescription }}
        </span>
      </v-card>
    </template>
    <v-card max-height="80vh" width="400px" max-width="90vw" color="background">
    <!-- <v-card color="background"> -->
      <v-row class="ma-0 pa-2">
        <v-col class="ma-0 pa-0">
          <span>Memo</span>
          <v-textarea
            flat
            solo
            autofocus
            hide-details
            :value="item.memo"
            background-color="background lighten-2"
            class="text-body-1 mb-2"
            auto-grow
            rows="1"
            readonly
            />
          <span>Note</span>
          <v-textarea
            auto-grow
            rows="2"
            solo
            flat
            hide-details
            background-color="background lighten-2"
            :value="item.note ? item.note : ''"
            class="text-body-1"
          /> 
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
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
