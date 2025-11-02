<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import DashboardService from '@/services/DashboardService'
import http from '@/http'
import { RegionPerformanceDTO } from '@/DTO/RegionPerformanceDto'

const dashboardService = new DashboardService(http)
const performanceData = ref<RegionPerformanceDTO[]>([])
const isLoading = ref(false)
const error = ref<string>('')
let chart: ApexCharts | null = null

async function fetchPerformanceByRegion() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await dashboardService.getPerformanceByRegionChart()
    
    // Extrai os dados corretamente com verificação de tipo
    if (Array.isArray(response)) {
      performanceData.value = response
    } else if (response && typeof response === 'object' && 'data' in response) {
      const dataArray = (response as { data: RegionPerformanceDTO[] }).data
      performanceData.value = Array.isArray(dataArray) ? dataArray : []
    } else {
      performanceData.value = []
      console.warn('Formato de resposta inesperado:', response)
    }
    
    console.log('Dados carregados:', performanceData.value.length, 'regiões')
    
    if (performanceData.value.length > 0) {
      renderChart()
    }
  } catch (err) {
    console.error('Erro ao buscar performance por região:', err)
    error.value = 'Erro ao carregar dados. Tente novamente.'
    performanceData.value = []
  } finally {
    isLoading.value = false
  }
}

function renderChart() {
  if (!performanceData.value || performanceData.value.length === 0) {
    console.warn('Nenhum dado para renderizar')
    return
  }

  const categories = performanceData.value.map(c => `${c.neighborhood} - ${c.city}`)
  const avgSeries = performanceData.value.map(c => Number(c.avgDeliveryMinutes) || 0)
  const p90Series = performanceData.value.map(c => Number(c.p90DeliveryMinutes) || 0)

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 400,
      toolbar: { show: false },
      foreColor: '#9ca3af'
    },
    series: [
      {
        name: 'Média (min)',
        type: 'column',
        data: avgSeries
      },
      {
        name: 'P90 (min)',
        type: 'line',
        data: p90Series
      }
    ],
    colors: ['#22c55e', '#f97316'],
    stroke: {
      width: [0, 4],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '50%'
      }
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        rotateAlways: categories.length > 6,
        style: {
          colors: '#9ca3af'
        }
      },
      axisBorder: { color: '#374151' },
      axisTicks: { color: '#374151' }
    },
    yaxis: [
      {
        title: {
          text: 'Média (min)',
          style: { color: '#22c55e' }
        },
        labels: {
          formatter: (val: number) => val.toFixed(1),
          style: { colors: '#22c55e' }
        }
      },
      {
        opposite: true,
        title: {
          text: 'P90 (min)',
          style: { color: '#f97316' }
        },
        labels: {
          formatter: (val: number) => val.toFixed(1),
          style: { colors: '#f97316' }
        }
      }
    ],
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val.toFixed(2)} min`
      }
    },
    legend: {
      labels: { colors: '#9ca3af' },
      position: 'top',
      horizontalAlign: 'right'
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4
    }
  }

  // Destrói o gráfico anterior antes de criar um novo
  if (chart) {
    chart.destroy()
    chart = null
  }

  // Aguarda um tick para garantir que o DOM está pronto
  setTimeout(() => {
    const chartElement = document.querySelector("#performanceRegionChart")
    if (chartElement) {
      chart = new ApexCharts(chartElement as HTMLElement, options)
      chart.render()
    } else {
      console.error('Elemento do gráfico não encontrado no DOM')
    }
  }, 100)
}

onMounted(() => {
  fetchPerformanceByRegion()
})
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 shadow">
    <h2 class="text-xl font-bold text-gray-200 mb-2">Performance por Região</h2>
    <p class="text-gray-400 mb-4">100 Piores médias e percentil 90 do tempo de entrega por bairro/cidade.</p>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-400">
      {{ error }}
    </div>

    <div v-else-if="performanceData.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado disponível
    </div>

    <div 
      id="performanceRegionChart" 
      class="w-full h-96" 
      v-show="performanceData.length > 0"
    ></div>
  </div>
</template>