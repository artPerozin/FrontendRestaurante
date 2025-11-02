<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/http'
import CardDashboard from './components/CardDashboard.vue'
import RevenueExpensesChart from './components/RevenueExpensesChart.vue'
import TopItemsChart from './components/TopItemsChart.vue'
import CustomerRetentionChart from './components/CustomerRetentionChart.vue'
import PagamentosChart from './components/PagamentosChart.vue'
import SalesByChannelChart from './components/SalesByChannelChart.vue'
import Header from './components/Header.vue'
import PerformanceByRegionChart from './components/PerformanceByRegionChart.vue'

interface Card {
  icon: string
  bgColor: string
  value: string
  label: string
  labelColor?: string
}

const cards = ref<Card[]>([
  { icon: 'fas fa-dollar-sign', bgColor: 'bg-yellow-500', value: '...', label: 'Ticket Médio', labelColor: 'text-yellow-400' },
  { icon: 'fas fa-coins', bgColor: 'bg-green-500', value: '...', label: 'Faturamento Hoje', labelColor: 'text-green-400' },
  { icon: 'fas fa-truck', bgColor: 'bg-red-500', value: '...', label: 'Delivery Entregues', labelColor: 'text-red-400' }
])

async function fetchDashboardMetrics() {
  try {
    const [ticketRes, revenueRes, deliveriesRes] = await Promise.all([
      http.get('/dashboard/weeklyAverageTicket'),
      http.get('/dashboard/weeklyRevenue'),
      http.get('/dashboard/weeklyDeliveries')
    ])

    const ticket = Array.isArray(ticketRes.data?.data) ? ticketRes.data.data[0]?.ticket_medio ?? 0 : 0
    const revenue = Array.isArray(revenueRes.data?.data) ? revenueRes.data.data[0]?.faturamento ?? 0 : 0
    const deliveries = Array.isArray(deliveriesRes.data?.data) ? deliveriesRes.data.data[0]?.total_deliveries ?? 0 : 0

    // Atualiza os cards explicitamente, garantindo todas as propriedades obrigatórias
    cards.value = [
      { icon: 'fas fa-dollar-sign', bgColor: 'bg-yellow-500', value: `R$ ${ticket.toFixed(2)}`, label: 'Ticket Médio da Semana', labelColor: 'text-yellow-400' },
      { icon: 'fas fa-coins', bgColor: 'bg-green-500', value: `R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, label: 'Faturamento desta Semana', labelColor: 'text-green-400' },
      { icon: 'fas fa-truck', bgColor: 'bg-red-500', value: deliveries.toString(), label: 'Delivery Entregues nesta Semana', labelColor: 'text-red-400' }
    ]
  } catch (err) {
    console.error('Erro ao buscar métricas do dashboard:', err)
  }
}

onMounted(() => fetchDashboardMetrics())
</script>


<template>
  <Header 
    userName="Dona Maria" 
    profileImage="https://static01.nyt.com/images/2019/11/08/world/08quebec/08quebec-superJumbo.jpg"
  />

  <main class="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-12 gap-8">
    <section class="lg:col-span-8 flex flex-col space-y-8">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardDashboard 
          v-for="(card, index) in cards" 
          :key="index" 
          v-bind="card"
        />
      </div>
      <RevenueExpensesChart />
      <TopItemsChart />
      <PerformanceByRegionChart />
    </section>
    <aside class="lg:col-span-4 flex flex-col space-y-6">
      <CustomerRetentionChart />
      <PagamentosChart />
      <SalesByChannelChart />
    </aside>
  </main>
</template>
