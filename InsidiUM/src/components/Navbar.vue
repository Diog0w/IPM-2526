<!-- 
  Componente de navegação superior (Navbar)
  Inclui link para dashboard, título da aplicação e botão de logout
  Emite evento 'logout' quando o utilizador clica no ícone de logout
-->
<template>
  <header
    class="bg-[#0b1e44] text-white flex items-center justify-between px-4 h-12 shadow-md sticky top-0 z-50 group"
  >
    <router-link 
      to="/dashboard" 
      class="relative flex items-center cursor-pointer"
    >
      <img
        src="@/assets/home-icon.png"
        alt="Home"
        class="w-6 h-6 filter invert brightness-0"
      />

      <span
        class="absolute left-7 bg-[#0b1e44] text-sm px-2 py-0.5 rounded 
               opacity-0 invisible transition-all duration-200
               group-hover:opacity-100 group-hover:visible group-hover:translate-x-1"
      >
        Dashboard
      </span>
    </router-link>

    <h1 class="text-lg font-bold pointer-events-none absolute left-1/2 -translate-x-1/2">
      InsidiUM
    </h1>

    <div class="relative flex items-center cursor-pointer" @click="$emit('logout')">
      <img
        src="@/assets/logout-icon.png"
        alt="Logout"
        class="w-6 h-6 filter invert brightness-0"
      />

      <span
        class="absolute right-7 bg-[#0b1e44] text-sm px-2 py-0.5 rounded 
               opacity-0 invisible transition-all duration-200
               group-hover:opacity-100 group-hover:visible group-hover:-translate-x-1"
      >
        Log Out
      </span>
    </div>
  </header>
</template>

<script>
/**
 * Componente de barra de navegação superior
 * Exibe link para dashboard, título da aplicação e botão de logout
 * Emite evento 'logout' quando o utilizador clica no ícone de logout
 * Utilizado em todas as views autenticadas (Dashboard, Map, Temporal, Compare)
 */
export default {
  name: "Navbar",
};
</script>