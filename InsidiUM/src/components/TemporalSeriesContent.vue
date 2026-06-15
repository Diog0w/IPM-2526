<template>
  <main class="flex-1 p-6 flex gap-8 items-stretch">

    <section class="flex flex-col gap-6 w-[75%]">
      
      <TemporalFilters 
        :cities="cities"
        :periods="periods"
        :countries="countries"
        :metrics="metrics"
        v-model:city="selectedCity"
        v-model:period="selectedPeriod"
        v-model:country="selectedCountry"
        v-model:metric="selectedMetric"
      />

      <TemporalChart 
        :title="chartTitle"
        :data="computedStats"
        :labels="processedLabels"
      />

      <div class="flex gap-32 justify-center mt-4">
        <button 
          @click="exportCSV"
          class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg shadow-sm border border-gray-300 transition min-w-[200px]"
        >
          Export CSV
        </button>
        <button 
          @click="exportJSON"
          class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg shadow-sm border border-gray-300 transition min-w-[200px]"
        >
          Export JSON
        </button>
      </div>

    </section>

    <aside class="flex flex-col justify-center items-center gap-6 w-[25%]">
      
      <ActionsPanel 
        mainLabel="Main Dashboard"
        mainRoute="/dashboard"
        secondLabel="See in Map"
        secondRoute="/map"
        thirdLabel="Compare"
        thirdRoute="/compare"
      />

    </aside>

  </main>
</template>

<script>
import TemporalFilters from './TemporalFilters.vue'
import TemporalChart from './TemporalChart.vue'
import ActionsPanel from './ActionsPanel.vue'
import { useListingsStore } from '@/stores/listings'

export default {
  name: "TemporalSeriesContent",
  components: {
    TemporalFilters,
    TemporalChart,
    ActionsPanel 
  },
  setup() {
    const listingsStore = useListingsStore()
    return { listingsStore }
  },
  data() {
    return {
      // Estado dos filtros
      selectedCountry: "Portugal", // País padrão (valor de fallback consistente em todo o código)
      selectedCity: "All",
      selectedPeriod: "6 months",
      
      // Nova métrica
      selectedMetric: "Activity Volume",
      metrics: ["Activity Volume", "Price"],

      periods: ["3 months", "6 months", "9 months", "1 year"],
      allMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
     * Obtém as cidades disponíveis para o país selecionado
     * Inclui a opção "All" no início da lista para permitir visualização agregada
     * @returns {Array} Array de cidades do país com "All" como primeira opção
     */
    cities() {
      const cities = this.countries[this.selectedCountry] || []
      return ["All", ...cities]
    },

    /**
     * Gera o título do gráfico baseado na métrica selecionada
     * @returns {string} Título do gráfico ("Average Price (€)" ou "Activity Volume (Last Reviews)")
     */
    chartTitle() {
      return this.selectedMetric === 'Price' 
        ? 'Average Price (€)' 
        : 'Activity Volume (Last Reviews)'
    },

    /**
     * Calcula quantos meses devem ser exibidos baseado no período selecionado
     * @returns {number} Número de meses a exibir (3, 6, 9 ou 12)
     */
    monthsToShow() {
      if (this.selectedPeriod === "3 months") return 3
      if (this.selectedPeriod === "6 months") return 6
      if (this.selectedPeriod === "9 months") return 9
      return 12 
    },
    /**
     * Calcula os índices de início e fim para o slice dos dados mensais
     * Baseado no mês atual (calculado dinamicamente da data mais recente em last_review) e no número de meses a exibir
     * @returns {Object} Objeto com propriedades start e end para o slice
     */
    sliceIndices() {
      // Obter o índice do mês atual dinamicamente da store
      const currentMonthIndex = this.listingsStore.currentMonthIndex
      let start = currentMonthIndex - this.monthsToShow + 1
      if (start < 0) start = 0 
      const end = currentMonthIndex + 1 
      return { start, end }
    },

    /**
     * Gera os labels dos meses a serem exibidos no gráfico
     * Baseado no período selecionado e nos índices calculados
     * @returns {Array} Array com os nomes dos meses (ex: ['Jan', 'Feb', 'Mar'])
     */
    processedLabels() {
      const { start, end } = this.sliceIndices
      return this.allMonths.slice(start, end)
    },

    /**
     * Calcula os dados estatísticos mensais para o gráfico
     * Quando "All Cities" está selecionado, agrega dados de todas as cidades do país
     * Reutiliza métodos da Store (getPriceByMonth ou getActivityByMonth)
     * @returns {Array} Array com valores mensais filtrados pelo período selecionado
     */
    computedStats() {
      let fullStats = []
      
      // Passar country quando city = "All" para agregar dados de todas as cidades
      const country = this.selectedCity === "All" ? this.selectedCountry : null
      
      if (this.selectedMetric === 'Price') {
        fullStats = this.listingsStore.getPriceByMonth(this.selectedCity, country)
      } else {
        fullStats = this.listingsStore.getActivityByMonth(this.selectedCity, country)
      }
      
      const { start, end } = this.sliceIndices
      return fullStats.slice(start, end)
    },
    /**
     * Retorna o nome descritivo para a cidade selecionada
     * Quando "All" está selecionado, retorna "All [Country] Cities"
     * @returns {string} Nome descritivo da cidade ou país
     */
    displayCity() {
      if (this.selectedCity === "All") {
        return `All ${this.selectedCountry} Cities`
      }
      return this.selectedCity
    }
  },
  methods: {
    /**
     * Exporta os dados temporais para um ficheiro CSV
     * Inclui métrica selecionada, cidade (ou "All Cities") e valores mensais
     * Usa nomes descritivos quando "All Cities" está selecionado
     */
    exportCSV() {
      let csvContent = `Metric,${this.selectedMetric}\n`
      csvContent += `City,${this.displayCity}\n`
      csvContent += `Month,Value\n`

      this.processedLabels.forEach((label, index) => {
        const val = this.computedStats[index]
        csvContent += `${label},${val}\n`
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      // Usar nome descritivo no nome do ficheiro 
      const fileName = this.displayCity.replace(/\s+/g, '_')
      link.setAttribute("href", url)
      link.setAttribute("download", `temporal_${fileName}_${this.selectedMetric}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    /**
     * Exporta os dados temporais para um ficheiro JSON
     * Inclui metadados (métrica, cidade, país, período) e dados mensais
     * Usa nomes descritivos quando "All Cities" está selecionado
     */
    exportJSON() {
      const exportData = {
        meta: {
          city: this.selectedCity,
          city_display: this.displayCity,
          country: this.selectedCountry,
          metric: this.selectedMetric,
          period: this.selectedPeriod,
          generated_at: new Date().toISOString()
        },
        data: this.processedLabels.map((label, index) => ({
          month: label,
          value: this.computedStats[index]
        }))
      }

      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      // Usar nome descritivo no nome do ficheiro 
      const fileName = this.displayCity.replace(/\s+/g, '_')
      link.setAttribute("href", url)
      link.setAttribute("download", `temporal_${fileName}_${this.selectedMetric}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  },
  /**
   * Lifecycle hook executado quando o componente é montado
   * Carrega os dados dos listings e valida os filtros selecionados
   */
  mounted() {
    this.listingsStore.fetchListings().then(() => {
      // Garantir que o país e cidade selecionados existem nos dados carregados
      this.$nextTick(() => {
        const availableCountries = Object.keys(this.countries)
        if (availableCountries.length > 0 && !availableCountries.includes(this.selectedCountry)) {
          this.selectedCountry = availableCountries[0]
        }
        // Se a cidade selecionada não for "All" e não existir, definir para "All"
        if (this.selectedCity !== "All") {
          const cities = this.cities
          if (cities.length > 0 && !cities.includes(this.selectedCity)) {
            this.selectedCity = "All"
          }
        }
      })
    })
  },
  watch: {
    /**
     * Watcher para quando o país selecionado muda
     * Atualiza a cidade para "All" para mostrar dados agregados de todas as cidades do país
     * @param {string} newVal - Novo país selecionado
     */
    selectedCountry(newVal) {
      // Quando o país muda, definir cidade para "All"
      this.selectedCity = "All"
    }
  }
}
</script>