import { createVuetify } from 'vuetify'
import { hslStringToHex } from '../helper'
import ZeroIcon from '../components/Icons/zero.vue'
// import '../styles/variables.scss'
// import '../styles/fonts.scss'
// import 'vuetify/styles'

const budgetZeroDark = {
  dark: true,
  background: hslStringToHex('hsl(245, 9%, 19%)'),
  surface: hslStringToHex('hsl(245, 9%, 19%)'),
  primary: hslStringToHex('hsl(200, 36%, 62%)'),
  secondary: hslStringToHex('hsl(242, 15%, 61%)'),
  info: hslStringToHex('hsl(200, 34%, 53%)'),
  // primary: hslStringToHex('hsl(200, 36%, 62%)'),
  // info: hslStringToHex('hsl(200, 34%, 53%)'),
  // secondary: hslStringToHex('hsl(242, 15%, 61%)'),
  // accent: hslStringToHex('hsl(253, 100%, 72%)'),
  // background: {
  //   base: hslStringToHex('hsl(245, 9%, 19%)'),
  //   lighten5: hslStringToHex('hsl(248, 9%, 37%)'),
  //   lighten4: hslStringToHex('hsl(248, 9%, 33%)'),
  //   lighten3: hslStringToHex('hsl(248, 9%, 29%)'),
  //   lighten2: hslStringToHex('hsl(248, 9%, 25%)'),
  //   lighten1: hslStringToHex('hsl(254, 9%, 21%)'),
  //   darken1: hslStringToHex('hsl(251, 9%, 18%)'),
  //   darken2: hslStringToHex('hsl(251, 9%, 14%)'),
  //   darken3: hslStringToHex('hsl(251, 9%, 10%)'),
  //   darken4: hslStringToHex('hsl(251, 9%, 5%)')
  // },
  delete: '#391616',
  delete_text: '#ff4343',
  unhide: '#173715',
  unhide_text: '#77d274'
}

// export default createVuetify({
//   theme: {
//     themes: {
//       light: {
//         colors: {
//           primary: '#1867C0',
//           secondary: '#5CBBF6'
//         }
//       },
//       budgetZeroDark
//     },
//     defaultTheme: 'budgetZeroDark'
//   },
//   icons: {
//     values: {
//       custom: {
//         component: ZeroIcon
//       }
//     }
//   }
// })

export default createVuetify({
  icons: {
    values: {
      custom: {
        component: ZeroIcon
      }
    }
  }
})

// export default createVuetify({
//   theme: {
//     themes: {
//       light: {
//         primary: '#263238', // '#607D8B',
//         accent: '#8E292F',
//         secondary: '#8FAAA0',
//         background: '#455A64',
//         background_lighten: '#B0BEC5',
//         success: '#437548',
//         info: '#355B79',
//         warning: '#FB8C00',
//         error: '#FF5252',
//         header_background: '#f5f5f5',
//         table_header: '#263238'
//       },
//       dark: {
//         // primary: '#354148',
//         primary: hslStringToHex('hsl(200, 36%, 62%)'),
//         info: hslStringToHex('hsl(200, 34%, 53%)'),
//         secondary: hslStringToHex('hsl(242, 15%, 61%)'),
//         accent: hslStringToHex('hsl(253, 100%, 72%)'),
//         background: {
//           base: hslStringToHex('hsl(245, 9%, 19%)'),
//           lighten5: hslStringToHex('hsl(248, 9%, 37%)'),
//           lighten4: hslStringToHex('hsl(248, 9%, 33%)'),
//           lighten3: hslStringToHex('hsl(248, 9%, 29%)'),
//           lighten2: hslStringToHex('hsl(248, 9%, 25%)'),
//           lighten1: hslStringToHex('hsl(254, 9%, 21%)'),
//           darken1: hslStringToHex('hsl(251, 9%, 18%)'),
//           darken2: hslStringToHex('hsl(251, 9%, 14%)'),
//           darken3: hslStringToHex('hsl(251, 9%, 10%)'),
//           darken4: hslStringToHex('hsl(251, 9%, 5%)')
//         },
//         delete: '#391616',
//         delete_text: '#ff4343',
//         unhide: '#173715',
//         unhide_text: '#77d274'
//       }
//     },
//     dark: true,
//     options: {
//       customProperties: true
//     }
//   },
//   icons: {
//     values: {
//       custom: {
//         component: ZeroIcon
//       }
//     }
//   }
// })
