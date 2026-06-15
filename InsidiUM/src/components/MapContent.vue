<template>
  <main class="flex-1 p-6 flex gap-8 items-stretch">
    
    <section class="flex flex-col gap-6 w-[75%]">
      
      <MapFilters 
        :countries="countries"
        :cities="availableCities"
        :neighbourhoodGroups="availableNeighbourhoodGroups"
        :maxPrice="maxPrice"
        v-model:country="selectedCountry"
        v-model:city="selectedCity"
        v-model:neighbourhood="selectedNeighbourhood"
        v-model:occupation="occupation"
        v-model:price="price"
      />

      <MapDisplay 
        :listings="filteredListings"
        :city="selectedCity"
        :country="selectedCountry"
        :neighbourhood="selectedNeighbourhood"
        :totalListings="totalFilteredListings"
        :anomalies="filteredAnomalies"
        :loading="listingsStore.loading"
      />

    </section>

    <aside class="flex flex-col justify-center items-center gap-6 w-[25%]">
      
      <ActionsPanel 
        mainLabel="Main Dashboard"
        mainRoute="/dashboard"
      />

    </aside>

  </main>
</template>

<script>
import MapFilters from './MapFilters.vue'
import MapDisplay from './MapDisplay.vue'
import ActionsPanel from './ActionsPanel.vue'
import { useListingsStore } from '@/stores/listings'

/**
 * Componente principal de visualização de mapas
 * Gerencia filtros e exibe mapa interativo com listings e anomalias
 */
export default {
  name: "MapContent",
  components: {
    MapFilters,
    MapDisplay,
    ActionsPanel
  },
  setup() {
    const listingsStore = useListingsStore()
    return { listingsStore }
  },
  data() {
    return {
      selectedCountry: "Portugal", // País selecionado no filtro
      selectedCity: "All", // "All" = todas as cidades do país
      selectedNeighbourhood: "All", // "All" = todos os bairros da cidade
      occupation: 0, // 0 = todos, > 0 = apenas ativos (com last_review)
      price: 0 // 0 = apenas sem preço, > 0 = preço máximo permitido
    }
  },
  computed: {
    countries() {
      return this.listingsStore.countriesAndCities || {}
    },
    maxPrice() {
      return this.listingsStore.maxPrice || 100
    },
    availableCities() {
      const cities = this.countries[this.selectedCountry] || []
      return ["All", ...cities]
    },
    availableNeighbourhoodGroups() {
      if (this.selectedCity === "All") return []
      const groups = this.listingsStore.neighbourhoodGroupsByCity(this.selectedCity) || []
      return ["All", ...groups]
    },
    /**
     * Filtra listings baseado em todos os filtros selecionados
     * Aplica filtros em cascata: país → cidade → bairro → preço → atividade
     */
    filteredListings() {
      // Filtro 1: País e Cidade
      let filtered = this.selectedCity === "All"
        ? this.listingsStore.listings.filter(l => l.country === this.selectedCountry)
        : this.listingsStore.listingsByCity(this.selectedCity, null)
      
      // Filtro 2: Bairro (só se cidade não for "All")
      if (this.selectedCity !== "All" && this.selectedNeighbourhood !== "All") {
        filtered = filtered.filter(l => l.neighbourhood_group === this.selectedNeighbourhood)
      }

      // Filtro 3: Preço
      // price = 0: mostrar apenas listings sem preço
      // price > 0: mostrar listings com preço <= price OU sem preço
      if (this.price === 0) {
        filtered = filtered.filter(l => l.price === null || l.price === undefined)
      } else if (this.price > 0) {
        filtered = filtered.filter(l => {
          const listingPrice = typeof l.price === 'number' ? l.price : null
          return listingPrice === null || listingPrice <= this.price
        })
      }

      // Filtro 4: Atividade (Active only)
      // occupation > 0: mostrar apenas listings ativos (com last_review válido)
      if (this.occupation > 0) {
        filtered = filtered.filter(l => {
          const review = l.last_review
          return review !== null && review !== undefined && review !== '' && String(review).trim() !== ''
        })
      }

      return filtered
    },
    totalFilteredListings() {
      return this.filteredListings.length
    },
    /**
     * Calcula anomalias nos listings filtrados
     * Threshold dinâmico para "High Price" usando percentil 90 dos preços válidos
     * Retorna apenas anomalias com valor > 0
     */
    filteredAnomalies() {
      const filtered = this.filteredListings
      if (filtered.length === 0) return []

      // Calcular threshold dinâmico: percentil 90 dos preços válidos
      const validPrices = filtered
        .filter(l => typeof l.price === 'number' && l.price !== null && l.price > 0)
        .map(l => l.price)
        .sort((a, b) => a - b)
      
      let highPriceThreshold = 100 // Valor padrão se não houver preços válidos
      if (validPrices.length > 0) {
        // Percentil 90: índice = ceil(length * 0.9) - 1
        const index = Math.ceil(validPrices.length * 0.9) - 1
        highPriceThreshold = validPrices[Math.max(0, Math.min(index, validPrices.length - 1))]
        highPriceThreshold = Math.ceil(highPriceThreshold / 10) * 10 // Arredondar para múltiplo de 10
      }

      // Contar cada tipo de anomalia
      const missingPrice = filtered.filter(l => l.price === null || l.price === undefined).length
      const highPrice = filtered.filter(l => typeof l.price === 'number' && l.price > highPriceThreshold).length
      const licenseIssues = filtered.filter(l => !l.license || l.license === 'Exempt' || l.license === 'null').length
      const noReviews = filtered.filter(l => !l.last_review).length

      return [
        { name: 'Missing Price', value: missingPrice, color: 'red' },
        { name: `Price > ${highPriceThreshold}€`, value: highPrice, color: 'orange' },
        { name: 'License Issues', value: licenseIssues, color: 'yellow' },
        { name: 'No Reviews', value: noReviews, color: 'gray' },
      ].filter(a => a.value > 0) // Retornar apenas anomalias com ocorrências
    }
  },
  watch: {
    /**
     * Watcher para quando o país selecionado muda
     * Reseta cidade e bairro para "All" para mostrar dados agregados
     * @param {string} newCountry - Novo país selecionado
     */
    selectedCountry() {
      this.selectedCity = "All"
      this.selectedNeighbourhood = "All"
    },
    /**
     * Watcher para quando a cidade selecionada muda
     * Reseta bairro para "All" para mostrar todos os bairros da cidade
     * @param {string} newCity - Nova cidade selecionada
     */
    selectedCity() {
      this.selectedNeighbourhood = "All"
    },
    /**
     * Watcher para quando o preço máximo disponível muda (após carregar dados)
     * Inicializa o filtro de preço com o valor máximo se ainda não estiver definido
     * @param {number} newMax - Novo preço máximo disponível
     */
    maxPrice(newMax) {
      if (newMax > 0 && this.price === 0) {
        this.price = newMax
      }
    }
  },
  /**
   * Lifecycle hook executado quando o componente é montado
   * Carrega dados dos listings se necessário e inicializa filtros com valores válidos
   */
  mounted() {
    // Inicializar filtros: validar seleções e definir preço máximo
    const initFilters = () => {
      this.price = this.maxPrice
      
      // Validar país selecionado
      const availableCountries = Object.keys(this.countries)
      if (availableCountries.length > 0 && !availableCountries.includes(this.selectedCountry)) {
        this.selectedCountry = availableCountries[0]
      }
      
      // Validar cidade selecionada
      const cities = this.availableCities
      if (cities.length > 0 && !cities.includes(this.selectedCity)) {
        this.selectedCity = cities.includes("All") ? "All" : cities[0]
      }
    }

    // Carregar dados se necessário, depois inicializar filtros
    if (this.listingsStore.listings.length === 0) {
      this.listingsStore.fetchListings().then(() => {
        this.$nextTick(initFilters)
      })
    } else {
      initFilters()
    }
  }
}
</script>