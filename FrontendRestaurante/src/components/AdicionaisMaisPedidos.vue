<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

interface Adicional {
  nome: string
  pedidos: number
  data: string
}

const adicionaisData = ref<Adicional[]>([
  { nome: "Queijo Extra", pedidos: 10, data: "2025-10-20" },
  { nome: "Queijo Extra", pedidos: 20, data: "2025-10-28" },
  { nome: "Bacon", pedidos: 15, data: "2025-10-27" },
  { nome: "Bacon", pedidos: 30, data: "2025-10-28" },
  { nome: "Molho Especial", pedidos: 8, data: "2025-10-27" },
  { nome: "Molho Especial", pedidos: 12, data: "2025-10-28" },
  { nome: "Cebola Caramelizada", pedidos: 5, data: "2025-10-28" },
  { nome: "Pimenta Extra", pedidos: 3, data: "2025-10-28" }
])

const selectedDate = ref("2025-10-28")
const filterType = ref<"day" | "week" | "month">("week")

const menuOpen = ref(false)

const adicionais = computed(() => {
  const resumo: Record<string, number> = {}
  adicionaisData.value.forEach(a => {
    const data = new Date(a.data)
    const selected = new Date(selectedDate.value)

    if (
      (filterType.value === "day" && a.data === selectedDate.value) ||
      (filterType.value === "week" && isSameWeek(data, selected)) ||
      (filterType.value === "month" && data.getMonth() === selected.getMonth() && data.getFullYear() === selected.getFullYear())
    ) {
      resumo[a.nome] = (resumo[a.nome] || 0) + a.pedidos
    }
  })

  return Object.entries(resumo).map(([nome, pedidos]) => ({ nome, pedidos }))
})

const maxPedidos = computed(() => {
  return adicionais.value.length ? Math.max(...adicionais.value.map(a => a.pedidos)) : 0
})

function exportCSV() {
  let csv = "Nome,Pedidos,Data/Período\n"
  adicionais.value.forEach(a => {
    csv += `${a.nome},${a.pedidos},${filterType.value} ${selectedDate.value}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `adicionais_${filterType.value}_${selectedDate.value}.csv`)
  link.click()
  URL.revokeObjectURL(url)
  menuOpen.value = false
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(
    adicionais.value.map(a => ({ Nome: a.nome, Pedidos: a.pedidos, "Período": `${filterType.value} ${selectedDate.value}` }))
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Adicionais")
  XLSX.writeFile(wb, `adicionais_${filterType.value}_${selectedDate.value}.xlsx`)
  menuOpen.value = false
}

function isSameWeek(date1: Date, date2: Date) {
  const oneJan = new Date(date1.getFullYear(),0,1)
  const week1 = Math.ceil((((date1.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay()+1)/7)
  const week2 = Math.ceil((((date2.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay()+1)/7)
  return date1.getFullYear() === date2.getFullYear() && week1 === week2
}
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 group">
    <div class="absolute top-2 right-2">
      <button @click="menuOpen = !menuOpen" class="p-1 text-gray-200 hover:text-yellow-400 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div v-if="menuOpen" class="mt-1 right-0 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg absolute z-10">
        <button @click="exportCSV" class="w-full text-left px-3 py-1 hover:bg-gray-700 text-gray-200 text-sm">Exportar CSV</button>
        <button @click="exportExcel" class="w-full text-left px-3 py-1 hover:bg-gray-700 text-gray-200 text-sm">Exportar Excel</button>
      </div>
    </div>
    <h2 class="text-lg font-bold text-gray-100 mb-3">Adicionais Mais Pedidos</h2>
    <p class="text-sm text-gray-400 mb-4">Os extras favoritos dos seus clientes.</p>
    <div class="flex gap-2 mb-4">
      <select v-model="filterType" class="p-2 rounded bg-gray-800 text-gray-200">
        <option value="day">Hoje</option>
        <option value="week">Semana</option>
        <option value="month">Mês</option>
      </select>
    </div>
    <div class="space-y-2">
      <div v-for="ad in adicionais" :key="ad.nome" class="flex flex-col">
        <div class="flex justify-between text-gray-200 dark:text-gray-300 mb-1">
          <span>{{ ad.nome }}</span><span>{{ ad.pedidos }}x</span>
        </div>
        <div class="w-full h-3 bg-gray-700 dark:bg-gray-900 rounded-full overflow-hidden">
          <div
            class="h-3 bg-yellow-500 rounded-full"
            :style="{ width: maxPedidos ? (ad.pedidos / maxPedidos) * 100 + '%' : '0%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
