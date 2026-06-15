<template>
  <div class="bg-white rounded-xl shadow-md w-full p-6 flex flex-col relative overflow-hidden">
    
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

      <svg class="w-full h-full" :viewBox="`0 0 ${labels.length * 100} 320`" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradientFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.4"/> 
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0.05"/>
          </linearGradient>
        </defs>

        <polygon 
          :points="areaPoints" 
          fill="url(#gradientFill)" 
        />

        <polyline 
          :points="linePoints" 
          fill="none" 
          stroke="#6366f1" 
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle 
          v-for="(val, index) in data" 
          :key="index"
          :cx="index * 100 + 50" 
          :cy="320 - (val / maxValue * 320)" 
          r="4" 
          fill="white" 
          stroke="#6366f1" 
          stroke-width="2" 
        />
      </svg>

      <div class="absolute bottom-0 left-12 right-0 flex justify-between px-8 text-xs text-gray-500 pt-2">
        <span v-for="label in labels" :key="label">{{ label }}</span>
      </div>

    </div>
    
    <div class="flex justify-center mt-4 items-center gap-2 text-xs font-semibold text-gray-700">
      <div class="w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>
      2025
    </div>

  </div>
</template>

<script>
/**
 * Componente de gráfico temporal (linha de área)
 * Exibe séries temporais de dados mensais (preço médio ou volume de atividade)
 * Utilizado na view de séries temporais para visualizar tendências ao longo do tempo
 */
export default {
  name: "TemporalChart",
  props: {
    // Título do gráfico (ex: "Average Price (€)" ou "Activity Volume (Last Reviews)")
    title: { 
      type: String, 
      default: '' 
    },
    // Array de valores numéricos para cada mês
    data: { 
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
     * Adiciona 10% de margem superior para melhor visualização
     * @returns {number} Valor máximo da escala Y
     */
    maxValue() {
      const max = Math.max(...this.data)
      return max > 0 ? max + (max * 0.1) : 10 // Adiciona 10% de margem
    },
    
    /**
     * Gera string de pontos para a linha do gráfico no formato SVG
     * Converte valores em coordenadas (x, y) para o polyline
     * @returns {string} String de pontos no formato "x1,y1 x2,y2 ..."
     */
    linePoints() {
      return this.data.map((val, index) => {
        const x = index * 100 + 50 // Centrado na secção
        const y = 320 - (val / this.maxValue * 320)
        return `${x},${y}`
      }).join(' ')
    },

    /**
     * Gera string de pontos para a área preenchida do gráfico
     * Cria um polígono fechado incluindo a linha superior e pontos de fecho em baixo
     * @returns {string} String de pontos para o polígono SVG
     */
    areaPoints() {
      if (this.data.length === 0) return ""
      const firstX = 50
      const lastX = (this.data.length - 1) * 100 + 50
      // Adiciona pontos de fecho em baixo (y=320) para criar área preenchida
      return `0,320 ${this.linePoints} ${this.data.length * 100},320`
    }
  }
};
</script>