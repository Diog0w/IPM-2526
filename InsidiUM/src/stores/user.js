/**
 * Store Pinia para gestão do estado do utilizador
 * Mantém o utilizador autenticado e sincroniza com localStorage
 */
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    // Tenta ler do localStorage ao iniciar com tratamento de erro
    let user = null
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        user = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erro ao ler user do localStorage:', error)
      localStorage.removeItem('user')
    }
    return { user }
  },
  
  getters: {
    /**
     * Verifica se o utilizador está autenticado
     * @returns {boolean} true se o utilizador estiver autenticado
     */
    isAuthenticated: (state) => state.user !== null
  },
  
  actions: {
    /**
     * Guarda o utilizador na store e no localStorage
     * @param {Object} user - Objeto com dados do utilizador
     */
    // Apenas guarda o utilizador na store e no localStorage
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    /**
     * Faz logout do utilizador removendo dados da store e do localStorage
     */
    // Limpa tudo
    logout() {
      this.user = null
      localStorage.removeItem('user')
    }
  }
})