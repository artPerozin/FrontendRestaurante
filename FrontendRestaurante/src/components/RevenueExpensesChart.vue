<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import TimeFilter from '@/components/TimeFilter.vue'
import ExportButtons from '@/components/ExportButtons.vue'
import { TemporalInputDto } from '@/DTO/TemporalInputDto'
import DashboardService from '@/services/DashboardService'
import http from '@/http'
import type { CashFlowByDayDTO } from '@/DTO/CashFlowByDayDto'

const dashboardService = new DashboardService(http)
const cashFlowData = ref<CashFlowByDayDTO[]>([])
const filterType = ref<'day' | 'week' | 'month'>('month')
const isLoading = ref(false)
let chart: ApexCharts | null = null

function formatDateForBackend(date: Date, startOfDay = true): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const time = startOfDay ? '00:00:00' : '23:59:59'
  return `${y}-${m}-${d} ${time}`
}

const dateRange = computed(() => {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  
  let start = new Date(now)

  if (filterType.value === 'day') {
    // Apenas o dia atual completo
    start.setHours(0, 0, 0, 0)
  } else if (filterType.value === 'week') {
    // De 26/10 até hoje (02/11) = 8 dias completos
    // Para sempre pegar do dia 26 até hoje
    start.setDate(start.getDate() - 7) // -7 para incluir 8 dias (26 até 02)
    start.setHours(0, 0, 0, 0)
  } else if (filterType.value === 'month') {
    // Últimos 30 dias completos (incluindo hoje)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
  }

  const result = {
    start_date: formatDateForBackend(start, true),
    end_date: formatDateForBackend(now, false)
  }

  console.log('📅 Filtro:', filterType.value)
  console.log('📅 Período:', result.start_date, 'até', result.end_date)
  console.log('📅 Total de dias:', Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  
  return result
})

async function fetchCashFlow() {
  isLoading.value = true
  try {
    const dto = new TemporalInputDto(dateRange.value)
    const response = await dashboardService.getCashFlowChart(dto)
    
    // Extrai os dados corretamente
    if (Array.isArray(response)) {
      cashFlowData.value = response
    } else if (response && typeof response === 'object' && 'data' in response) {
      const dataArray = (response as { data: CashFlowByDayDTO[] }).data
      cashFlowData.value = Array.isArray(dataArray) ? dataArray : []
    } else {
      cashFlowData.value = []
    }
    
    await new Promise(resolve => setTimeout(resolve, 0))
    renderChart()
  } catch (error) {
    console.error('Erro ao buscar fluxo de caixa:', error)
    cashFlowData.value = []
  } finally {
    isLoading.value = false
  }
}

const cashFlowFormatted = computed(() =>
  cashFlowData.value.map(item => ({
    data: new Date(item.day),
    vendas: item.totalSales,
    valorPago: item.totalValuePaid,
    ticketMedio: item.averageTicket
  }))
)

const exportData = computed(() =>
  cashFlowFormatted.value.map(item => ({
    Data: item.data.toLocaleDateString('pt-BR'),
    'Total de Vendas': item.vendas,
    'Valor Pago': `R$ ${item.valorPago.toFixed(2)}`,
    'Ticket Médio': `R$ ${item.ticketMedio.toFixed(2)}`,
    Período: filterType.value === 'day' ? 'Dia' : filterType.value === 'week' ? 'Semana (últimos 8 dias)' : 'Mês (últimos 30 dias)',
    'Data Início': dateRange.value.start_date,
    'Data Fim': dateRange.value.end_date
  }))
)

function formatarCategoria(date: Date): string {
  if (filterType.value === 'day') {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } else if (filterType.value === 'week') {
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })
    const day = date.getDate()
    const month = date.getMonth() + 1
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day}/${month}`
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
}

function renderChart() {
  if (!cashFlowFormatted.value.length) {
    console.warn('⚠️ Nenhum dado para renderizar o gráfico')
    return
  }

  const sortedData = [...cashFlowFormatted.value].sort((a, b) => a.data.getTime() - b.data.getTime())
  const categories = sortedData.map(item => formatarCategoria(item.data))
  const valores = sortedData.map(item => item.valorPago)

  console.log('📈 Renderizando gráfico com', valores.length, 'pontos')
  console.log('📈 Categorias:', categories)

  const options = {
    chart: {
      type: 'bar',
      height: 380,
      toolbar: { show: false },
      foreColor: '#9ca3af',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    series: [{ name: 'Valor Pago', data: valores }],
    colors: ['#10b981'],
    plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { color: '#374151' },
      axisTicks: { color: '#374151' },
      labels: { 
        style: { colors: '#9ca3af', fontSize: '11px' }, 
        rotate: -45, 
        rotateAlways: filterType.value === 'month' 
      }
    },
    yaxis: {
      title: { text: 'Valor Pago (R$)', style: { color: '#9ca3af' } },
      labels: {
        formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        style: { colors: '#9ca3af', fontSize: '11px' }
      }
    },
    tooltip: {
      theme: 'dark',
      y: { 
        formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      }
    },
    grid: { 
      borderColor: '#374151', 
      row: { colors: ['transparent'], opacity: 0.5 }, 
      padding: { bottom: 10 } 
    }
  }

  if (chart) {
    chart.destroy()
    chart = null
  }
  
  chart = new ApexCharts(document.querySelector("#cashFlowChart") as HTMLElement, options)
  chart.render()
}

watch(filterType, () => fetchCashFlow())
onMounted(() => fetchCashFlow())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 shadow">
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" :filename="`fluxo_caixa_${filterType}`" />
    </div>

    <h2 class="text-xl font-bold text-gray-200 mb-2">Fluxo de Caixa</h2>
    <p class="text-gray-400 mb-4">
      Acompanhe a evolução do valor pago 
      <span v-if="filterType === 'day'">no dia atual</span>
      <span v-else-if="filterType === 'week'">na última semana</span>
      <span v-else>nos últimos 30 dias</span>
    </p>

    <div class="mb-4">
      <TimeFilter v-model="filterType" />
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="cashFlowFormatted.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado disponível para o período selecionado
    </div>

    <div id="cashFlowChart" class="w-full h-96" v-show="cashFlowFormatted.length > 0"></div>
  </div>
</template>