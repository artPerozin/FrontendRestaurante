<script setup lang="ts">
import { ref, computed } from 'vue'
import ExportButtons from '@/components/ExportButtons.vue'
import TimeFilter from '@/components/TimeFilter.vue'

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

const filterType = ref<'day' | 'week' | 'month'>('week')

// Última data disponível
const selectedDate = computed<string>(() => {
  const datas = lanchesData.value.map(l => l.data)
  return datas.length ? datas.sort().pop() as string : ''
})

// Verifica se duas datas são da mesma semana
function isSameWeek(date1: Date, date2: Date) {
  const oneJan = new Date(date1.getFullYear(), 0, 1)
  const week1 = Math.ceil(((date1.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
  const week2 = Math.ceil(((date2.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
  return date1.getFullYear() === date2.getFullYear() && week1 === week2
}

// Lanches filtrados + tempo médio
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
      (resumo[l.nome] ??= []).push(l.tempo)
    }
  })

  return Object.entries(resumo).map(([nome, tempos]) => ({
    nome,
    tempo: Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
  }))
})

// Tempo máximo (para o gráfico)
const maxTempo = computed(() =>
  lanches.value.length ? Math.max(...lanches.value.map(l => l.tempo)) : 0
)

// Dados para exportar
const exportData = computed(() =>
  lanches.value.map(l => ({
    Lanche: l.nome,
    "Tempo Médio (min)": l.tempo,
    Período: `${filterType.value} ${selectedDate.value}`
  }))
)
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6">
    <h2 class="text-lg font-bold text-gray-100 mb-3">Tempo Médio de Preparo</h2>
    <p class="text-sm text-gray-400 mb-4">Comparativo entre lanches mais pedidos.</p>

    <!-- Filtro de tempo -->
    <TimeFilter v-model="filterType" />

    <!-- Botões de exportação -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" :filename="`tempo_lanches_${filterType}`" />
    </div>

    <!-- Gráfico -->
    <div class="space-y-2 mt-2">
      <div v-for="l in lanches" :key="l.nome" class="flex flex-col">
        <div class="flex justify-between text-gray-200 dark:text-gray-300 mb-1">
          <span>{{ l.nome }}</span>
          <span>{{ l.tempo }} min</span>
        </div>
        <div class="w-full h-3 bg-gray-700 dark:bg-gray-900 rounded-full overflow-hidden">
          <div
            class="h-3 bg-blue-500 rounded-full transition-all duration-300"
            :style="{ width: maxTempo ? (l.tempo / maxTempo) * 100 + '%' : '0%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
