<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import L, { Map } from 'leaflet'
import 'leaflet.heat'
import TimeFilter from '@/components/TimeFilter.vue'
import type { DeliveryLocationDTO } from '@/DTO/DeliveryLocationDto'
import { TemporalInputDto } from '@/DTO/TemporalInputDto'
import DashboardService from '@/services/DashboardService'
import http from '@/http'

type HeatPoint = [number, number, number?]

const dashboardService = new DashboardService(http)
const deliveryLocations = ref<DeliveryLocationDTO[]>([])
const isLoading = ref(false)
const map = ref<Map>()
let heat: any

const dateRange = computed(() => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 15)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0]
  }
})

async function fetchDeliveryLocations() {
  isLoading.value = true
  try {
    const dto = new TemporalInputDto(dateRange.value)
    const response = await dashboardService.getDeliveryLocationsChart(dto)
    deliveryLocations.value = Array.isArray(response) ? response : (response as any).data || []
    updateHeatmap()
  } catch (error) {
    deliveryLocations.value = []
  } finally {
    isLoading.value = false
  }
}

const heatPoints = computed(() => {
  if (!deliveryLocations.value.length) return []
  const locationMap: Record<string, number> = {}
  deliveryLocations.value.forEach(location => {
    const key = `${location.lat},${location.lng}`
    locationMap[key] = (locationMap[key] || 0) + 1
  })
  const points: HeatPoint[] = []
  deliveryLocations.value.forEach(location => {
    const key = `${location.lat},${location.lng}`
    const count = locationMap[key]
    if (count && !points.some(p => p[0] === location.lat && p[1] === location.lng)) {
      points.push([location.lat, location.lng, count * 2])
    }
  })
  return points
})

function updateHeatmap() {
  if (!heat || !map.value) return
  if (heatPoints.value.length > 0) {
    heat.setLatLngs(heatPoints.value)
    const lats = heatPoints.value.map(p => p[0])
    const lngs = heatPoints.value.map(p => p[1])
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
    map.value.setView([centerLat, centerLng], 13)
    setTimeout(() => {
      map.value?.invalidateSize()
    }, 100)
  } else {
    heat.setLatLngs([])
  }
}

onMounted(() => {
  map.value = L.map('map').setView([-28.689030424464885, -49.37849851975024], 13)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map.value)

  heat = (L as any).heatLayer([], {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    max: 10,
    gradient: { 0.2: '#ffff00', 0.5: '#ff8000', 0.8: '#ff0000' }
  }).addTo(map.value)
  fetchDeliveryLocations()
})
</script>

<template>
  <div class="bg-[#262b32] relative border border-gray-700 rounded-2xl p-6 shadow">
    <h2 class="text-xl font-bold text-gray-200">Mapa de Pedidos por Região</h2>
    <p class="text-gray-400 mb-4">
      Visualize onde os pedidos estão concentrados na cidade (últimos 15 dias).
    </p>
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>
    <div v-else-if="heatPoints.length === 0" class="text-center py-8 text-gray-400">
      Nenhum dado de localização disponível para o período selecionado
    </div>
    <div 
      id="map" 
      style="height: 420px; border-radius: 12px;"
      :class="{ 'opacity-0': heatPoints.length === 0 }"
    ></div>
  </div>
</template>

<style>
.leaflet-container {
  width: 100%;
  height: 100%;
}
</style>
