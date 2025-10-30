<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ApexCharts from 'apexcharts'
import * as XLSX from 'xlsx'

const filterType = ref<'day' | 'week' | 'month'>('week')
const menuOpen = ref(false)
const chart = ref<ApexCharts | null>(null)

const clientesData = ref({
  day: [30, 70],
  week: [25, 75],
  month: [20, 80]
})

const renderChart = () => {
  const options = {
    chart: { type: 'donut', height: 250, background: 'transparent' },
    series: clientesData.value[filterType.value],
    labels: ['Ativos', 'Perdidos'],
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  }

  if (chart.value) {
    chart.value.updateSeries(clientesData.value[filterType.value])
  } else {
    chart.value = new ApexCharts(document.querySelector("#doughnutChart") as HTMLElement, options)
    chart.value.render()
  }
}

watch(filterType, () => {
  renderChart()
})

// Export CSV
function exportCSV() {
  const labels = ['Ativos', 'Perdidos']
  const values = clientesData.value[filterType.value]

  let csv = "Status,Quantidade,Período\n"
  labels.forEach((label, i) => {
    csv += `${label},${values[i]},${filterType.value}\n`
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `clientes_${filterType.value}.csv`)
  link.click()
  URL.revokeObjectURL(url)
  menuOpen.value = false
}

// Export Excel
function exportExcel() {
  const labels = ['Ativos', 'Perdidos']
  const values = clientesData.value[filterType.value]

  const ws = XLSX.utils.json_to_sheet(
    labels.map((label, i) => ({
      Status: label,
      Quantidade: values[i],
      Período: filterType.value
    }))
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Clientes")
  XLSX.writeFile(wb, `clientes_${filterType.value}.xlsx`)
  menuOpen.value = false
}

onMounted(() => {
  renderChart()
})
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
    <!-- Botão de exportação -->
    <div class="absolute top-2 right-2">
      <button @click="menuOpen = !menuOpen" class="p-1 text-gray-200 hover:text-yellow-400 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div
        v-if="menuOpen"
        class="mt-1 right-0 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg absolute z-10"
      >
        <button
          @click="exportCSV"
          class="w-full text-left px-3 py-1 hover:bg-gray-700 text-gray-200 text-sm"
        >
          Exportar CSV
        </button>
        <button
          @click="exportExcel"
          class="w-full text-left px-3 py-1 hover:bg-gray-700 text-gray-200 text-sm"
        >
          Exportar Excel
        </button>
      </div>
    </div>

    <!-- Título e descrição -->
    <h2 class="text-base font-bold dark:text-gray-200">Clientes Perdidos</h2>
    <p class="text-sm dark:text-gray-300 mb-2">
      Clientes cadastrados que não fazem pedidos há mais de 20 dias.
    </p>

    <!-- Select de período alinhado à esquerda -->
    <div class="flex justify-start mb-4">
      <select
        v-model="filterType"
        class="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg text-sm px-2 py-1 cursor-pointer hover:border-gray-500 transition"
      >
        <option value="day">Hoje</option>
        <option value="week">Semana</option>
        <option value="month">Mês</option>
      </select>
    </div>

    <!-- Gráfico -->
    <div id="doughnutChart" class="space-y-2 mt-2"></div>

    <!-- Lista de clientes -->
    <div id="clientesList" class="space-y-2 mt-4"></div>
  </div>
</template>
