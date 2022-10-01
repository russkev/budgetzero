<template>
  <v-row class="ma-0 px-0 py-1 background lighten-1">
    <header-row>
      <template #title>
        <span class="text-h4 ml-3 amber--text">
          Uncategorized
        </span>
      </template>
      <template #spent>
        <span class="text-h5">
          Spent
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(spent / 100) }}
        </span>
      </template>
      <template #balance>
        <span class="text-h5">
          Balance
        </span>
        <br />
        <span class="text-body-1">
          {{ intlCurrency.format(balance / 100) }}
        </span>
      </template>
    </header-row>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import HeaderRow from "./HeaderRow.vue";
import { NONE } from "../../constants";
export default {
  components: {
    HeaderRow,
  },
  data() {
    return {
      id: NONE._id,
    };
  },
  computed: {
    ...mapGetters(["intlCurrency"]),
    ...mapGetters("categoryMonth", ["masterCategoriesStats"]),
    spent() {
      return _.get(this.masterCategoriesStats, [this.id, "spent"], 0);
    },
    balance() {
      return _.get(this.masterCategoriesStats, [this.id, "balance"], 0);
    }
  }
};
</script>
