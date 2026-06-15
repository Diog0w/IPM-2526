/**
 * Configuração do Vite para o projeto
 * Define plugins Vue e Vue DevTools, e configura aliases de caminho
 * @returns {Object} Configuração do Vite
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //vueDevTools(), // icon que aparece em baixo com as devtools (Remover no final)
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
