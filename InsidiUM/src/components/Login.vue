<template>
  <div class="relative flex items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0b1e44] to-[#06152e]">
    <img src="@/assets/pattern.png" alt="pattern" class="absolute top-[-150px] left-[-150px] w-[700px] opacity-40 select-none pointer-events-none rotate-180" />
    <img src="@/assets/pattern.png" alt="pattern" class="absolute bottom-[-150px] right-[-150px] w-[700px] opacity-40 select-none pointer-events-none" />

    <form @submit.prevent="handleLogin" class="z-10 flex flex-col w-[90%] max-w-[400px] p-10 bg-white rounded-2xl shadow-xl">
      <h1 class="mb-8 text-2xl font-bold text-center text-gray-900">InsidiUM</h1>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center border border-red-200">
        {{ errorMessage }}
      </div>

      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium text-gray-700">Username</label>
        <input v-model="username" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="mb-6">
        <label class="block mb-1 text-sm font-medium text-gray-700">Password</label>
        <input v-model="password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="flex justify-center gap-3">
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Entering...' : 'Log In' }}
        </button>
        <button 
          type="button" 
          @click="goToSignUp"
          class="px-6 py-2 font-semibold text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Sign Up
        </button>
      </div>
    </form>
  </div>
</template>

<script>
/**
 * Componente de Login
 * Permite ao utilizador fazer login através de username e password
 * Valida credenciais contra a API e guarda o utilizador na store
 */
// 1. Importar a store
import { useUserStore } from '@/stores/user'

export default {
  /**
   * Inicializa os dados reativos do componente
   * @returns {Object} Objeto com username, password, errorMessage e isLoading
   */
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isLoading: false
    }
  },
  /**
   * Disponibiliza a store de utilizador no componente
   * @returns {Object} Objeto com userStore
   */
  // 2. Disponibilizar a store no componente
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  methods: {
    /**
     * Redireciona para a página de sign up
     */
    goToSignUp() {
      this.$router.push('/signup')
    },
    /**
     * Processa o login do utilizador
     * Valida credenciais contra a API, guarda o utilizador na store e redireciona para o dashboard
     * @async
     */
    async handleLogin() {
      this.errorMessage = ''
      this.isLoading = true

      try {
        // Lógica de FETCH mantém-se AQUI
        const response = await fetch(`http://localhost:3000/users?username=${this.username}`)
        
        if (!response.ok) throw new Error('Erro de conexão')
        
        const users = await response.json()

        if (users.length === 0) {
          this.errorMessage = 'Utilizador não encontrado.'
          this.isLoading = false
          return
        }

        const user = users[0]

        if (user.password === this.password) {
          // SUCESSO!
          
          // 3. Apenas guardamos o utilizador na Store
          this.userStore.setUser(user)
          
          // Redirecionamos
          this.$router.push('/dashboard')
        } else {
          this.errorMessage = 'Password incorreta.'
        }

      } catch (error) {
        console.error(error)
        this.errorMessage = 'Erro ao tentar fazer login.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>