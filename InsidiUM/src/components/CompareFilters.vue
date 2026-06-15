<template>
  <div class="flex flex-wrap gap-4">
    
    <div class="relative">
      <label for="compare-filter-country1" class="sr-only">Select Country 1</label>
      <select 
        id="compare-filter-country1"
        name="compare-filter-country1"
        :value="country1" 
        @change="onCountry1Change"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[150px]"
      >
        <option disabled value="">Select Country 1</option>
        <option v-for="c in Object.keys(countries)" :key="c" :value="c">
          Country: {{ c }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="compare-filter-city1" class="sr-only">Select City 1</label>
      <select 
        id="compare-filter-city1"
        name="compare-filter-city1"
        :value="city1" 
        @change="$emit('update:city1', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[150px]"
      >
        <option disabled value="">Select City 1</option>
        <option v-for="c in getCities(country1)" :key="c" :value="c">
          {{ c === 'All' ? 'All Cities' : `City: ${c}` }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="compare-filter-country2" class="sr-only">Select Country 2</label>
      <select 
        id="compare-filter-country2"
        name="compare-filter-country2"
        :value="country2" 
        @change="onCountry2Change"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[150px]"
      >
        <option disabled value="">Select Country 2</option>
        <option v-for="c in Object.keys(countries)" :key="c" :value="c">
          Country: {{ c }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="compare-filter-city2" class="sr-only">Select City 2</label>
      <select 
        id="compare-filter-city2"
        name="compare-filter-city2"
        :value="city2" 
        @change="$emit('update:city2', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[150px]"
      >
        <option disabled value="">Select City 2</option>
        <option v-for="c in getCities(country2)" :key="c" :value="c">
          {{ c === 'All' ? 'All Cities' : `City: ${c}` }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative ml-auto">
      <label for="compare-filter-metric" class="sr-only">Select Metric</label>
      <select 
        id="compare-filter-metric"
        name="compare-filter-metric"
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
      <label for="compare-filter-period" class="sr-only">Select Period</label>
      <select 
        id="compare-filter-period"
        name="compare-filter-period"
        :value="period" 
        @change="$emit('update:period', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
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
export default {
  name: "CompareFilters",
  props: {
    countries: { 
      type: Object, 
      required: true 
    },
    periods: {
      type: Array,
      required: true
    },
    metrics: {
      type: Array,
      required: true
    },
    country1: {
      type: String,
      default: ''
    },
    city1: {
      type: String,
      default: 'ALL'
    },
    country2: {
      type: String,
      default: ''
    },
    city2: {
      type: String,
      default: 'ALL'
    },
    period: {
      type: String,
      default: ''
    },
    metric: {
      type: String,
      default: ''
    }
  },
  methods: {
    /**
     * Helper para obter as cidades disponíveis de um país
     * Inclui a opção "All" no início para permitir visualização agregada
     * @param {string} countryName - Nome do país
     * @returns {Array} Array de cidades com "All" como primeira opção
     */
    getCities(countryName) {
      const cities = this.countries[countryName] || [];
      return ["All", ...cities];
    },
    /**
     * Manipula a mudança do primeiro país no filtro
     * Emite eventos para atualizar país e resetar cidade para "All"
     * @param {Event} event - Evento de mudança do select
     */
    onCountry1Change(event) {
      const newCountry = event.target.value;
      this.$emit('update:country1', newCountry);
      // Quando o país muda, resetar cidade para "All" para mostrar dados agregados
      this.$emit('update:city1', 'All');
    },
    /**
     * Manipula a mudança do segundo país no filtro
     * Emite eventos para atualizar país e resetar cidade para "All"
     * @param {Event} event - Evento de mudança do select
     */
    onCountry2Change(event) {
      const newCountry = event.target.value;
      this.$emit('update:country2', newCountry);
      // Quando o país muda, resetar cidade para "All" para mostrar dados agregados
      this.$emit('update:city2', 'All');
    }
  }
};
</script>