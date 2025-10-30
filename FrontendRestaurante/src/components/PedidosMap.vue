<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L, { Map } from 'leaflet'
import 'leaflet.heat'
import TimeFilter from './TimeFilter.vue'

type FilterType = 'day' | 'week' | 'month'

type HeatPoint = [number, number, number?]

const map = ref<Map>()
let heat: any

const pedidosPorPeriodo: Record<FilterType, HeatPoint[]> = {
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

const periodoSelecionado = ref<FilterType>('week')

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

watch(periodoSelecionado, (novoPeriodo) => {
  if (heat && map.value) {
    heat.setLatLngs(pedidosPorPeriodo[novoPeriodo])
  }
})
</script>

<template>
  <div class="bg-[#262b32] relative border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
    <h2 class="text-xl font-bold dark:text-gray-200">Mapa de Pedidos por Região</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-4">
      Visualize onde os pedidos estão concentrados na cidade.
    </p>
    <TimeFilter v-model="periodoSelecionado" />
    <div id="map" style="height: 420px; border-radius: 12px;"></div>
  </div>
</template>

<style>
.leaflet-container {
  width: 100%;
  height: 100%;
}
</style>
