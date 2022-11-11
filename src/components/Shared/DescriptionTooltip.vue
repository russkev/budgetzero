<template>
  <v-tooltip bottom class="pa-0" color="transparent" :open-delay="500">
    <template #activator="{ on }">
      <slot name="activator" :on="on"></slot>
    </template>
    <v-card 
      max-width="400px"
      flat outlined
      color="outline background"
      class="transaction-description ma-0 px-4 py-1"
    >
      <v-card-subtitle class="ma-0 pa-0">Memo: </v-card-subtitle>
        {{item.memo}}
        <div v-if="item.note !== undefined && item.note !== ''">
          <v-card-subtitle class="ma-0 mt-2 pa-0">Note: </v-card-subtitle>>
          {{item.note}}
        </div>
    </v-card>
  </v-tooltip>
</template>

<script>

export default {
  props: {
    item: {
      type: Object,
      required: true,
    }
  }
}
</script>