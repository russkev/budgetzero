// import 'vuetify/dist/vuetify.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { hslStringToHex } from '../helper'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#263238', // '#607D8B',
        accent: '#8E292F',
        secondary: '#8FAAA0',
        background: '#455A64',
        background_lighten: '#B0BEC5',
        success: '#437548',
        info: '#355B79',
        warning: '#FB8C00',
        error: '#FF5252',
        header_background: '#f5f5f5',
        table_header: '#263238'
      },
      dark: {
        // primary: '#354148',
        primary: hslStringToHex('hsl(196, 100%, 51%)'),
        secondary: hslStringToHex('hsl(244, 18%, 57%)'),
        accent: hslStringToHex('hsl(253, 100%, 72%)'),
        background: {
          base: hslStringToHex('hsl(245, 9%, 19%)'),
          darken1: hslStringToHex('hsl(251, 9%, 18%)'),
          lighten1: hslStringToHex('hsl(254, 9%, 21%)'),
          lighten2: hslStringToHex('hsl(248, 9%, 25%)')
        },
        delete: '#391616',
        delete_text: '#ff4343',
        unhide: '#173715',
        unhide_text: '#77d274'
      }
    },
    dark: true,
    options: {
      customProperties: true
    }
  }
})

