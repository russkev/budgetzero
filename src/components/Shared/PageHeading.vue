<template>
  <div dataTestid="dataTestid" class="mt-3">
    <h1 class="text-h2 secondary--text text--lighten-1">{{ title }}</h1>
    <h2 class="text-h5 secondary--text text--lighten-2">{{ subtitle }}</h2>
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    dataTestid: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>
/* .page-heading {
  margin-bottom: 1rem;
} */
</style>
