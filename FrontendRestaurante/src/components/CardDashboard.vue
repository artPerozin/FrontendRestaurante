<script setup lang="ts">
defineProps<{
  icon: string
  bgColor: string
  value: string
  label: string
  labelColor?: string 
}>()
</script>

<template>
  <div class="bg-[#262b32] shadow rounded-lg p-6 flex items-center space-x-4">
    <div :class="`${bgColor} p-3 rounded-lg text-white`">
      <i :class="icon + ' fa-2x'"></i>
    </div>
    <div class="flex flex-col">
      <span class="text-xl font-bold text-gray-200">{{ value }}</span>
      <span :class="`text-sm font-bold ${labelColor || 'text-gray-400'}`">{{ label }}</span>
    </div>
  </div>
</template>
