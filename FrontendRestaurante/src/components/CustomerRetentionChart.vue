<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from './TimeFilter.vue'
import ExportButtons from './ExportButtons.vue'
import DashboardService from '@/services/DashboardService'
import http from '@/http'
import { CustomerRetentionDTO } from '@/DTO/CustomerRetentionDto'
import { TemporalInputDto } from '@/DTO/TemporalInputDto'

const dashboardService = new DashboardService(http)
const filterType = ref<'day' | 'week' | 'month'>('week')
const isLoading = ref(false)
const chart = ref<ApexCharts | null>(null)
const clientesData = ref<CustomerRetentionDTO[]>([])

// Computa o range de datas baseado no filtro
const dateRange = computed(() => {
  const start = new Date()
  const end = new Date()

  if (filterType.value === 'day') {
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)
  } else if (filterType.value === 'week') {
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)
  } else if (filterType.value === 'month') {
    start.setMonth(start.getMonth() - 1)
    start.setDate(1)
    start.setHours(0,0,0,0)
    end.setMonth(end.getMonth())
    end.setDate(0)
    end.setHours(23,59,59,999)
  }

  return {
    start_date: start.toISOString().slice(0, 19).replace('T', ' '),
    end_date: end.toISOString().slice(0, 19).replace('T', ' ')
  }
})

async function fetchCustomerRetention() {
  isLoading.value = true
  try {
    const dto = new TemporalInputDto(dateRange.value)
    const response = await dashboardService.getCustomerRetention(dto)
    clientesData.value = Array.isArray(response) ? response : (response as any).data || []
    await new Promise(resolve => setTimeout(resolve, 0))
    renderChart()
  } catch (err) {
    console.error('Erro ao buscar retenção de clientes:', err)
    clientesData.value = []
    if (chart.value) chart.value.destroy()
  } finally {
    isLoading.value = false
  }
}

// Dados para exportação
const exportData = computed(() => {
  return clientesData.value.map(c => ({
    Status: c.status,
    Quantidade: c.quantidade,
    Período: filterType.value,
    'Data Início': dateRange.value.start_date,
    'Data Fim': dateRange.value.end_date
  }))
})

// Renderiza gráfico donut dinamicamente
function renderChart() {
  if (clientesData.value.length === 0) return

  const series = clientesData.value.map(c => c.quantidade)
  const labels = clientesData.value.map(c => c.status)

  const options = {
    chart: { type: 'donut', height: 250, background: 'transparent' },
    series,
    labels,
    colors: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  }

  if (chart.value) {
    chart.value.updateOptions({ series, labels })
  } else {
    chart.value = new ApexCharts(document.querySelector("#doughnutChart") as HTMLElement, options)
    chart.value.render()
  }
}

watch(filterType, () => fetchCustomerRetention())

onMounted(() => fetchCustomerRetention())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6">
    <h2 class="text-base font-bold text-gray-200 mb-1">Clientes Retidos</h2>
    <p class="text-sm text-gray-300 mb-2">
      Distribuição dos clientes por status de retenção.
    </p>

    <TimeFilter v-model="filterType" />

    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" filename="clientes_retention" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="clientesData.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado disponível para o período selecionado
    </div>

    <div id="doughnutChart" class="w-full h-64" v-show="clientesData.length > 0"></div>
  </div>
</template>
