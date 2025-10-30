<script setup lang="ts">
import Header from './components/Header.vue'
import CardDashboard from './components/CardDashboard.vue'
import RevenueExpensesChart from './components/RevenueExpensesChart.vue'
import PedidosMap from './components/PedidosMap.vue'
import ClientesPerdidosChart from './components/ClientesPerdidosChart.vue'
import PagamentosChart from './components/PagamentosChart.vue'
import CanalCompraChart from './components/CanalCompraChart.vue'
import AdicionaisMaisPedidos from './components/AdicionaisMaisPedidos.vue'
import TempoMedioPreparo from './components/TempoMedioPreparo.vue'
import TempoEntregaRegiao from './components/TempoEntregaRegiao.vue'

const cards = [
  { icon: 'fas fa-dollar-sign', bgColor: 'bg-yellow-500', value: 'R$ 85,40', label: 'Ticket Médio', labelColor: 'text-yellow-400' },
  { icon: 'fas fa-coins', bgColor: 'bg-green-500', value: 'R$ 5.230,00', label: 'Faturamento Hoje', labelColor: 'text-green-400' },
  { icon: 'fas fa-truck', bgColor: 'bg-red-500', value: '142', label: 'Delivery Entregues', labelColor: 'text-red-400' }
]
</script>

<template>
  <Header userName="Dona Maria" profileImage="https://static01.nyt.com/images/2019/11/08/world/08quebec/08quebec-superJumbo.jpg"/>

  <main class="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-12 gap-8">
    <!-- Left Column -->
    <section class="lg:col-span-8 flex flex-col space-y-8">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardDashboard v-for="(card, i) in cards" :key="i" v-bind="card"/>
      </div>
      <RevenueExpensesChart />
      <PedidosMap />
      <div class="grid lg:grid-cols-3 gap-6">
        <ClientesPerdidosChart />
        <PagamentosChart />
        <CanalCompraChart />
      </div>
    </section>

    <aside class="lg:col-span-4 flex flex-col space-y-6">
      <AdicionaisMaisPedidos />
      <TempoMedioPreparo />
      <TempoEntregaRegiao />
    </aside>
  </main>
</template>