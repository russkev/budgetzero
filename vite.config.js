import { defineConfig } from 'vite'
import { createVuePlugin as vue } from 'vite-plugin-vue2' //vue 2
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
// const path = require('path')
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VuetifyResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
      // find: /^@\/(.+)/,
      // replacement: path.resolve(__dirname, 'src') + '/$1'
    }
  },
  server: {
    port: 8080
  },
  preview: {
    port: 8080
  },
  // build: {
  //   rollupOptions: {
  //     input: {
  //       app: 'public/index.html'
  //     }
  //   }
  // }
})
