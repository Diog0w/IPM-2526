<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar @logout="logout" />

    <TemporalSeriesContent />
  </div>
</template>

<!-- 
  View de séries temporais
  Exibe gráficos de linha de área com dados mensais (preço médio ou volume de atividade)
  Permite exportar dados em CSV ou JSON
  Rota /temporal (requer autenticação)
-->
<script>
import Navbar from '@/components/Navbar.vue'
import TemporalSeriesContent from '@/components/TemporalSeriesContent.vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'TemporalSeriesView',
  components: {
    Navbar,
    TemporalSeriesContent,
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