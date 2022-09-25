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
        primary: hslToHex('hsl(80, 100%, 51%)'),
        secondary: hslToHex('hsl(245, 40%, 50%)'),
        accent: hslToHex('hsl(253, 100%, 72%)'),
        background: {
          base: hslToHex('hsl(245, 9%, 19%)'),
          darken1: hslToHex('hsl(251, 9%, 18%)'),
          lighten1: hslToHex('hsl(254, 9%, 21%)'),
          lighten2: hslToHex('hsl(248, 9%, 25%)')
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

function hslToHex(hsl) {
  hsl= hsl.replace('hsl(', '').replace(')', '').split(',')
  const h = parseInt(hsl[0])
  const s = parseInt(hsl[1])
  let l = parseInt(hsl[2])

  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0') // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}