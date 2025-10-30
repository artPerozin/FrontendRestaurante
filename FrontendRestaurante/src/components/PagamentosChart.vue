<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from './TimeFilter.vue'
import ExportButtons from './ExportButtons.vue'
import { reactive } from 'vue'

type FilterType = 'day' | 'week' | 'month'

const filterType = ref<FilterType>('week')

const pagamentosData = reactive({
  day: [60, 25, 15],
  week: [45, 30, 25],
  month: [40, 35, 25]
})

const chart = ref<ApexCharts | null>(null)

const renderChart = () => {
  const options = {
    chart: { type: 'donut', height: 250, background: 'transparent' },
    series: pagamentosData[filterType.value],
    labels: ['Cartão de Crédito', 'PIX', 'Dinheiro'],
    colors: ['#3b82f6', '#f59e0b', '#10b981'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `${val}%` }
    }
  }

  if (chart.value) {
    chart.value.updateSeries(pagamentosData[filterType.value])
  } else {
    chart.value = new ApexCharts(
      document.querySelector("#pagamentosChart") as HTMLElement,
      options
    )
    chart.value.render()
  }
}

watch(filterType, () => renderChart())

// Dados formatados para exportação
const exportData = () => {
  const labels = ['Cartão de Crédito', 'PIX', 'Dinheiro']
  return labels.map((label, i) => ({
    Tipo: label,
    Percentual: `${pagamentosData[filterType.value][i]}%`,
    Período: filterType.value
  }))
}

onMounted(() => renderChart())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 group">
    <!-- Título e descrição -->
    <h2 class="text-base font-bold dark:text-gray-200">Tipos de Pagamento</h2>
    <p class="text-sm dark:text-gray-300 mb-2">
      Análise de como seus clientes estão lhe pagando
    </p>

    <!-- TimeFilter -->
    <TimeFilter v-model="filterType" />

    <!-- Botão de exportação -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData()" filename="pagamentos" />
    </div>

    <!-- Gráfico -->
    <div id="pagamentosChart" class="space-y-2 mt-2"></div>
  </div>
</template>
