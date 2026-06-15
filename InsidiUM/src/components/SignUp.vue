<template>
  <div class="relative flex items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0b1e44] to-[#06152e]">
    <img src="@/assets/pattern.png" alt="pattern" class="absolute top-[-150px] left-[-150px] w-[700px] opacity-40 select-none pointer-events-none rotate-180" />
    <img src="@/assets/pattern.png" alt="pattern" class="absolute bottom-[-150px] right-[-150px] w-[700px] opacity-40 select-none pointer-events-none" />

    <form @submit.prevent="handleSignUp" class="z-10 flex flex-col w-[90%] max-w-[400px] p-10 bg-white rounded-2xl shadow-xl">
      <h1 class="mb-8 text-2xl font-bold text-center text-gray-900">InsidiUM - Sign Up</h1>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center border border-red-200">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm text-center border border-green-200">
        {{ successMessage }}
      </div>

      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium text-gray-700">Username</label>
        <input v-model="username" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium text-gray-700">Password</label>
        <input v-model="password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="mb-6">
        <label class="block mb-1 text-sm font-medium text-gray-700">Occupation</label>
        <select v-model="occupation" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Selecione uma ocupação</option>
          <option value="estudante">Estudante</option>
          <option value="cientista">Cientista</option>
          <option value="vereadora">Vereadora</option>
        </select>
      </div>

      <div class="flex justify-center gap-3">
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Criando conta...' : 'Sign Up' }}
        </button>
        <button 
          type="button" 
          @click="goToLogin"
          class="px-6 py-2 font-semibold text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Log In
        </button>
      </div>
    </form>
  </div>
</template>

<script>
/**
 * Componente de registo de utilizador
 * Valida dados, verifica duplicados e cria nova conta na base de dados
 */
export default {
  data() {
    return {
      username: '',
      password: '',
      occupation: '', // Valor padrão: 'estudante' se não selecionado
      errorMessage: '',
      successMessage: '',
      isLoading: false
    }
  },
  methods: {
    /**
     * Redireciona para a página de login
     * Chamado quando o utilizador clica no botão "Log In"
     */
    goToLogin() {
      this.$router.push('/login')
    },
    /**
     * Processa o registo do utilizador
     * 1. Valida campos obrigatórios
     * 2. Verifica se username já existe
     * 3. Calcula próximo ID (string, consistente com db.json)
     * 4. Cria novo utilizador
     * 5. Redireciona para login após sucesso
     */
    async handleSignUp() {
      this.errorMessage = ''
      this.successMessage = ''
      this.isLoading = true

      try {
        // Validação: campos obrigatórios
        if (!this.username.trim() || !this.password.trim()) {
          this.errorMessage = 'Por favor, preencha o nome de utilizador e a palavra-passe.'
          this.isLoading = false
          return
        }

        // Verificar se username já existe
        const checkResponse = await fetch(`http://localhost:3000/users?username=${this.username}`)
        if (!checkResponse.ok) throw new Error('Erro de conexão')
        
        const existingUsers = await checkResponse.json()
        if (existingUsers.length > 0) {
          this.errorMessage = 'Este nome de utilizador já existe. Por favor, escolha outro.'
          this.isLoading = false
          return
        }

        // Occupation padrão: 'estudante' se não selecionado
        const finalOccupation = this.occupation || 'estudante'

        // Calcular próximo ID: converter IDs para números, encontrar máximo, converter de volta para string
        const allUsersResponse = await fetch('http://localhost:3000/users')
        if (!allUsersResponse.ok) throw new Error('Erro de conexão')
        const allUsers = await allUsersResponse.json()
        const nextId = allUsers.length > 0 
          ? String(Math.max(...allUsers.map(u => Number(u.id))) + 1) 
          : "1"

        // Criar novo utilizador
        const newUser = {
          id: nextId, // ID como string (consistente com formato do db.json)
          username: this.username.trim(),
          password: this.password,
          occupation: finalOccupation
        }

        const createResponse = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        })

        if (!createResponse.ok) throw new Error('Erro ao criar conta')

        // Sucesso: mostrar mensagem e redirecionar após 1.5s
        this.successMessage = 'Conta criada com sucesso! A redirecionar...'
        setTimeout(() => this.$router.push('/login'), 1500)

      } catch (error) {
        console.error(error)
        this.errorMessage = 'Erro ao tentar criar conta. Por favor, tente novamente.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

