<template>
  <div class="flex gap-4">
    <div class="relative">
      <label for="dashboard-filter-country" class="sr-only">Select Country</label>
      <select 
        id="dashboard-filter-country"
        :value="country" 
        @change="onCountryChange"
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
      <label for="dashboard-filter-city" class="sr-only">Select City</label>
      <select 
        id="dashboard-filter-city"
        :value="city" 
        @change="$emit('update:city', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
      >
        <option disabled value="">Select City</option>
        <option v-for="c in filteredCities" :key="c" :value="c">
          {{ c === 'All' ? 'All Cities' : `City: ${c}` }}
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
 * Componente de filtros para o Dashboard
 * Permite selecionar país e cidade para filtrar os dados exibidos
 * Quando "All Cities" está selecionado, agrega dados de todas as cidades do país
 */
export default {
  name: "FiltersSection",
  props: {
    // Objeto com países como chaves e arrays de cidades como valores
    countries: { 
      type: Object, 
      required: true 
    },
    // País selecionado no filtro
    country: { 
      type: String, 
      default: '' 
    },
    // Cidade selecionada no filtro ("All" para todas as cidades do país)
    city: { 
      type: String, 
      default: 'ALL' 
    }
  },
  computed: {
    /**
     * Gera lista de cidades disponíveis para o país selecionado
     * Inclui a opção "All" no início para permitir visualização agregada
     * @returns {Array} Array de cidades com "All" como primeira opção
     */
    filteredCities() {
      const cities = this.countries[this.country] || [];
      return ["All", ...cities];
    }
  },
  methods: {
    /**
     * Manipula a mudança de país no filtro
     * Emite eventos para atualizar país e resetar cidade para "All"
     * @param {Event} event - Evento de mudança do select
     */
    onCountryChange(event) {
      const newCountry = event.target.value;
      this.$emit('update:country', newCountry);
      // Quando o país muda, definir cidade para "All" para mostrar dados agregados
      this.$emit('update:city', 'All');
    }
  }
};
</script>