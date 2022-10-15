<template>
  <v-sheet color="transparent" :class="`transactions-header-balance ${left ? '' : 'ml-3'}`">
    <div :class="headingStyle !== 'h4' ? `text-${headingStyle}` : 'transactions-header-heading'">
      {{ heading }}
    </div>
    <div v-if="subheading !== ''" class="transactions-header-subheading">
      {{ subheading }}
    </div>
  </v-sheet>
</template>

<script>
export default {
  props: {
    left: {
      type: Boolean,
      default: false,
    },
    heading: {
      type: String,
      default: "",
    },
    headingStyle: {
      type: String,
      default: "h4",
    },
    subheading: {
      type: String,
      default: "",
    },
  },
};
</script>

<style>
#transactions-header .transactions-header-balance {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.transactions-header-heading {
  font-size: 1.4rem;
  font-weight: 500;
}

.transactions-header-subheading {
  font-size: 0.95rem;
  line-height: 1rem;
}
</style>
