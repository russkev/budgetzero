<template>
  <sidebar-list :mini="mini">
    <v-hover #default="{ hover }">
      <v-list-group
        :prepend="iconActive"
        :class="`sidebar-group ${!isOpen && childIsSelected ? 'sidebar-group-active' : ''}`"
        v-model="isOpen"
      >
        <template #prependIcon>
          <v-icon :color="isHighlighted(hover) ? 'secondary lighten-2' : ''" class="ma-0">
            {{ isHighlighted(hover) ? iconActive : icon }}
          </v-icon>
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
export default {
  name: 'SidebarAccountGroup',
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
  // computed: {
  //   isOpen: {
  //     get() {
  //       return this.value
  //     },
  //     set(value) {
  //       this.$emit('input', value)
  //     }
  //   }
  // },
  methods: {
    isHighlighted(hover) {
      return hover || this.childIsSelected
    }
  }
}
</script>
