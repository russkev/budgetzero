<template>
  <v-hover #default="{ hover }">
    <v-list-item
      #default="{ active }"
      class="pl-0 ml-1 sidebar-item header-sidebar-item"
      :to="destination"
      active-class="active-sidebar-item"
      :data-testid="dataTestid"
      :id="id"
    >
      <div class="account-avatar-wrapper height-48">
        <sidebar-select-indicator :active="isHighlighted(active, hover)" />
        <v-list-item-icon>
          <v-icon :color="isHighlighted(active, hover) ? 'secondary lighten-2' : ''">
            {{ isHighlighted(active, hover) ? 'mdi-shape' : 'mdi-shape-outline' }}
          </v-icon>
        </v-list-item-icon>
      </div>
      <v-list-item-content>
        <v-list-item-title class="text-h6"><slot></slot></v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-hover>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarSelectIndicator from './SidebarSelectIndicator.vue'

export default {
  name: 'SidebarNavItem',
  components: {
    SidebarSelectIndicator
  },
  props: {
    icon: {
      type: String,
      default: ''
    },
    iconActive: {
      type: String,
      default: ''
    },
    destination: {
      type: Object,
      default: {}
    },
    focusedId: {
      type: String,
      default: ''
    },
    dataTestid: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['selectedMonth'])
  },
  methods: {
    isHighlighted(active, hover) {
      return active || hover || this.focusedId === this.id
    }
  }
}
</script>
