<template>
  <header
    class="w-full bg-gradient-to-r from-[#1e293b] via-[#111827] to-[#0f172a] border-b border-gray-700 shadow-md"
  >
    <div
      class="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8"
    >
      <!-- Logo e Nome -->
      <div class="flex items-center space-x-3">
        <div
          class="bg-yellow-500 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg"
        >
          <span class="text-white text-2xl font-bold">🍔</span>
        </div>
        <div class="flex flex-col leading-tight">
          <h1 class="text-2xl font-extrabold text-white tracking-tight">
            Restaurante <span class="text-yellow-400">Bite a Bit</span>
          </h1>
          <span class="text-sm text-gray-400 font-medium"
            >Painel Administrativo</span
          >
        </div>
      </div>

      <!-- Perfil -->
      <div class="flex items-center space-x-4">
        <div class="flex flex-col text-right">
          <span class="text-sm font-semibold text-gray-100">{{
            userName
          }}</span>
          <span class="text-xs text-gray-400">Gerente</span>
        </div>
        <img
          :src="profileImage"
          alt="Profile"
          class="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400 shadow"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  userName: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  }
})
</script>
