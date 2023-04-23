<template>
  <v-card max-height="80vh" color="background">
    <v-row>
      <v-col class="ma-2">
        Search
        <v-text-field
          data-testid="category-search"
          flat
          solo
          autofocus
          hide-details
          ref="search"
          v-model="search"
          background-color="background lighten-2"
          class="text-body-1"
        />
      </v-col>
    </v-row>
    <v-list dense subheader color="background" data-testid="category-list">
      <template v-for="[masterId, categories] in Object.entries(searchedMasterCategories)">
        <v-subheader class="master-category-list-item text-h5" v-bind:key="masterId">
          {{ listMasterCategoryName(masterId) }}
        </v-subheader>
        <v-list-item
          class="category-list-item"
          v-for="category in categories"
          :key="`master-${category._id}`"
          @click="onCategorySelected(category._id)"
        >
          <v-list-item-content :key="`category-${category._id}`">
            <category-item-text :category="category" :show-balance="showBalance" show-swatch />
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          dense
          class="category-list-item"
          v-if="showAddCategory(masterId)"
          :key="`add-${masterId}`"
          @click="onCategoryAdd(masterId)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-row class="pa-0 ma-0">
                <v-sheet width="3px" height="15px" :color="masterCategoryColor(masterId)" class="mr-1" />
                <v-col class="ma-0 pa-0"> Add '{{ search }}' to {{ listMasterCategoryName(masterId) }} </v-col>
              </v-row>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ID_LENGTH, NONE, HIDDEN, AMOUNT_RED, AMOUNT_GREEN } from '../../constants'
import _ from 'lodash'
import CategoryItemText from './CategoryItemText.vue'

export default {
  emits: ['selected'],
  components: {
    CategoryItemText
  },
  props: {
    showBalance: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      search: ''
    }
  },
  computed: {
    ...mapGetters(['categoryColors', 'categoriesByMaster', 'masterCategoriesById', 'intlCurrency']),
    ...mapGetters('categoryMonth', ['categoriesDataById']),

    searchedMasterCategories() {
      const search = this.search.toLowerCase()
      return Object.entries(this.categoriesByMaster).reduce((partial, [masterId, categories]) => {
        if ([HIDDEN._id, 'undefined'].includes(masterId)) {
          return partial
        }
        if (search) {
          const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(search))
          partial[masterId] = filteredCategories
        } else {
          partial[masterId] = categories
        }
        return partial
      }, {})
    }
  },
  methods: {
    ...mapActions(['createCategory']),
    onCategorySelected(categoryId) {
      this.$emit('selected', categoryId)
    },
    onCategoryAdd(masterId) {
      this.createCategory({ name: this.search, master_id: masterId }).then((category_id) => {
        this.onCategorySelected(category_id)
      })
    },
    listMasterCategoryName(masterId) {
      return _.get(this.masterCategoriesById, [masterId, 'name'], 'Undefined')
    },
    showAddCategory(masterId) {
      if (this.search.length < 1) {
        return false
      }
      return ![NONE._id].includes(masterId)
    },
    masterCategoryColor(master_id) {
      return _.get(this, ['masterCategoriesById', master_id, 'color', 'hex'], 'transparent')
    }
  }
}
</script>

<style>
.v-subheader.master-category-list-item {
  height: 20px;
}

.v-list-item.category-list-item {
  min-height: 20px;
}

.v-list-item.category-list-item .v-list-item__content {
  padding: 2px 5px;
}

.category-element-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.category-element-container span {
  display: flex;
  flex-direction: row;
}
</style>
