<!-- 
  View da página de login
  Utiliza o componente Login para permitir autenticação de utilizadores
  Rota inicial da aplicação (/ e /login)
-->
<script>
import Login from '@/components/Login.vue'

export default {
  components: { Login },
}
</script>

<template>
  <Login />
</template>
