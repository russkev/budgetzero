<template>
  <v-sheet class="flex-table-container ma-0 pa-0" color="transparent">
    <!-- sort-by="date" -->
    <v-data-table
      fixed-header
      class="transactions-table import-preview-table flex-table-main background"
      disable-sort
      dense
      group-by="date"
      group-desc
      :items="tableItems"
      :items-per-page="200"
      :headers="importTransactionHeaders"
      :header-props="{
        'disable-sort': true,
      }"
      :footer-props="{
        'items-per-page-options': [5, 10, 20, 50, 100, 200],
        'items-per-page-text': 'rows',
      }"
      :loading="isLoading"
    >
      <template #header.memo>
        <div class="text-h5">Memo</div>
      </template>
      <template #header.amount>
        <div class="text-h5">Amount</div>
      </template>
      <template #group.header="{ items }">
        <td colspan="20" class="date-row background ellipsis">
          {{ parseDate(items[0].date) }}
          <!-- {{ formatDate(getDate(items[0].date)) }} -->
          <!-- {{ items[0].date }} -->
        </td>
      </template>
      <template #item.memo="{ item }">
        <div :class="`import-preview-memo ml-3 ellipsis ${item.exists ? existsColor : ''}`">
          {{ item.memo }}
        </div>
      </template>
      <template #item.amount="{ item }">
        <div :class="`import-preview-amount text-right ellipsis ${item.exists ? existsColor : ''}`">
          {{ parseCurrency(item.amount) }}
          <!-- {{ intlCurrency.format(item.amount) }} -->
          <!-- {{ item.amount }} -->
        </div>
      </template>
    </v-data-table>
  </v-sheet>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import { getDate } from "../../ofxParse";

export default {
  name: "ImportTable",
  data() {
    return {
      existsColor: "secondary--text text--darken-1",
    };
  },
  props: {
    tableItems: {
      type: Array,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    dateFormat: {
      type: String,
      default: "YYYY-MM-DD",
    },
  },
  computed: {
    ...mapGetters(["importTransactionHeaders", "intlCurrency"]),
  },
  methods: {
    parseDate(date) {
      // let result = getDate(date)
      // result = formatDate(result)
      // if (result) {
      //   return result
      // }
      // result = formatDate(date)
      // if (result) {
      //   return result
      // }
      // return date
      // return fns_parse(date, this.dateFormat, new Date())
      const result = moment(date, this.dateFormat, true);
      return result.isValid() ? result.format("dddd, Do MMM, YYYY") : date;
    },
    parseCurrency(amount) {
      if (isNaN(amount)) {
        return amount;
      } else {
        return this.intlCurrency.format(amount);
      }
    },
  },
};
</script>

<style>
.transactions-table td.text-start {
  background: var(--v-background-lighten1);
}
</style>
