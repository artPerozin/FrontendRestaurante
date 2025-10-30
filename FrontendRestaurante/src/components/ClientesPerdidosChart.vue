<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from './TimeFilter.vue'
import ExportButtons from './ExportButtons.vue'

type FilterType = 'day' | 'week' | 'month'

const filterType = ref<FilterType>('week')

const clientesData = reactive({
  day: [30, 70],
  week: [25, 75],
  month: [20, 80]
})

const chart = ref<ApexCharts | null>(null)

const renderChart = () => {
  const options = {
    chart: { type: 'donut', height: 250, background: 'transparent' },
    series: clientesData[filterType.value],
    labels: ['Ativos', 'Perdidos'],
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  }

  if (chart.value) {
    chart.value.updateSeries(clientesData[filterType.value])
  } else {
    chart.value = new ApexCharts(document.querySelector("#doughnutChart") as HTMLElement, options)
    chart.value.render()
  }
}

watch(filterType, () => renderChart())

const exportData = () => {
  const labels = ['Ativos', 'Perdidos']
  return labels.map((label, i) => ({
    Status: label,
    Quantidade: clientesData[filterType.value][i],
    Período: filterType.value
  }))
}

onMounted(() => renderChart())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
    <h2 class="text-base font-bold dark:text-gray-200">Clientes Perdidos</h2>
    <p class="text-sm dark:text-gray-300 mb-2">Clientes cadastrados que não fazem pedidos há mais de 20 dias.</p>

    <!-- TimeFilter -->
    <TimeFilter v-model="filterType" />

    <!-- ExportButtons -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData()" filename="clientes" />
    </div>

    <!-- Gráfico -->
    <div id="doughnutChart" class="space-y-2 mt-2"></div>
  </div>
</template>
