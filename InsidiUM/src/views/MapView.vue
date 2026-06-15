<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <Navbar @logout="logout" />
      <MapContent />
    </div>
  </template>
  
<!-- 
  View de visualização de mapas interativos
  Exibe mapa Leaflet com marcadores coloridos baseados em anomalias dos listings
  Permite filtrar por país, cidade, bairro, preço e atividade
  Rota /map (requer autenticação)
-->
  <script>
  import Navbar from '@/components/Navbar.vue'
  import MapContent from '@/components/MapContent.vue'
  import { useUserStore } from '@/stores/user'
  
  export default {
    name: "MapView",
    components: {
      Navbar,
      MapContent
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
      }
    }
  }
  </script>
  