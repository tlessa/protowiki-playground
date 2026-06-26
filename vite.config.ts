
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'

// Temporary local-machine configuration.
// Replace this with the official ProtoWiki Vite configuration once it is added back to GitHub.
export default defineConfig({
  base: '/protowiki-playground/',
  plugins: [
    VueRouter({
      routesFolder: [
        {
          src: 'src/prototypes',
          filePatterns: ['**/index'],
        },
      ],
      dts: 'src/typed-router.d.ts',
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
