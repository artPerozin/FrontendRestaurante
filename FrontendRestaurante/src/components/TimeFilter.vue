<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

type FilterType = 'day' | 'week' | 'month'

const props = defineProps<{
  modelValue: FilterType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterType): void
}>()

function updateFilter(value: FilterType) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center gap-2 mb-4">
    <button
      v-for="option in ['day', 'week', 'month']"
      :key="option"
      class="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
      :class="[
        modelValue === option
          ? 'bg-blue-500 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      ]"
      @click="updateFilter(option as FilterType)"
    >
      {{ option === 'day' ? 'Dia' : option === 'week' ? 'Semana' : 'Mês' }}
    </button>
  </div>
</template>
