<template>
  <main class="flex-1 p-6 flex gap-8 items-stretch">

    <section class="flex flex-col gap-6 w-[75%]">
      
      <CompareFilters 
        :countries="countries"
        :periods="periods"
        :metrics="metrics"
        v-model:country1="selectedCountry1"
        v-model:city1="selectedCity1"
        v-model:country2="selectedCountry2"
        v-model:city2="selectedCity2"
        v-model:period="selectedPeriod"
        v-model:metric="selectedMetric"
      />

      <CompareChart 
        :title="chartTitle"
        :city1="displayCity1" 
        :city2="displayCity2"
        :stats1="computedStats1"
        :stats2="computedStats2"
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
        thirdLabel="Temporal Series"
        thirdRoute="/temporal"
      />
    </aside>

  </main>
</template>

<script>
import CompareFilters from './CompareFilters.vue'
import CompareChart from './CompareChart.vue'
import ActionsPanel from './ActionsPanel.vue'
import { useListingsStore } from '@/stores/listings'

export default {
  name: "CompareContent",
  components: {
    CompareFilters,
    CompareChart,
    ActionsPanel
  },
  setup() {
    const listingsStore = useListingsStore()
    return { listingsStore }
  },
  data() {
    return {
      selectedCountry1: "Portugal", // País padrão (valor de fallback consistente em todo o código)
      selectedCity1: "All",
      selectedCountry2: "Spain", // Segundo país padrão para comparação
      selectedCity2: "All",
      selectedPeriod: "6 months",
      
      // Novo Estado para a Métrica
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
    // Título do Gráfico baseado na métrica
    chartTitle() {
      return this.selectedMetric === 'Price' 
        ? 'Average Price (€)' 
        : 'Activity Volume (Last Reviews)'
    },

    // 1. Lógica do Período
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

    // 2. Dados Processados (Usados no Gráfico e Exportação)
    processedLabels() {
      const { start, end } = this.sliceIndices
      return this.allMonths.slice(start, end)
    },
    
    /**
     * Calcula os dados estatísticos mensais para a primeira cidade/comparação
     * Quando "All Cities" está selecionado, agrega dados de todas as cidades do país
     * @returns {Array} Array com valores mensais filtrados pelo período selecionado
     */
    computedStats1() {
      let fullStats = []
      // Passar country quando city = "All" para agregar dados de todas as cidades
      const country1 = this.selectedCity1 === "All" ? this.selectedCountry1 : null
      if (this.selectedMetric === 'Price') {
        fullStats = this.listingsStore.getPriceByMonth(this.selectedCity1, country1)
      } else {
        fullStats = this.listingsStore.getActivityByMonth(this.selectedCity1, country1)
      }
      
      const { start, end } = this.sliceIndices
      return fullStats.slice(start, end)
    },
    /**
     * Calcula os dados estatísticos mensais para a segunda cidade/comparação
     * Quando "All Cities" está selecionado, agrega dados de todas as cidades do país
     * @returns {Array} Array com valores mensais filtrados pelo período selecionado
     */
    computedStats2() {
      let fullStats = []
      // Passar country quando city = "All" para agregar dados de todas as cidades
      const country2 = this.selectedCity2 === "All" ? this.selectedCountry2 : null
      if (this.selectedMetric === 'Price') {
        fullStats = this.listingsStore.getPriceByMonth(this.selectedCity2, country2)
      } else {
        fullStats = this.listingsStore.getActivityByMonth(this.selectedCity2, country2)
      }

      const { start, end } = this.sliceIndices
      return fullStats.slice(start, end)
    },
    /**
     * Retorna o nome descritivo para a primeira cidade/comparação
     * Quando "All" está selecionado, retorna "All [Country] Cities" ou apenas o país
     * @returns {string} Nome descritivo da cidade ou país
     */
    displayCity1() {
      if (this.selectedCity1 === "All") {
        return `All ${this.selectedCountry1} Cities`
      }
      return this.selectedCity1
    },
    /**
     * Retorna o nome descritivo para a segunda cidade/comparação
     * Quando "All" está selecionado, retorna "All [Country] Cities" ou apenas o país
     * @returns {string} Nome descritivo da cidade ou país
     */
    displayCity2() {
      if (this.selectedCity2 === "All") {
        return `All ${this.selectedCountry2} Cities`
      }
      return this.selectedCity2
    }
  },
  methods: {
    /**
     * Exporta os dados de comparação para um ficheiro CSV
     * Inclui métrica selecionada e valores mensais de ambas as cidades/comparações
     * Usa nomes descritivos quando "All Cities" está selecionado
     */
    exportCSV() {
      // 1. Cabeçalho do CSV
      let csvContent = `Metric,${this.selectedMetric}\n`
      csvContent += `Month,${this.displayCity1},${this.displayCity2}\n`

      // 2. Linhas de dados
      this.processedLabels.forEach((label, index) => {
        const val1 = this.computedStats1[index]
        const val2 = this.computedStats2[index]
        csvContent += `${label},${val1},${val2}\n`
      })

      // 3. Criar Blob e Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      // Usar nomes descritivos no nome do ficheiro 
      const fileName1 = this.displayCity1.replace(/\s+/g, '_')
      const fileName2 = this.displayCity2.replace(/\s+/g, '_')
      link.setAttribute("href", url)
      link.setAttribute("download", `comparison_${fileName1}_vs_${fileName2}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    /**
     * Exporta os dados de comparação para um ficheiro JSON
     * Inclui metadados completos (métrica, cidades, países, período) e dados mensais
     * Usa nomes descritivos quando "All Cities" está selecionado
     */
    exportJSON() {
      // 1. Estruturar os dados
      const exportData = {
        comparison: {
          metric: this.selectedMetric,
          city1: this.selectedCity1,
          city1_display: this.displayCity1,
          city2: this.selectedCity2,
          city2_display: this.displayCity2,
          country1: this.selectedCountry1,
          country2: this.selectedCountry2,
          period: this.selectedPeriod,
          generated_at: new Date().toISOString()
        },
        data: this.processedLabels.map((label, index) => ({
          month: label,
          [this.displayCity1]: this.computedStats1[index],
          [this.displayCity2]: this.computedStats2[index]
        }))
      }

      // 2. Converter para String e Download
      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      // Usar nomes descritivos no nome do ficheiro 
      const fileName1 = this.displayCity1.replace(/\s+/g, '_')
      const fileName2 = this.displayCity2.replace(/\s+/g, '_')
      link.setAttribute("href", url)
      link.setAttribute("download", `comparison_${fileName1}_vs_${fileName2}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  },
  /**
   * Lifecycle hook executado quando o componente é montado
   * Carrega os dados dos listings da API
   */
  mounted() {
    this.listingsStore.fetchListings()
  }
}
</script>