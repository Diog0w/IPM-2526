<template>
  <div class="bg-white rounded-xl shadow-md border border-gray-300 w-full p-6 flex flex-col relative">
    
    <div class="flex justify-between items-start mb-4">
      <div class="text-xs text-gray-500 font-bold uppercase w-40 leading-tight">
        {{ title }}
      </div>
    </div>

    <div class="relative w-full h-[350px] pl-12 pb-8">
      
      <div class="absolute inset-0 pl-12 pb-8 flex flex-col justify-between pointer-events-none">
        <div v-for="n in 6" :key="n" class="border-t border-dashed border-gray-200 w-full h-0"></div>
      </div>

      <div class="absolute left-0 top-0 h-[320px] flex flex-col justify-between text-xs text-gray-500 pr-2 items-end w-10">
        <span>{{ maxValue }}</span>
        <span>{{ Math.round(maxValue * 0.8) }}</span>
        <span>{{ Math.round(maxValue * 0.6) }}</span>
        <span>{{ Math.round(maxValue * 0.4) }}</span>
        <span>{{ Math.round(maxValue * 0.2) }}</span>
        <span>0</span>
      </div>

      <svg class="w-full h-full" :viewBox="`0 0 ${labels.length * 80} 320`" preserveAspectRatio="none">
        <g v-for="(label, index) in labels" :key="index">
          
          <rect 
            v-if="stats1[index] > 0"
            :x="index * 80 + 20" 
            :y="320 - (stats1[index] / maxValue * 320)" 
            width="20" 
            :height="(stats1[index] / maxValue * 320)" 
            fill="#8B4513" 
            opacity="0.85"
          />

          <rect 
            v-if="stats2[index] > 0"
            :x="index * 80 + 45" 
            :y="320 - (stats2[index] / maxValue * 320)" 
            width="20" 
            :height="(stats2[index] / maxValue * 320)" 
            fill="#818cf8" 
          />
        </g>
      </svg>

      <div class="absolute bottom-0 left-12 right-0 flex justify-between px-4 text-xs text-gray-500 pt-2">
        <span v-for="label in labels" :key="label">{{ label }}</span>
      </div>
    </div>

    <div class="flex justify-center mt-6 items-center gap-6">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-[#8B4513] opacity-85"></div>
        <span class="text-sm text-gray-600 font-medium">{{ city1 }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-[#818cf8]"></div>
        <span class="text-sm text-gray-600 font-medium">{{ city2 }}</span>
      </div>
    </div>

  </div>
</template>

<script>
/**
 * Componente de gráfico de comparação (barras lado a lado)
 * Exibe dados mensais de duas cidades/comparações lado a lado para comparação visual
 * Utilizado na view de comparação para visualizar diferenças entre cidades ou países
 */
export default {
  name: "CompareChart",
  props: {
    // Título do gráfico (ex: "Average Price (€)" ou "Activity Volume (Last Reviews)")
    title: { 
      type: String, 
      default: '' 
    }, 
    // Nome da primeira cidade/comparação
    city1: { 
      type: String, 
      default: 'ALL' 
    },
    // Nome da segunda cidade/comparação
    city2: { 
      type: String, 
      default: 'ALL'
     },
    // Array de valores mensais da primeira cidade/comparação
    stats1: { 
      type: Array, 
      default: () => [] 
    },
    // Array de valores mensais da segunda cidade/comparação
    stats2: { 
      type: Array, 
      default: () => [] 
    },
    // Array de labels dos meses (ex: ['Jan', 'Feb', 'Mar'])
    labels: { 
      type: Array, 
      default: () => [] 
    }
  },
  computed: {
    /**
     * Calcula o valor máximo para a escala Y do gráfico
     * Usa o maior valor entre as duas séries e adiciona uma pequena margem
     * @returns {number} Valor máximo da escala Y
     */
    maxValue() {
      const max1 = Math.max(...this.stats1)
      const max2 = Math.max(...this.stats2)
      const highest = Math.max(max1, max2)
      return highest > 0 ? highest + 2 : 10 
    }
  }
};
</script>