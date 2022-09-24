import Vue from 'vue'
import Vuetify from 'vuetify/lib'

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
        primary: '#00ff84',
        accent: '#ff00ff',
        background: {
          base: '#2d3334',
          darken1: '#2a3032',
          lighten1: '#31383a',
          lighten2: '#3b4345'
        },
        delete: '#391616',
        delete_text: '#ff4343'
      }
    },
    dark: true,
    options: {
      customProperties: true
    }
  }
})
