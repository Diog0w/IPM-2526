<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <Navbar @logout="logout" />

    <!-- Conteúdo principal -->
    <DashboardContent />
  </div>
</template>

<!-- 
  View do Dashboard principal
  Exibe estatísticas agregadas, filtros e tabela de anomalias dos listings
  Rota /dashboard (requer autenticação)
-->
<script>
import Navbar from '@/components/Navbar.vue'
import DashboardContent from '@/components/DashboardContent.vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'DashboardView',
  components: {
    Navbar,
    DashboardContent,
  },
  /**
   * Inicializa a store de utilizador e disponibiliza no componente
   * @returns {Object} Objeto com userStore
   */
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  methods: {
    /**
     * Faz logout do utilizador limpando a store e redirecionando para a página de login
     * Chamado quando o utilizador clica no botão de logout na Navbar
     */
    logout() {
      this.userStore.logout()
      this.$router.push('/')
    },
  },
}
</script>
