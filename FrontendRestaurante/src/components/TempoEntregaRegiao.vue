<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

interface Lanche {
  nome: string
  tempo: number
  data: string
}

const lanchesData = ref<Lanche[]>([
  { nome: "X-Burger", tempo: 12, data: "2025-10-27" },
  { nome: "X-Burger", tempo: 14, data: "2025-10-28" },
  { nome: "X-Salada", tempo: 10, data: "2025-10-28" },
  { nome: "X-Bacon", tempo: 14, data: "2025-10-28" },
  { nome: "Cheeseburger", tempo: 11, data: "2025-10-28" },
  { nome: "Veggie", tempo: 13, data: "2025-10-28" }
])

const filterType = ref<"day" | "week" | "month">("week")
const menuOpen = ref(false)

const selectedDate = computed(() => {
  return lanchesData.value.map(l => l.data).sort().pop() ?? ""
})

const lanches = computed(() => {
  const resumo: Record<string, number[]> = {}
  const selected = new Date(selectedDate.value)

  lanchesData.value.forEach(l => {
    const data = new Date(l.data)
    const match =
      (filterType.value === "day" && l.data === selectedDate.value) ||
      (filterType.value === "week" && isSameWeek(data, selected)) ||
      (filterType.value === "month" && data.getMonth() === selected.getMonth() && data.getFullYear() === selected.getFullYear())

    if (match) {
      const arr = resumo[l.nome] ?? []
      arr.push(l.tempo)
      resumo[l.nome] = arr
    }
  })

  return Object.entries(resumo).map(([nome, tempos]) => ({
    nome,
    tempo: Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
  }))
})

const maxTempo = computed(() =>
  lanches.value.length ? Math.max(...lanches.value.map(l => l.tempo)) : 0
)

function exportCSV() {
  let csv = "Lanche,Tempo Médio (min),Período\n"
  lanches.value.forEach(
    l => (csv += `${l.nome},${l.tempo},${filterType.value} ${selectedDate.value}\n`)
  )
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `tempo_lanches_${filterType.value}.csv`)
  link.click()
  URL.revokeObjectURL(url)
  menuOpen.value = false
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(
    lanches.value.map(l => ({
      Lanche: l.nome,
      "Tempo Médio (min)": l.tempo,
      Período: `${filterType.value}`
    }))
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Lanches")
  XLSX.writeFile(wb, `tempo_lanches_${filterType.value}.xlsx`)
  menuOpen.value = false
}

function isSameWeek(date1: Date, date2: Date) {
  const oneJan = new Date(date1.getFullYear(), 0, 1)
  const week1 = Math.ceil(
    ((date1.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
  )
  const week2 = Math.ceil(
    ((date2.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
  )
  return date1.getFullYear() === date2.getFullYear() && week1 === week2
}
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6 group">
    <div class="absolute top-2 right-2">
      <button
        @click="menuOpen = !menuOpen"
        class="p-1 text-gray-200 hover:text-yellow-400 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
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

    <h2 class="text-lg font-bold text-gray-100 mb-3">Tempo Médio de Preparo</h2>
    <p class="text-sm text-gray-400 mb-4">
      Comparativo entre lanches mais pedidos.
    </p>

    <div class="flex gap-2 mb-4">
      <select v-model="filterType" class="p-2 rounded bg-gray-800 text-gray-200">
        <option value="day">Hoje</option>
        <option value="week">Semana</option>
        <option value="month">Mês</option>
      </select>
    </div>

    <div class="space-y-2">
      <div v-for="l in lanches" :key="l.nome" class="flex flex-col">
        <div class="flex justify-between text-gray-200 dark:text-gray-300 mb-1">
          <span>{{ l.nome }}</span><span>{{ l.tempo }} min</span>
        </div>
        <div
          class="w-full h-3 bg-gray-700 dark:bg-gray-900 rounded-full overflow-hidden"
        >
          <div
            class="h-3 bg-blue-500 rounded-full"
            :style="{ width: maxTempo ? (l.tempo / maxTempo) * 100 + '%' : '0%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
