import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// import { createVuePlugin as vue } from 'vite-plugin-vue2' //vue 2
// import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
// import Components from 'unplugin-vue-components/vite'
// import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // createVuePlugin({
    //   template: {
    //     compilerOptions: {
    //       compatConfig: {
    //         MODE: 2
    //       }
    //     }
    //   }
    // }),
    vue({
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/variables.scss'
      }
    })
    // Components({
    //   resolvers: [VuetifyResolver()]
    // })
  ],
  // css: {
  //   preprocessorOptions: {
  //     sass: {
  //       additionalData: [
  //         // Make the variables defined in these files available to all components, without requiring an explicit
  //         // @import of the files themselves
  //         '@import "./src/styles/variables"',
  //         '@import "vuetify/src/styles/settings/_variables"',
  //         '' // end with newline
  //       ].join('\n')
  //     }
  //   }
  // },
  resolve: {
    alias: {
      vue: '@vue/compat',
      // '@': path.resolve(__dirname, './src')
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: { 'process.env': {} },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  server: {
    port: 8082 // cypress
    // port: 8080
  },
  preview: {
    port: 8080
  },
  publicDir: 'public'
})
