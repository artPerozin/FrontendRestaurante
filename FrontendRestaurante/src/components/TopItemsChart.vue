<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from '@/components/TimeFilter.vue'
import ExportButtons from '@/components/ExportButtons.vue'
import type { TopItemDTO } from '@/DTO/TopItemDto'
import { TemporalInputDto } from '@/DTO/TemporalInputDto'
import DashboardService from '@/services/DashboardService'
import http from '@/http'

const dashboardService = new DashboardService(http)
const adicionaisData = ref<TopItemDTO[]>([])
const filterType = ref<'day' | 'week' | 'month'>('week')
const metricType = ref<'quantity' | 'revenue'>('revenue')
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
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0]
  }
})

async function fetchAdicionais() {
  isLoading.value = true
  try {
    const dto = new TemporalInputDto(dateRange.value)
    const response = await dashboardService.getTopItemsChart(dto)
    adicionaisData.value = Array.isArray(response) ? response : (response as any).data || []
    
    await new Promise(resolve => setTimeout(resolve, 0))
    renderChart()
  } catch (error) {
    console.error('Erro ao buscar adicionais:', error)
    adicionaisData.value = []
  } finally {
    isLoading.value = false
  }
}

const adicionais = computed(() =>
  adicionaisData.value.map(a => ({
    nome: a.item,
    pedidos: a.timesAdded,
    receita: Math.round(a.revenueGenerated * 100) / 100
  }))
)

const exportData = computed(() =>
  adicionais.value.map(a => ({
    Nome: a.nome,
    Pedidos: a.pedidos,
    Receita: `R$ ${a.receita.toFixed(2)}`,
    Período: filterType.value,
    'Data Início': dateRange.value.start_date,
    'Data Fim': dateRange.value.end_date
  }))
)

function renderChart() {
  if (!adicionais.value.length) return

  const categories = adicionais.value.map(a => a.nome)
  const data = adicionais.value.map(a => 
    metricType.value === 'quantity' ? a.pedidos : a.receita
  )

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      foreColor: '#9ca3af'
    },
    series: [{
      name: metricType.value === 'quantity' ? 'Quantidade' : 'Receita',
      data: data
    }],
    colors: ['#eab308'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        distributed: false
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories,
      axisBorder: { color: '#374151' },
      axisTicks: { color: '#374151' },
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px'
        },
        rotate: -45,
        rotateAlways: categories.length > 6
      }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => {
          if (metricType.value === 'quantity') {
            return val.toLocaleString('pt-BR')
          }
          return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        },
        style: {
          colors: '#9ca3af',
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => {
          if (metricType.value === 'quantity') {
            return `${val.toLocaleString('pt-BR')}x`
          }
          return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }
    },
    grid: {
      borderColor: '#374151',
      row: {
        colors: ['transparent'],
        opacity: 0.5
      }
    }
  }

  if (chart) chart.destroy()
  chart = new ApexCharts(document.querySelector("#topItemsChart") as HTMLElement, options)
  chart.render()
}

watch(filterType, () => fetchAdicionais())
watch(metricType, () => renderChart())

onMounted(() => fetchAdicionais())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 shadow">
    <!-- Exportação -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" :filename="`adicionais_${filterType}`" />
    </div>

    <!-- Título -->
    <h2 class="text-xl font-bold text-gray-200 mb-2">Adicionais Mais Pedidos</h2>
    <p class="text-gray-400 mb-4">Os extras favoritos dos seus clientes.</p>

    <!-- Filtros -->
    <div class="flex items-center justify-between mb-4 gap-4">
      <TimeFilter v-model="filterType" />

      <div class="flex items-center gap-2 mb-4">
        <button
          @click="metricType = 'quantity'"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200',
            metricType === 'quantity'
              ? 'bg-yellow-500 text-gray-900 shadow-sm'
              : 'text-gray-300 hover:text-gray-100'
          ]"
        >
          Quantidade
        </button>
        <button
          @click="metricType = 'revenue'"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200',
            metricType === 'revenue'
              ? 'bg-yellow-500 text-gray-900 shadow-sm'
              : 'text-gray-300 hover:text-gray-100'
          ]"
        >
          Receita
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="adicionais.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado disponível para o período selecionado
    </div>

    <!-- Gráfico -->
    <div id="topItemsChart" class="w-full h-96" v-show="adicionais.length > 0"></div>
  </div>
</template>