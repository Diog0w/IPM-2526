<template>
  <div class="flex flex-col gap-4 w-full items-center">
    
    <router-link 
      :to="mainRoute" 
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition w-3/4 flex items-center justify-center"
    >
      {{ mainLabel }}
    </router-link>

    <router-link 
      :to="secondRoute"
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition w-3/4 flex items-center justify-center"
    >
      {{ secondLabel }}
    </router-link>

    <router-link 
      :to="thirdRoute"
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition w-3/4 flex items-center justify-center"
    >
      {{ thirdLabel }}
    </router-link>
  </div>
</template>

<script>
export default {
  name: "ActionsPanel",
  props: {
    mainLabel: {
      type: String,
      default: "See in Map" 
    },
    mainRoute: {
      type: String,
      default: "/map"
    },
    secondLabel: {
      type: String,
      default: "Temporal Series"
    },
    secondRoute: {
      type: String,
      default: "/temporal"     
    },
    thirdLabel: {
      type: String,
      default: "Compare"
    },
    thirdRoute: {
      type: String,
      default: "/compare"
    }
  },
  methods: {
    /**
     * Gere os eventos de teclado para navegação rápida
     * Permite usar teclas 1, 2, 3 para navegar entre as diferentes views
     * Ignora eventos quando o utilizador está a escrever em inputs
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleKeydown(event) {
      // Evitar navegação se o utilizador estiver a escrever num input
      const tagName = event.target.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        return;
      }

      // Verificar qual tecla foi pressionada e navegar para a rota correspondente
      switch (event.key) {
        case '1':
          this.$router.push(this.mainRoute);
          break;
        case '2':
          this.$router.push(this.secondRoute);
          break;
        case '3':
          this.$router.push(this.thirdRoute);
          break;
      }
    }
  },
  /**
   * Lifecycle hook executado quando o componente é montado
   * Adiciona o ouvinte de eventos de teclado para navegação rápida
   */
  mounted() {
    // Adicionar o ouvinte quando o componente aparece
    window.addEventListener('keydown', this.handleKeydown);
  },
  /**
   * Lifecycle hook executado antes do componente ser desmontado
   * Remove o ouvinte de eventos de teclado para evitar memory leaks
   * Importante: evita que o atalho funcione em páginas onde este painel não existe
   */
  beforeUnmount() {
    // Remover o ouvinte quando o componente desaparece
    window.removeEventListener('keydown', this.handleKeydown);
  }
};
</script>