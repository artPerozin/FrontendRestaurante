<script setup lang="ts">
import { ref, computed } from 'vue'
import TimeFilter from '@/components/TimeFilter.vue'
import ExportButtons from '@/components/ExportButtons.vue'

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

const selectedDate = computed(() => 
  adicionaisData.value.map(a => a.data).sort().pop() ?? ""
)

const filterType = ref<'day' | 'week' | 'month'>('week')

const adicionais = computed(() => {
  const resumo: Record<string, number> = {}
  const selected = new Date(selectedDate.value)

  adicionaisData.value.forEach(a => {
    const data = new Date(a.data)
    const match =
      (filterType.value === "day" && a.data === selectedDate.value) ||
      (filterType.value === "week" && isSameWeek(data, selected)) ||
      (filterType.value === "month" &&
        data.getMonth() === selected.getMonth() &&
        data.getFullYear() === selected.getFullYear())

    if (match) resumo[a.nome] = (resumo[a.nome] || 0) + a.pedidos
  })

  return Object.entries(resumo).map(([nome, pedidos]) => ({ nome, pedidos }))
})

const maxPedidos = computed(() =>
  adicionais.value.length ? Math.max(...adicionais.value.map(a => a.pedidos)) : 0
)

const exportData = computed(() =>
  adicionais.value.map(a => ({
    Nome: a.nome,
    Pedidos: a.pedidos,
    Período: `${filterType.value} ${selectedDate.value}`
  }))
)

function isSameWeek(date1: Date, date2: Date) {
  const oneJan = new Date(date1.getFullYear(), 0, 1)
  const week1 = Math.ceil(((date1.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
  const week2 = Math.ceil(((date2.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
  return date1.getFullYear() === date2.getFullYear() && week1 === week2
}
</script>

<template>
  <div class="relative bg-[#262b32] border border-gray-700 rounded-2xl p-6">
    <!-- Cabeçalho -->
    <div class="absolute top-2 right-2">
      <ExportButtons :data="exportData" :filename="`adicionais_${filterType}`" />
    </div>
    <h2 class="text-lg font-bold text-gray-100 mb-3">Adicionais Mais Pedidos</h2>
    <p class="text-sm text-gray-400 mb-4">Os extras favoritos dos seus clientes.</p>

    <!-- Filtro de tempo -->
    <div class="flex items-center justify-between mb-4">
      <TimeFilter v-model="filterType" />
    </div>

    <!-- Lista de adicionais -->
    <div class="space-y-2">
      <div v-for="ad in adicionais" :key="ad.nome" class="flex flex-col">
        <div class="flex justify-between text-gray-200 dark:text-gray-300 mb-1">
          <span>{{ ad.nome }}</span>
          <span>{{ ad.pedidos }}x</span>
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
