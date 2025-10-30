<!-- src/components/ExportButtons.vue -->
<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { exportToCSV, exportToExcel } from '@/utils/exportUtils'

interface Props {
  data: Record<string, any>[]
  filename: string
}

const props = defineProps<Props>()
const menuOpen = ref(false)

function handleCSV() {
  exportToCSV(props.data, props.filename)
  menuOpen.value = false
}

function handleExcel() {
  exportToExcel(props.data, props.filename)
  menuOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      @click="menuOpen = !menuOpen"
      class="p-1 text-gray-200 hover:text-yellow-400 cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <div
      v-if="menuOpen"
      class="mt-1 right-0 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg absolute z-10"
    >
      <button @click="handleCSV" class="w-full text-left px-3 py-1 hover:bg-gray-700 text-gray-200 text-sm">
        Exportar CSV
      </button>
      <button @click="handleExcel" class="w-full text-left px-3 py-1 hover:bg-gray-700 text-gray-200 text-sm">
        Exportar Excel
      </button>
    </div>
  </div>
</template>
