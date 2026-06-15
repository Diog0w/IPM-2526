<template>
  <div class="flex flex-wrap gap-4">
    
    <div class="relative">
      <label for="temporal-filter-country" class="sr-only">Select Country</label>
      <select 
        id="temporal-filter-country"
        :value="country" 
        @change="$emit('update:country', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
      >
        <option disabled value="">Select Country</option>
        <option v-for="c in Object.keys(countries)" :key="c" :value="c">
          Country: {{ c }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="temporal-filter-city" class="sr-only">Select City</label>
      <select 
        id="temporal-filter-city"
        :value="city" 
        @change="$emit('update:city', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
      >
        <option disabled value="">Select City</option>
        <option v-for="c in cities" :key="c" :value="c">
          {{ c === 'All' ? 'All Cities' : `City: ${c}` }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative ml-auto">
      <label for="temporal-filter-metric" class="sr-only">Select Metric</label>
      <select 
        id="temporal-filter-metric"
        :value="metric" 
        @change="$emit('update:metric', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
      >
        <option disabled value="">Metric</option>
        <option v-for="m in metrics" :key="m" :value="m">
          Metric: {{ m }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="temporal-filter-period" class="sr-only">Select Period</label>
      <select 
        id="temporal-filter-period"
        :value="period" 
        @change="$emit('update:period', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[180px]"
      >
        <option disabled value="">Select Period</option>
        <option v-for="per in periods" :key="per" :value="per">
          Period: {{ per }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

  </div>
</template>

<script>
/**
 * Componente de filtros para a visualização de séries temporais
 * Permite selecionar país, cidade, métrica (Preço ou Volume de Atividade) e período temporal
 * Utilizado na view de séries temporais para configurar o gráfico
 */
export default {
  name: "TemporalFilters",
  props: {
    // Array de cidades disponíveis para o país selecionado
    cities: {
      type: Array,
      required: true
    },
    // Array de períodos disponíveis (ex: ["3 months", "6 months", "9 months", "1 year"])
    periods: {
      type: Array,
      required: true
    },
    // Objeto com países como chaves e arrays de cidades como valores
    countries: {
      type: Object,
      required: true
    },
    // Array de métricas disponíveis (ex: ["Activity Volume", "Price"])
    metrics: {
      type: Array,
      required: true
    },
    // Cidade selecionada no filtro ("All" para todas as cidades do país)
    city: {
      type: String,
      default: 'All'
    },
    // Período temporal selecionado (ex: "6 months")
    period: {
      type: String,
      default: '6 months'
    },
    // País selecionado no filtro
    country: {
      type: String,
      default: ''
    },
    // Métrica selecionada (ex: "Activity Volume" ou "Price")
    metric: {
      type: String,
      default: ''
    }    
  }
};
</script>