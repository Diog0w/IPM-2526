<template>
  <div class="grid grid-cols-2 gap-6">
    <div
      v-for="(card, index) in cards"
      :key="index"
      class="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-8 border border-gray-300"
    >
      <h2 class="text-3xl font-bold text-blue-600">{{ card.value }}</h2>
      <p class="text-gray-500 font-medium text-sm mt-2">{{ card.label }}</p>
    </div>
  </div>
</template>

<script>
/**
 * Componente de cartões de estatísticas
 * Exibe estatísticas dos listings em formato de cartões (Total listings, Preço médio, etc.)
 * Utilizado no Dashboard para apresentar métricas agregadas
 */
export default {
  name: "StatsCards",
  props: {
    // Array de objetos com label e value para cada cartão de estatística
    cards: { 
      type: Array, 
      required: true 
    }
  }
};
</script>