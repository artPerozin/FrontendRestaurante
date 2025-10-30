<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from './TimeFilter.vue'
import ExportButtons from './ExportButtons.vue'

type FilterType = 'day' | 'week' | 'month'

const filterType = ref<FilterType>('week')

const canaisData = reactive({
  day: [60, 25, 15],
  week: [50, 30, 20],
  month: [45, 35, 20]
})

const chart = ref<ApexCharts | null>(null)

const renderChart = () => {
  const options = {
    chart: { type: 'donut', height: 250, background: 'transparent' },
    series: canaisData[filterType.value],
    labels: ['App', 'Site', 'Telefone'],
    colors: ['#3b82f6', '#f59e0b', '#10b981'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => `${val}%` } }
  }

  if (chart.value) {
    chart.value.updateSeries(canaisData[filterType.value])
  } else {
    chart.value = new ApexCharts(document.querySelector("#canalChart") as HTMLElement, options)
    chart.value.render()
  }
}

watch(filterType, () => renderChart())

const exportData = () => {
  const labels = ['App', 'Site', 'Telefone']
  return labels.map((label, i) => ({
    Canal: label,
    Percentual: `${canaisData[filterType.value][i]}%`,
    Período: filterType.value
  }))
}

onMounted(() => renderChart())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
    <h2 class="text-base font-bold dark:text-gray-200">Canais de Venda</h2>
    <p class="text-sm dark:text-gray-300 mb-2">Onde é o seu nicho competitivo? Delivery ou Presencial?</p>

    <!-- TimeFilter -->
    <TimeFilter v-model="filterType" />

    <!-- ExportButtons -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData()" filename="canais" />
    </div>

    <!-- Gráfico -->
    <div id="canalChart" class="space-y-2 mt-2"></div>
  </div>
</template>
