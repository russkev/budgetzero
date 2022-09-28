<template>
  <v-container class="pa-0">
    <v-hover v-slot="{ hover }">
      <v-row class="ma-0 pa-0">
        <v-sheet 
          width="20px" 
          color="transparent" 
          class="row-side-widget"
          :data-testid="dragId"
        >
        <slot name="drag" :message="hover"></slot>
        </v-sheet>
        <v-col class="pa-0">
          <v-row class="master-row white--text ma-0">
            <v-col
              :data-testid="titleId"
              :cols="5"
              class="pa-0 ma-0 my-auto"
            >
              <slot name="title"></slot>
            </v-col>
            <v-col
              class="pa-0 my-auto"
              :data-testid="budgetedId"
              align="right"
            >
              <v-row>
                <v-col class="pa-0 pr-6">
                  <slot name="budgeted"></slot>
                </v-col>
              </v-row>

            </v-col>
            <v-col
              class="pa-0 my-auto"
              :data-testid="spentId"
              align="right"
            >
            <slot name="spent"></slot>
            </v-col>
            <v-col
              class="pa-0 my-auto"
              :data-testid="balanceId"
              align="right"
            >
            <slot name="balance"></slot>
            </v-col>
          </v-row>
        </v-col>
        <slot name="delete" :message="hover"></slot>
        <slot name="collapse" :message="hover"></slot>
      </v-row>
    </v-hover>
  </v-container>
</template>

<script>
export default {
  props: {
    dragId: {
      type: String,
      required: false,
      default: '',
    },
    titleId: {
      type: String,
      required: false,
      default: '',
    },
    budgetedId: {
      type: String,
      required: false,
      default: '',
    },
    spentId: {
      type: String,
      required: false,
      default: '',
    },
    balanceId: {
      type: String,
      required: false,
      default: '',
    },
  },
}
</script>