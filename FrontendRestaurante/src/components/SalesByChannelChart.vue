<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from '@/components/TimeFilter.vue'
import ExportButtons from '@/components/ExportButtons.vue'
import { TemporalInputDto } from '@/DTO/TemporalInputDto'
import DashboardService from '@/services/DashboardService'
import http from '@/http'
import type { SalesByChannelDescriptionDTO } from '@/DTO/SalesByChannelDescriptionDto'

const dashboardService = new DashboardService(http)
const channelsData = ref<SalesByChannelDescriptionDTO[]>([])
const filterType = ref<'day' | 'week' | 'month'>('week')
const isLoading = ref(false)
let chart: ApexCharts | null = null

const dateRange = computed(() => {
  const end = new Date()
  const start = new Date()

  if (filterType.value === 'day') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (filterType.value === 'week') {
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (filterType.value === 'month') {
    start.setMonth(start.getMonth() - 1)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    
    end.setDate(0)
    end.setHours(23, 59, 59, 999)
  }

  return {
    start_date: start.toISOString().split('T')[0] + ' 00:00:00',
    end_date: end.toISOString().split('T')[0] + ' 23:59:59'
  }
})

async function fetchChannels() {
  isLoading.value = true
  try {
    const dto = new TemporalInputDto(dateRange.value)
    const response = await dashboardService.getSalesByChannelDescriptionChart(dto)
    channelsData.value = Array.isArray(response) ? response : (response as any).data || []
    
    await new Promise(resolve => setTimeout(resolve, 0))
    renderChart()
  } catch (error) {
    console.error('Erro ao buscar canais de venda:', error)
    channelsData.value = []
  } finally {
    isLoading.value = false
  }
}

const channelsFormatted = computed(() => {
  if (!channelsData.value.length) return []
  
  const total = channelsData.value.reduce((sum, item) => sum + item.totalSales, 0)
  
  return channelsData.value.map(item => ({
    canal: item.description.replace('Canal ', ''),
    vendas: item.totalSales,
    percentual: (item.totalSales / total) * 100
  }))
})

const exportData = computed(() =>
  channelsFormatted.value.map(item => ({
    'Canal': item.canal,
    'Total de Vendas': item.vendas,
    'Percentual': `${item.percentual.toFixed(2)}%`,
    Período: filterType.value,
    'Data Início': dateRange.value.start_date,
    'Data Fim': dateRange.value.end_date
  }))
)

const channelColors: Record<string, string> = {
  'Presencial': '#10b981',
  'iFood': '#ef4444',
  'Rappi': '#f97316',
  'Uber Eats': '#14b8a6',
  'WhatsApp': '#22c55e',
  'App Próprio': '#3b82f6'
}

function renderChart() {
  if (!channelsFormatted.value.length) return

  const labels = channelsFormatted.value.map(item => item.canal)
  const series = channelsFormatted.value.map(item => item.percentual)
  const colors = labels.map(label => channelColors[label] || '#6b7280')

  const options = {
    chart: {
      type: 'donut',
      height: 300,
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    series,
    labels,
    colors,
    legend: {
      position: 'bottom',
      labels: {
        colors: '#9ca3af'
      },
      markers: {
        width: 12,
        height: 12,
        radius: 3
      }
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: false
          }
        }
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number, opts: any) => {
          const item = channelsFormatted.value[opts.seriesIndex]
          if (!item) return `${val.toFixed(2)}%`
          return `${item.vendas.toLocaleString('pt-BR')} vendas (${val.toFixed(2)}%)`
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  if (chart) chart.destroy()
  chart = new ApexCharts(document.querySelector("#canalChart") as HTMLElement, options)
  chart.render()
}

watch(filterType, () => fetchChannels())

onMounted(() => fetchChannels())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 shadow">
    <!-- Exportação -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" :filename="`canais_venda_${filterType}`" />
    </div>

    <!-- Título -->
    <h2 class="text-xl font-bold text-gray-200 mb-2">Canais de Venda</h2>
    <p class="text-gray-400 mb-4">Onde é o seu nicho competitivo? Delivery ou Presencial?</p>

    <!-- Filtros -->
    <div class="mb-4">
      <TimeFilter v-model="filterType" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="channelsFormatted.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado disponível para o período selecionado
    </div>

    <!-- Gráfico -->
    <div id="canalChart" class="w-full" v-show="channelsFormatted.length > 0"></div>
  </div>
</template>