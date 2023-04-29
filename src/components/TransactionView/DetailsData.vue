<template>
  <div class="secondary--text text--lighten-2">
    <template v-for="data_item in data">
      <div class="text-h6 mb-0 mt-3 pb-0" style="line-height: 1rem" :key="data_item.label">{{ data_item.label }}</div>
      <span style="font-size: 10px" :key="data_item.value">{{ data_item.value }}</span>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'DetailsData',
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  computed: {
    data() {
      console.log('Transaction', this.transaction._id)
      if (this.transaction) {
        return [
          {
            label: 'ID',
            value: _.get(this.transaction, '_id', 'ID not found')
          },
          {
            label: 'Import ID',
            value: _.get(this.transaction, 'importId', 'Import ID not found')
          }
        ]
      } else {
        return []
      }
    }
  }
}
</script>
