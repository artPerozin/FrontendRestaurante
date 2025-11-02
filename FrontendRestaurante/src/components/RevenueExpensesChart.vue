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

async function fetchCashFlow() {
  isLoading.value = true
  try {
    const dto = new TemporalInputDto(dateRange.value)
    const response = await dashboardService.getCashFlowChart(dto)
    cashFlowData.value = Array.isArray(response) ? response : (response as any).data || []
    
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
    faturamento: item.totalSalesAmount,
    valorPago: item.totalValuePaid,
    ticketMedio: item.averageTicket,
    desconto: item.totalDiscount,
    acrescimo: item.totalIncrease,
    taxaEntrega: item.totalDeliveryFee,
    taxaServico: item.totalServiceTaxFee
  }))
)

const exportData = computed(() =>
  cashFlowFormatted.value.map(item => ({
    Data: item.data.toLocaleDateString('pt-BR'),
    'Faturamento': `R$ ${item.faturamento.toFixed(2)}`,
    'Valor Pago': `R$ ${item.valorPago.toFixed(2)}`,
    'Ticket Médio': `R$ ${item.ticketMedio.toFixed(2)}`,
    'Desconto': `R$ ${item.desconto.toFixed(2)}`,
    'Acréscimo': `R$ ${item.acrescimo.toFixed(2)}`,
    'Taxa Entrega': `R$ ${item.taxaEntrega.toFixed(2)}`,
    'Taxa Serviço': `R$ ${item.taxaServico.toFixed(2)}`,
    Período: filterType.value,
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
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day}`
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
}

function renderChart() {
  if (!cashFlowFormatted.value.length) return

  const sortedData = [...cashFlowFormatted.value].sort((a, b) => 
    a.data.getTime() - b.data.getTime()
  )

  const categories = sortedData.map(item => formatarCategoria(item.data))
  const faturamento = sortedData.map(item => item.faturamento)

  const options = {
    chart: {
      type: 'bar',
      height: 380,
      toolbar: { show: false },
      foreColor: '#9ca3af',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    series: [
      {
        name: 'Faturamento',
        data: faturamento
      }
    ],
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%'
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
          fontSize: '11px'
        },
        rotate: -45,
        rotateAlways: filterType.value === 'month'
      }
    },
    yaxis: {
      title: {
        text: 'Faturamento (R$)',
        style: { color: '#9ca3af' }
      },
      labels: {
        formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        style: {
          colors: '#9ca3af',
          fontSize: '11px'
        }
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
      row: {
        colors: ['transparent'],
        opacity: 0.5
      },
      padding: {
        bottom: 10
      }
    }
  }

  if (chart) chart.destroy()
  chart = new ApexCharts(document.querySelector("#cashFlowChart") as HTMLElement, options)
  chart.render()
}

watch(filterType, () => fetchCashFlow())

onMounted(() => fetchCashFlow())
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 shadow">
    <!-- Exportação -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" :filename="`fluxo_caixa_${filterType}`" />
    </div>

    <!-- Título -->
    <h2 class="text-xl font-bold text-gray-200 mb-2">Faturamento</h2>
    <p class="text-gray-400 mb-4">Acompanhe a evolução do faturamento do seu restaurante.</p>

    <!-- Filtros -->
    <div class="mb-4">
      <TimeFilter v-model="filterType" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="cashFlowFormatted.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado disponível para o período selecionado
    </div>

    <!-- Gráfico -->
    <div id="cashFlowChart" class="w-full h-96" v-show="cashFlowFormatted.length > 0"></div>
  </div>
</template>