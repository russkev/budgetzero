<template>
  <sidebar-list :mini="mini">
    <v-hover #default="{ hover }">
      <v-list-group
        :prepend="iconActive"
        :class="`sidebar-group ${isHighlighted(hover) ? 'sidebar-group-active' : ''}`"
        v-model="isOpen"
      >
        <template #prependIcon>
          <div class="d-flex" style="height: 100%">
            <sidebar-select-indicator :active="!isOpen && childIsSelected" />
            <v-icon :color="isHighlighted(hover) ? 'secondary lighten-2' : ''" class="sidebar-group-icon">
              {{ isHighlighted(hover) ? iconActive : icon }}
            </v-icon>
          </div>
        </template>
        <template v-slot:activator>
          <v-list-item-content class="pa-0">
            <v-list-item-title :class="`text-h6 ${isHighlighted(hover) ? 'secondary--text text--lighten-2' : ''}`">
              {{ title }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ accountTotal }}</v-list-item-subtitle>
          </v-list-item-content>
        </template>
        <slot></slot>
      </v-list-group>
    </v-hover>
  </sidebar-list>
</template>

<script>
import SidebarSelectIndicator from './SidebarSelectIndicator.vue'

export default {
  name: 'SidebarAccountGroup',
  components: {
    SidebarSelectIndicator
  },
  data() {
    return {
      isOpen: true
    }
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    iconActive: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    accountTotal: {
      type: String,
      required: true
    },
    childIsSelected: {
      type: Boolean,
      default: false
    },
    mini: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    isHighlighted(hover) {
      return hover || this.childIsSelected
    }
  }
}
</script>

<style>
.sidebar-group-icon {
  margin-left: 16px;
}
#sidebar.v-list-item__icon .v-icon,
#sidebar.v-list-item__icon.v-list-group__header__append-icon,
#sidebar.v-list-group__header {
  color: unset;
  caret-color: unset;
}
#sidebar .v-list-group {
  color: unset !important;
  caret-color: unset !important;
}
</style>
