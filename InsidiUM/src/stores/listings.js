/**
 * Store Pinia para gestão dos listings
 * Gerencia o estado dos listings, carrega dados da API e fornece getters para cálculos
 */
import { defineStore } from 'pinia'

// Constantes para valores de fallback (garantir consistência em todo o código)
const FALLBACK_VALUES = {
  CURRENT_MONTH_INDEX: 9,        // Outubro (0-based: 0=Janeiro, 11=Dezembro)
  HIGH_PRICE_THRESHOLD: 100,      // Threshold padrão para anomalias de preço alto (€)
  MAX_PRICE: 500,                  // Preço máximo padrão para filtros (€)
  DEFAULT_COUNTRY: 'Portugal'      // País padrão para inicialização
}

export const useListingsStore = defineStore('listings', {
  state: () => ({
    listings: [],
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Filtra listings por cidade ou país (se city = "All")
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {Array} Array de listings da cidade especificada ou de todas as cidades do país
     */
    listingsByCity: (state) => (city, country = null) => {
      if (!city || state.listings.length === 0) return []
      if (city === "All" && country) {
        return state.listings.filter(l => l.country === country)
      }
      return state.listings.filter(l => l.city === city)
    },

    /**
     * Conta o total de listings de uma cidade ou país
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {number} Número total de listings
     */
    totalListings: (state) => (city, country = null) => {
      if (city === "All" && country) {
        // Filtrar por país e agregar dados de todas as cidades desse país
        return state.listings.filter(l => l.country === country).length
      }
      const filtered = state.listings.filter(l => l.city === city)
      return filtered.length
    },

    /**
     * Calcula o preço médio dos listings de uma cidade ou país
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {number} Preço médio arredondado
     */
    averagePrice: (state) => (city, country = null) => {
      let filtered = []
      if (city === "All" && country) {
        filtered = state.listings.filter(l => l.country === country)
      } else {
        filtered = state.listings.filter(l => l.city === city)
      }
      if (filtered.length === 0) return 0
      const validPrices = filtered.filter(l => typeof l.price === 'number')
      if (validPrices.length === 0) return 0
      const sum = validPrices.reduce((acc, curr) => acc + curr.price, 0)
      return Math.round(sum / validPrices.length)
    },

    /**
     * Calcula a percentagem de listings com reviews (substituto de ocupação)
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {number} Percentagem de listings com reviews
     */
    // 1. Percentagem de Casas com Reviews (Substituto de Ocupação)
    activeListingsPercentage: (state) => (city, country = null) => {
      let filtered = []
      if (city === "All" && country) {
        filtered = state.listings.filter(l => l.country === country)
      } else {
        filtered = state.listings.filter(l => l.city === city)
      }
      if (filtered.length === 0) return 0

      // Conta quantas têm data de review
      const withReviews = filtered.filter(l => l.last_review !== null).length
      
      // Calcula percentagem
      return Math.round((withReviews / filtered.length) * 100)
    },

    /**
     * Calcula a média de listings por host
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {string} Média de listings por host (com 1 casa decimal)
     */
    // 2. Média de Casas por Host (Substituto de Noites)
    avgListingsPerHost: (state) => (city, country = null) => {
      let filtered = []
      if (city === "All" && country) {
        filtered = state.listings.filter(l => l.country === country)
      } else {
        filtered = state.listings.filter(l => l.city === city)
      }
      if (filtered.length === 0) return 0

      // Cria um Set para contar hosts únicos
      const uniqueHosts = new Set(filtered.map(l => l.host_name)).size
      
      if (uniqueHosts === 0) return 0

      // Ex: 30 casas a dividir por 10 hosts = 3 casas por host
      return (filtered.length / uniqueHosts).toFixed(1)
    },

    /**
     * Identifica e conta anomalias nos listings de uma cidade ou país
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {Array} Array de objetos com name e value para cada tipo de anomalia
     */
    getAnomalies: (state) => (city, country = null) => {
       let filtered = []
       if (city === "All" && country) {
         filtered = state.listings.filter(l => l.country === country)
       } else {
         filtered = state.listings.filter(l => l.city === city)
       }
       if (filtered.length === 0) return []
       
       // Calcular threshold dinâmico para "High Price"
       const validPrices = filtered
         .filter(l => typeof l.price === 'number' && l.price !== null && l.price > 0)
         .map(l => l.price)
         .sort((a, b) => a - b)
       
      let highPriceThreshold = FALLBACK_VALUES.HIGH_PRICE_THRESHOLD
      if (validPrices.length > 0) {
        // Percentil 90
        const index = Math.ceil(validPrices.length * 0.9) - 1
        highPriceThreshold = validPrices[Math.max(0, Math.min(index, validPrices.length - 1))]
        highPriceThreshold = Math.ceil(highPriceThreshold / 10) * 10 // Arredondar para cima
      }
       
       const missingPrice = filtered.filter(l => l.price === null || l.price === undefined).length
       const highPrice = filtered.filter(l => typeof l.price === 'number' && l.price > highPriceThreshold).length
       const licenseIssues = filtered.filter(l => !l.license || l.license === 'Exempt' || l.license === 'null').length
       const noReviews = filtered.filter(l => !l.last_review).length
       
       const hostCounts = {}
       filtered.forEach(l => { hostCounts[l.host_name] = (hostCounts[l.host_name] || 0) + 1 })
       const multiHostListings = Object.values(hostCounts).filter(count => count > 1).length

       return [
        { name: 'Listings with Missing Price', value: missingPrice },
        { name: `Price > ${highPriceThreshold}€`, value: highPrice },
        { name: 'Hosts with > 1 listing', value: multiHostListings },
        { name: 'No License / Exempt', value: licenseIssues },
        { name: 'Never Reviewed (Inactive)', value: noReviews },
      ]
    },

    /**
     * Calcula atividade por mês baseada nas datas de última review
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {Array} Array com 12 valores (um para cada mês) representando número de reviews
     */
    // --- Getter para o gráfico do Compare (Activity) ---
    getActivityByMonth: (state) => (city, country = null) => {
      // Inicializa array com 12 zeros (Jan a Dez)
      const months = Array(12).fill(0)
      
      let filtered = []
      if (city === "All" && country) {
        filtered = state.listings.filter(l => l.country === country)
      } else {
        filtered = state.listings.filter(l => l.city === city)
      }

      filtered.forEach(l => {
        if (l.last_review) {
          // Ex: "2025-09-09" -> split('-') -> ["2025", "09", "09"]
          const monthStr = l.last_review.split('-')[1] // "09"
          const monthIndex = parseInt(monthStr) - 1    // 8 (Setembro)
          
          if (monthIndex >= 0 && monthIndex < 12) {
            months[monthIndex]++
          }
        }
      })
      
      return months
    },

    /**
     * Calcula o preço médio por mês baseado nas listings ativas nesse mês (data de review)
     * @param {string} city - Nome da cidade ou "All"
     * @param {string} country - Nome do país (necessário quando city = "All")
     * @returns {Array} Array com 12 valores (preço médio ou 0)
     */
    // --- Getter para o gráfico do Compare (Price) ---
    getPriceByMonth: (state) => (city, country = null) => {
      const sums = Array(12).fill(0)   // Soma dos preços por mês
      const counts = Array(12).fill(0) // Quantidade de casas por mês
      
      let filtered = []
      if (city === "All" && country) {
        filtered = state.listings.filter(l => l.country === country)
      } else {
        filtered = state.listings.filter(l => l.city === city)
      }

      filtered.forEach(l => {
        // Só consideramos se tiver data E preço válido
        if (l.last_review && typeof l.price === 'number') {
          const monthStr = l.last_review.split('-')[1]
          const monthIndex = parseInt(monthStr) - 1
          
          if (monthIndex >= 0 && monthIndex < 12) {
            sums[monthIndex] += l.price
            counts[monthIndex]++
          }
        }
      })

      // Calcular médias
      return sums.map((sum, index) => {
        const count = counts[index]
        return count > 0 ? Math.round(sum / count) : 0
      })
    },

    /**
     * Calcula o preço máximo de todos os listings
     * @returns {number} Preço máximo encontrado, ou valor de fallback se não houver preços válidos
     */
    maxPrice: (state) => {
      if (state.listings.length === 0) return FALLBACK_VALUES.MAX_PRICE
      
      const validPrices = state.listings
        .filter(l => typeof l.price === 'number' && l.price !== null)
        .map(l => l.price)
      
      if (validPrices.length === 0) return FALLBACK_VALUES.MAX_PRICE
      
      const max = Math.max(...validPrices)
      // Arredondar para cima para o próximo múltiplo de 10 para facilitar o uso no slider
      return Math.ceil(max / 10) * 10
    },

    /**
     * Extrai países e cidades únicos dos listings
     * Agrupa cidades por país baseado no campo "country" dos listings
     * @returns {Object} Objeto com países como chaves e arrays de cidades únicas ordenadas como valores
     */
    countriesAndCities: (state) => {
      const countriesMap = {}
      
      // Extrair países e cidades únicos dos listings
      state.listings.forEach(listing => {
        if (listing.country && listing.city) {
          const country = listing.country
          const city = listing.city
          
          if (!countriesMap[country]) {
            countriesMap[country] = new Set()
          }
          
          countriesMap[country].add(city)
        }
      })

      // Converter Sets para Arrays e ordenar
      const result = {}
      Object.keys(countriesMap).sort().forEach(country => {
        result[country] = Array.from(countriesMap[country]).sort()
      })

      return result
    },

    /**
     * Extrai neighbourhood groups únicos de uma cidade específica
     * @param {string} city - Nome da cidade
     * @returns {Array} Array de neighbourhood groups únicos ordenados
     */
    neighbourhoodGroupsByCity: (state) => (city) => {
      if (!city || state.listings.length === 0) return []
      
      const cityListings = state.listings.filter(l => l.city === city)
      const groups = new Set()
      
      cityListings.forEach(listing => {
        if (listing.neighbourhood_group) {
          groups.add(listing.neighbourhood_group)
        }
      })
      
      return Array.from(groups).sort()
    },

    /**
     * Calcula o índice do mês atual baseado na data mais recente em last_review
     * Encontra a data mais recente entre todos os listings e retorna o índice do mês (0-11)
     * @returns {number} Índice do mês atual (0 = Janeiro, 11 = Dezembro), ou valor de fallback se não houver dados válidos
     */
    currentMonthIndex: (state) => {
      if (state.listings.length === 0) return FALLBACK_VALUES.CURRENT_MONTH_INDEX
      
      // Encontrar todas as datas de last_review válidas
      const validDates = state.listings
        .filter(l => l.last_review && typeof l.last_review === 'string')
        .map(l => l.last_review)
      
      if (validDates.length === 0) return FALLBACK_VALUES.CURRENT_MONTH_INDEX
      
      // Encontrar a data mais recente
      const mostRecentDate = validDates.sort().reverse()[0]
      
      // Extrair o mês da data (formato: "YYYY-MM-DD")
      const dateParts = mostRecentDate.split('-')
      if (dateParts.length < 2) return FALLBACK_VALUES.CURRENT_MONTH_INDEX
      
      const month = parseInt(dateParts[1], 10)
      if (isNaN(month) || month < 1 || month > 12) return FALLBACK_VALUES.CURRENT_MONTH_INDEX
      
      // Retornar índice do mês (0-11)
      return month - 1
    }
  },

  actions: {
    /**
     * Carrega os listings da API
     * @async
     */
    async fetchListings() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('http://localhost:3000/listings')
        if (!response.ok) throw new Error('Falha ao carregar dados')
        this.listings = await response.json()
      } catch (err) {
        console.error(err)
        this.error = err.message || 'Erro ao carregar listings'
      } finally {
        this.loading = false
      }
    }
  }
})