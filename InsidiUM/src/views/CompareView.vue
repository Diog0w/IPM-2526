<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar @logout="logout" />
    <CompareContent />
  </div>
</template>

<!-- 
  View de comparação entre cidades/países
  Exibe gráfico de barras lado a lado comparando duas cidades ou países
  Permite exportar dados de comparação em CSV ou JSON
  Rota /compare (requer autenticação)
-->
<script>
import Navbar from '@/components/Navbar.vue'
import CompareContent from '@/components/CompareContent.vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'CompareView',
  components: {
    Navbar,
    CompareContent,
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