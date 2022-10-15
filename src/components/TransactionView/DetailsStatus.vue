<template>
  <div data-testid="details-status" v-if="clearedStatus" class="ml-2">
    <v-icon data-testid="details-cleared" left :size="size" color="success" @click="clearedStatus = false">
      mdi-alpha-c-circle
    </v-icon>
    Cleared
  </div>
  <div data-testid="details-status" v-else class="ml-2">
    <v-icon data-testid="details-cleared" left :size="size" color="grey" @click="clearedStatus = true">
      mdi-alpha-c-circle
    </v-icon>
    Uncleared
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  data() {
    return {
      size: 20,
    };
  },
  computed: {
    ...mapGetters("accountTransactions", ["editedTransaction"]),
    clearedStatus: {
      get() {
        return this.editedTransaction.cleared;
      },
      set(value) {
        this.SET_EDITED_TRANSACTION_CLEARED(value);
      },
    },
  },
  methods: {
    ...mapMutations("accountTransactions", ["SET_EDITED_TRANSACTION_CLEARED"]),
  },
};
</script>
