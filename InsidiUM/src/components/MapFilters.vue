<template>
  <div class="flex flex-wrap items-center gap-3">
    
    <div class="relative">
      <label for="map-filter-country" class="sr-only">Select Country</label>
      <select 
        id="map-filter-country"
        :value="country" 
        @change="$emit('update:country', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
      >
        <option disabled value="">Select Country</option>
        <option v-for="c in Object.keys(countries)" :key="c" :value="c">
          {{ c }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="map-filter-city" class="sr-only">Select City</label>
      <select 
        id="map-filter-city"
        :value="city" 
        @change="$emit('update:city', $event.target.value)"
        class="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm cursor-pointer min-w-[160px]"
      >
        <option disabled value="">Select City</option>
        <option v-for="c in cities" :key="c" :value="c">
          {{ c === 'All' ? 'All Cities' : c }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="relative">
      <label for="map-filter-neighbourhood" class="sr-only">Select Area</label>
      <select 
        id="map-filter-neighbourhood"
        :value="neighbourhood" 
        @change="$emit('update:neighbourhood', $event.target.value)"
        :disabled="city === 'All'"
        :class="[
          'appearance-none border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm min-w-[200px]',
          city === 'All' ? 'cursor-not-allowed opacity-50 bg-gray-100' : 'cursor-pointer'
        ]"
      >
        <option disabled value="">{{ city === 'All' ? 'Select a city first' : 'Select Area' }}</option>
        <option v-for="ng in neighbourhoodGroups" :key="ng" :value="ng">
          {{ ng === 'All' ? 'All Areas' : ng }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>

    <div class="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white h-[42px] shadow-sm">
      <label for="map-filter-active-only" class="text-gray-700 font-medium mr-3 cursor-pointer">Active only:</label>
      <button
        id="map-filter-active-only"
        type="button"
        role="switch"
        :aria-checked="occupation > 0"
        aria-label="Toggle active only filter"
        @click="$emit('update:occupation', occupation === 0 ? 100 : 0)"
        :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          occupation > 0 ? 'bg-blue-600' : 'bg-gray-300'
        ]"
      >
        <span
          :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            occupation > 0 ? 'translate-x-6' : 'translate-x-1'
          ]"
        ></span>
      </button>
      <span class="ml-3 font-medium text-gray-700">
        {{ occupation > 0 ? 'On' : 'Off' }}
      </span>
    </div>

    <div class="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white h-[42px] shadow-sm">
      <label for="map-filter-max-price" class="text-gray-700 font-medium mr-2">Max Price:</label>
      <input 
        id="map-filter-max-price"
        type="range" 
        min="0" 
        :max="maxPrice" 
        step="5" 
        :value="price"
        @input="$emit('update:price', +$event.target.value)"
        class="h-1 w-24 cursor-pointer accent-blue-600" 
      />
      <span class="ml-2 font-medium text-gray-700 w-16 text-right">
        {{ price === 0 ? 'No price' : `€${price}` }}
      </span>
    </div>

  </div>
</template>

<script>
/**
 * Componente de filtros para a visualização de mapas
 * Permite filtrar listings por país, cidade, bairro, preço máximo e atividade
 * Utilizado na view de mapas para refinar a visualização dos marcadores
 */
export default {
  name: "MapFilters",
  props: {
    // Objeto com países como chaves e arrays de cidades como valores
    countries: {
      type: Object,
      required: true
    },
    // Array de cidades disponíveis para o país selecionado
    cities: {
      type: Array,
      required: true
    },
    // Array de grupos de bairros disponíveis para a cidade selecionada
    neighbourhoodGroups: {
      type: Array,
      required: true
    },
    // Preço máximo disponível nos listings (usado como limite do slider)
    maxPrice: {
      type: Number,
      default: 500
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
    },
    // Bairro selecionado no filtro ("All" para todos os bairros da cidade)
    neighbourhood: {
      type: String,
      default: 'ALL'
    },
    // Filtro de atividade: 0 = todos, > 0 = apenas ativos (com last_review)
    occupation: {
      type: Number,
      default: 0
    },
    // Filtro de preço: 0 = apenas sem preço, > 0 = preço máximo permitido
    price: {
      type: Number,
      default: 0
    }
  }
};
</script>