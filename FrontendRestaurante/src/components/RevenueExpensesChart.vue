<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from './TimeFilter.vue' // ajuste o caminho conforme seu projeto

type FilterType = 'day' | 'week' | 'month'

const period = ref<FilterType>('week') // valor inicial
let barChart: ApexCharts | null = null

function gerarDados(qtd: number, min = 100, max = 600): number[] {
  return Array.from({ length: qtd }, () => Math.floor(Math.random() * (max - min + 1) + min))
}

function renderizarGrafico(periodo: FilterType = 'week') {
  let categories: string[] = []
  let dias = 30

  if (periodo === 'week') {
    categories = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    dias = 7
  } else if (periodo === 'month') {
    categories = Array.from({ length: 30 }, (_, i) => `Dia ${i + 1}`)
    dias = 30
  } else { // day
    categories = ['00h', '04h', '08h', '12h', '16h', '20h']
    dias = categories.length
  }

  const faturamento = gerarDados(dias, 300, 700)
  const despesas = gerarDados(dias, 100, 400)

  const options = {
    chart: { type: 'bar', height: 350, toolbar: { show: false }, foreColor: '#9ca3af' },
    series: [
      { name: 'Faturamento', data: faturamento },
      { name: 'Despesas', data: despesas }
    ],
    colors: ['#10b981', '#ef4444'],
    plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { color: '#374151' },
      axisTicks: { color: '#374151' },
      labels: { style: { colors: '#9ca3af', fontSize: '12px' } }
    },
    yaxis: {
      labels: { formatter: (val: number) => `R$ ${val.toLocaleString()}`, style: { colors: '#9ca3af', fontSize: '12px' } }
    },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => `R$ ${val.toLocaleString()}` } },
    grid: { borderColor: '#374151', row: { colors: ['transparent'], opacity: 0.5 } },
    legend: { position: 'top', horizontalAlign: 'center', labels: { colors: '#9ca3af' } }
  }

  if (barChart) barChart.destroy()
  barChart = new ApexCharts(document.querySelector("#barChart") as HTMLElement, options)
  barChart.render()
}

onMounted(() => renderizarGrafico(period.value))
watch(period, (newPeriod) => renderizarGrafico(newPeriod))
</script>

<template>
  <div class="bg-[#262b32] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow">
    <h2 class="text-xl font-bold dark:text-gray-200">Faturamento x Despesas</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-4">
      Visualize como anda o fluxo de caixa do seu restaurante.
    </p>
    <TimeFilter v-model="period" />
    <div id="barChart"></div>
  </div>
</template>
