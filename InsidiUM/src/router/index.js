/**
 * Configuração das rotas da aplicação
 * Define as rotas disponíveis e os componentes correspondentes
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginPage from '../views/LoginPage.vue'
import SignUpPage from '../views/SignUpPage.vue'
import DashboardView from '../views/DashboardView.vue'
import MapView from '../views/MapView.vue'
import TemporalSeriesView from '../views/TemporalSeriesView.vue'
import CompareView from '../views/CompareView.vue'

const router = createRouter({
  // Utiliza o modo de histórico HTML5 para navegação
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage, // Página de login - rota inicial
      alias: '/login'
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpPage // Página de registo
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView, // Dashboard principal com estatísticas e anomalias
      meta: { requiresAuth: true } // Requer autenticação
    },
    {
      path: '/map',
      name: 'map',
      component: MapView, // Visualização de mapas com filtros
      meta: { requiresAuth: true } // Requer autenticação
    },
    {
      path: '/temporal',
      name: 'temporal',
      component: TemporalSeriesView, // Visualização de séries temporais
      meta: { requiresAuth: true } // Requer autenticação
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView, // Comparação entre cidades
      meta: { requiresAuth: true } // Requer autenticação
    }
  ],
})

// Router guard para proteger rotas que requerem autenticação
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // Se a rota requer autenticação e o utilizador não está autenticado
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // Redireciona para a página de login
    next({ name: 'login' })
  } 
  // Se o utilizador está autenticado e tenta acessar a página de login ou signup
  else if ((to.name === 'login' || to.name === 'signup') && userStore.isAuthenticated) {
    // Redireciona para o dashboard
    next({ name: 'dashboard' })
  } 
  // Caso contrário, permite o acesso
  else {
    next()
  }
})

export default router