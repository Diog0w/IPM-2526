<template>
  <main class="flex-1 p-8 flex gap-8 justify-center items-start h-full">

    <div class="flex flex-col gap-6 w-[60%] h-full justify-between">
      
      <div class="flex flex-col gap-6">
        <FiltersSection 
          :countries="countries"
          v-model:country="selectedCountry"
          v-model:city="selectedCity"
        />

        <div v-if="listingsStore.loading" class="flex justify-center py-10">
          <span class="text-blue-600 font-semibold animate-pulse">Loading data...</span>
        </div>

        <div v-else-if="listingsStore.error" class="text-center py-10 text-red-600 bg-red-50 rounded-xl border border-red-300">
          <p class="font-semibold">Error loading data</p>
          <p class="text-sm mt-2">{{ listingsStore.error }}</p>
        </div>
        <StatsCards v-else :cards="computedCards" />
      </div>

      <ActionsPanel />
    </div>

    <div class="flex flex-col w-[40%] h-full">
      
      <div v-if="listingsStore.loading" class="bg-white rounded-xl shadow-sm border border-gray-300 w-full h-full flex items-center justify-center">
        <span class="text-gray-500 animate-pulse">Loading anomalies...</span>
      </div>

      <div v-else-if="listingsStore.error" class="bg-white rounded-xl shadow-sm border border-red-300 w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600 p-6 text-center">
        <p class="font-semibold">Error loading anomalies</p>
        <p class="text-sm mt-2 opacity-75">{{ listingsStore.error }}</p>
      </div>

      <AnomaliesTable v-else :anomalies="computedAnomalies" />
      
    </div>

  </main>
</template>

<script>
/**
 * Componente principal do Dashboard
 * Exibe estatísticas, filtros e anomalias dos listings
 */
// Importar Subcomponentes
import FiltersSection from './FiltersSection.vue'
import StatsCards from './StatsCards.vue'
import ActionsPanel from './ActionsPanel.vue'
import AnomaliesTable from './AnomaliesTable.vue'

// Importar a Store
import { useListingsStore } from '@/stores/listings'
import { useUserStore } from '@/stores/user' // Importar User Store

export default {
  name: 'DashboardContent',
  components: {
    FiltersSection,
    StatsCards,
    ActionsPanel,
    AnomaliesTable
  },
  /**
   * Inicializa a store de listings e disponibiliza no componente
   * @returns {Object} Objeto com listingsStore
   */
  // Inicializar a Store
  setup() {
    const listingsStore = useListingsStore()
    const userStore = useUserStore() // Inicializar User Store
    return { listingsStore, userStore }
  },
  /**
   * Inicializa os dados reativos do componente
   * @returns {Object} Objeto com país e cidade selecionados e lista de países
   */
  data() {
    return {
      selectedCountry: 'Portugal', // País padrão (valor de fallback consistente em todo o código)
      selectedCity: 'All', // Inicializar com "All" para mostrar dados de todas as cidades do país
    }
  },
  computed: {
    /**
     * Obtém países e cidades extraídos dos listings
     * @returns {Object} Objeto com países como chaves e arrays de cidades como valores
     */
    countries() {
      return this.listingsStore.countriesAndCities || {}
    },
    /**
     * Verifica se há dados disponíveis para exibição
     * Quando "All Cities" está selecionado, agrega dados de todas as cidades do país
     * @returns {boolean} true se há dados disponíveis, false caso contrário
     */
    hasDataAvailable() {
      // Forçar reatividade dependendo explicitamente dos valores necessários
      const loading = this.listingsStore.loading
      const listings = this.listingsStore.listings
      const city = this.selectedCity
      const country = this.selectedCountry
      
      // Se ainda está carregando, não há dados disponíveis ainda
      if (loading) {
        return false
      }
      // Se não há listings carregados, não há dados disponíveis
      if (!listings || listings.length === 0) {
        return false
      }
      // Se "All" está selecionado, garantir que há um país selecionado
      if (city === "All") {
        if (!country) {
          return false
        }
        // Agregar dados de todas as cidades do país selecionado
        const total = this.listingsStore.totalListings("All", country)
        return total > 0
      }
      // Para cidade específica, verificar se há dados para essa cidade
      const total = this.listingsStore.totalListings(city, null)
      return total > 0
    },
    /**
     * Gera os cartões de estatísticas dinamicamente com base na cidade selecionada
     * Quando "All Cities" está selecionado, agrega dados de todas as cidades do país
     * @returns {Array} Array de objetos com label e value para cada cartão de estatística
     */
    computedCards() {
      // Buscar valores à store (passar country quando city = "All")
      const total = this.listingsStore.totalListings(this.selectedCity, this.selectedCity === "All" ? this.selectedCountry : null)
      const avgPrice = this.listingsStore.averagePrice(this.selectedCity, this.selectedCity === "All" ? this.selectedCountry : null)
      const activePct = this.listingsStore.activeListingsPercentage(this.selectedCity, this.selectedCity === "All" ? this.selectedCountry : null)
      const avgHost = this.listingsStore.avgListingsPerHost(this.selectedCity, this.selectedCity === "All" ? this.selectedCountry : null)
      
      const hasData = total > 0
      
      return [
        { 
          label: 'Total listings', 
          value: hasData ? total.toLocaleString() : '0' 
        },
        { 
          label: 'Listings w/ Reviews', // Substituiu "Average Occupancy"
          value: hasData ? activePct + '%' : '0%' 
        },
        { 
          label: 'Average Price/night', 
          value: avgPrice + '€' 
        },
        { 
          label: 'Avg. Listings/Host', // Substituiu "Average nights booked"
          value: hasData ? avgHost : '0' 
        },
      ]
    },

    /**
     * Gera a lista de anomalias dinamicamente com base na cidade selecionada
     * Quando "All Cities" está selecionado, agrega anomalias de todas as cidades do país
     * @returns {Array} Array de objetos com name e value para cada tipo de anomalia
     */
    computedAnomalies() {
      // Força a reatividade garantindo que o computed seja recalculado quando a cidade ou os listings mudarem
      const city = this.selectedCity
      const listings = this.listingsStore.listings
      
      // Se não há dados ainda, retornar array vazio
      if (!listings || listings.length === 0) {
        return []
      }
      
      // Se cidade não está definida, retornar array vazio
      if (!city) {
        return []
      }
      
      // Se "All" está selecionado, garantir que há um país selecionado
      if (city === "All" && !this.selectedCountry) {
        return []
      }
      
      // Verificar se a cidade existe nos listings (ou se é "All")
      if (city !== "All") {
        const cityExists = listings.some(l => l && l.city === city)
        if (!cityExists) {
          return []
        }
      }
      
      const anomalies = this.listingsStore.getAnomalies(city, city === "All" ? this.selectedCountry : null)
      
      // Garantir que devolvemos sempre um array
      return Array.isArray(anomalies) ? anomalies : []
    }
  },
  watch: {
    /**
     * Watcher para quando os países disponíveis mudam (após carregar dados)
     * Garante que o país e cidade selecionados existem nos dados carregados
     * Se não existirem, define valores padrão válidos
     */
    countries: {
      handler(newCountries) {
        if (Object.keys(newCountries).length > 0) {
          // Se o país selecionado não existe, usar o primeiro disponível
          if (!newCountries[this.selectedCountry]) {
            const firstCountry = Object.keys(newCountries)[0]
            if (firstCountry) {
              this.selectedCountry = firstCountry
            }
          }
          // Quando os países mudarem, definir cidade para "All" se não existir
          if (this.selectedCity !== "All") {
            const cities = newCountries[this.selectedCountry] || []
            if (cities.length > 0 && !cities.includes(this.selectedCity)) {
              this.selectedCity = "All"
            }
          }
        }
      },
      immediate: true,
      deep: true
    },
    /**
     * Watcher para quando o país selecionado muda
     * Atualiza a cidade para "All" para mostrar dados agregados de todas as cidades do país
     * @param {string} newCountry - Novo país selecionado
     */
    selectedCountry(newCountry) {
      this.selectedCity = "All"
    },
    /**
     * Watcher para quando os listings são carregados ou atualizados
     * Garante que o país e cidade selecionados são válidos após o carregamento dos dados
     * Se "All" está selecionado, garante que há um país selecionado
     * @param {Array} newListings - Novos listings carregados
     */
    'listingsStore.listings': {
      handler(newListings) {
        if (newListings && newListings.length > 0) {
          this.$nextTick(() => {
            // Garantir que o país está definido quando os dados são carregados
            if (!this.selectedCountry && Object.keys(this.countries).length > 0) {
              this.selectedCountry = Object.keys(this.countries)[0]
            }
            // Se "All" está selecionado, garantir que há um país selecionado
            if (this.selectedCity === "All" && !this.selectedCountry) {
              if (Object.keys(this.countries).length > 0) {
                this.selectedCountry = Object.keys(this.countries)[0]
              }
            }
            // Se cidade específica está selecionada, verificar se existe
            if (this.selectedCity !== "All") {
              const cities = this.countries[this.selectedCountry] || []
              if (cities.length > 0 && !cities.includes(this.selectedCity)) {
                this.selectedCity = "All"
              }
            }
          })
        }
      },
      immediate: true,
      deep: true
    }
  },
  /**
   * Lifecycle hook executado quando o componente é montado
   * Carrega os dados dos listings da API se ainda não estiverem carregados
   */
  mounted() {
    // Sempre garantir que os dados estão carregados
    if (this.listingsStore.listings.length === 0) {
      this.listingsStore.fetchListings()
    }
  }
}
</script>