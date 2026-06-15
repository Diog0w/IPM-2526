<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-300 w-full h-full overflow-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="bg-blue-600 text-white">
          <th class="px-4 py-2 font-semibold">Anomaly</th>
          <th class="px-4 py-2 font-semibold">Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="anomalies.length === 0">
          <td colspan="2" class="px-4 py-4 text-center text-gray-500">No anomalies found</td>
        </tr>
        <tr
          v-for="(row, index) in anomalies"
          :key="index"
          class="border-t border-gray-300 hover:bg-gray-100 transition"
        >
          <td class="px-4 py-2">{{ row.name }}</td>
          <td class="px-4 py-2">{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
/**
 * Componente de tabela de anomalias
 * Exibe uma tabela com os diferentes tipos de anomalias encontradas nos listings
 * Utilizado no Dashboard para identificar problemas como preços em falta, preços altos, problemas de licença, etc.
 */
export default {
  name: "AnomaliesTable",
  props: {
    // Array de objetos com name e value para cada tipo de anomalia
    anomalies: { 
      type: Array, 
      required: true,
    }
  }
};
</script>