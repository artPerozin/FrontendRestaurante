<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L, { Map } from 'leaflet'
import 'leaflet.heat'
import * as XLSX from 'xlsx'

interface Pedido {
  lat: number
  lng: number
  intensidade?: number
}

// Definindo o tipo correto: array de tuplas [lat, lng, intensidade?]
type HeatPoint = [number, number, number?]

const map = ref<Map>()
let heat: any

// Dados estáticos simulando pedidos
const pedidosPorPeriodo: Record<'day' | 'week' | 'month', HeatPoint[]> = {
  day: [
    [-23.5505, -46.6333, 5],
    [-23.558, -46.641, 10],
    [-23.542, -46.64, 8]
  ],
  week: [
    [-23.5505, -46.6333, 7],
    [-23.558, -46.641, 12],
    [-23.542, -46.64, 10],
    [-23.545, -46.625, 9],
    [-23.56, -46.62, 11]
  ],
  month: [
    [-23.5505, -46.6333, 5],
    [-23.558, -46.641, 10],
    [-23.542, -46.64, 8],
    [-23.545, -46.625, 12],
    [-23.56, -46.62, 3],
    [-23.555, -46.61, 7],
    [-23.565, -46.63, 15],
    [-23.57, -46.64, 6]
  ]
}

const periodoSelecionado = ref<'day' | 'week' | 'month'>('week')

// Função para exportar os dados do período atual
const exportarExcel = () => {
  const dados = pedidosPorPeriodo[periodoSelecionado.value].map(([lat, lng, intensidade]) => ({
    Latitude: lat,
    Longitude: lng,
    Intensidade: intensidade ?? 0
  }))
  const planilha = XLSX.utils.json_to_sheet(dados)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, planilha, 'Pedidos')
  XLSX.writeFile(wb, `pedidos_${periodoSelecionado.value}.xlsx`)
}

onMounted(() => {
  map.value = L.map('map').setView([-23.5505, -46.6333], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map.value)

  heat = (L as any).heatLayer(pedidosPorPeriodo[periodoSelecionado.value], {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    gradient: { 0.2: '#374151', 0.5: '#fbbf24', 0.8: '#10b981' }
  }).addTo(map.value)
})

// Atualiza o mapa quando muda o período
const atualizarMapa = () => {
  if (heat && map.value) {
    heat.setLatLngs(pedidosPorPeriodo[periodoSelecionado.value])
  }
}
</script>

<template>
  <div class="bg-[#262b32] relative border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
    <div class="flex justify-between items-start mb-4">
      <h2 class="text-xl font-bold dark:text-gray-200">Mapa de Pedidos por Região</h2>
      <div class="flex items-center gap-2">
        <select
          v-model="periodoSelecionado"
          @change="atualizarMapa"
          class="bg-[#1e2329] text-gray-200 border border-gray-700 rounded-lg text-sm px-3 py-1 cursor-pointer hover:border-gray-500 transition"
        >
          <option value="dia">Hoje</option>
          <option value="week">Semana</option>
          <option value="month">Mês</option>
        </select>
        <button
          @click="exportarExcel"
          class="bg-[#1e2329] hover:bg-[#2b323a] border border-gray-700 text-gray-300 px-3 py-1 rounded-lg text-sm transition"
          title="Exportar dados para Excel"
        >
          📊 Exportar
        </button>
      </div>
    </div>

    <p class="text-gray-500 dark:text-gray-400 mb-4">
      Visualize onde os pedidos estão concentrados na cidade.
    </p>

    <div id="map" style="height: 420px; border-radius: 12px;"></div>
  </div>
</template>

<style>
.leaflet-container {
  width: 100%;
  height: 100%;
}
</style>
