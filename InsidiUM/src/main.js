/**
 * Ponto de entrada da aplicação Vue
 * Inicializa os plugins (Pinia para gestão de estado e Router para navegação)
 * e monta a aplicação no elemento #app do DOM
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Cria a instância da aplicação Vue
const app = createApp(App)

// Registra o Pinia para gestão de estado global
app.use(createPinia())
// Registra o router para navegação entre páginas
app.use(router)

// Monta a aplicação no elemento #app do HTML
app.mount('#app')
