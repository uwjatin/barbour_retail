<template>
  <div class="min-h-screen bg-background flex flex-col p-4">
    <header class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-primary">📊 Dashboard</h1>
    </header>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex justify-center items-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement des données...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ store.error }}</p>
          <button @click="store.fetchDashboardData()" class="mt-2 text-sm font-medium text-red-700 hover:text-red-900">
            Réessayer
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="!store.error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <!-- CA Card -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2 text-gray-700">💰 CA Semaine</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Boutique</span>
            <span class="font-semibold">{{ (revenue?.boutique ?? 0).toLocaleString('fr-FR') }}€ 
              <span :class="(revenueChange?.boutique ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm">
                {{ (revenueChange?.boutique ?? 0) >= 0 ? '+' : ''}}{{ revenueChange?.boutique ?? 0 }}%
              </span>
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Web</span>
            <span class="font-semibold">{{ (revenue?.web ?? 0).toLocaleString('fr-FR') }}€ 
              <span :class="(revenueChange?.web ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm">
                {{ (revenueChange?.web ?? 0) >= 0 ? '+' : ''}}{{ revenueChange?.web ?? 0 }}%
              </span>
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Atelier</span>
            <span class="font-semibold">{{ (revenue?.atelier ?? 0).toLocaleString('fr-FR') }}€ 
              <span :class="(revenueChange?.atelier ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm">
                {{ (revenueChange?.atelier ?? 0) >= 0 ? '+' : ''}}{{ revenueChange?.atelier ?? 0 }}%
              </span>
            </span>
          </div>
          <div class="border-t pt-2 flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{{ totalRevenue.toLocaleString('fr-FR') }}€ 
              <span :class="(revenueChange?.total ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ (revenueChange?.total ?? 0) >= 0 ? '+' : ''}}{{ revenueChange?.total ?? 0 }}%
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Stock Alerts -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2 text-gray-700">📦 Stocks Critiques</h3>
        <div class="space-y-2">
          <div v-if="stockAlerts.length === 0" class="text-sm text-gray-500">Aucun stock critique</div>
          <div v-for="alert in stockAlerts" :key="alert.id" class="flex items-center justify-between p-2 bg-red-50 rounded">
            <div>
              <div class="font-medium text-sm">{{ alert.name }} {{ alert.size }}</div>
              <div class="text-xs text-gray-600">{{ alert.currentStock }} restants (seuil: {{ alert.threshold }})</div>
            </div>
            <button @click="handleOrderProduct(alert.id)" class="px-3 py-1 bg-primary text-white text-sm rounded">Commander</button>
          </div>
        </div>
        <NuxtLink to="/stocks" class="mt-4 block w-full py-2 bg-gray-100 text-center rounded hover:bg-gray-200">
          Consulter les stocks
        </NuxtLink>
      </div>

      <!-- Atelier Status -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2 text-gray-700">🔧 Atelier</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Devis en attente</span>
            <span class="font-bold text-alert">{{ atelierStats.pendingQuotes }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">En cours</span>
            <span class="font-bold text-primary">{{ atelierStats.inProgress }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Prêts à retirer</span>
            <span class="font-bold text-secondary">{{ atelierStats.readyForPickup }}</span>
          </div>
        </div>
        <NuxtLink to="/atelier" class="mt-4 block w-full py-2 bg-gray-100 text-center rounded hover:bg-gray-200">
          Voir tous les dossiers
        </NuxtLink>
      </div>

      <!-- Top Sales -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2 text-gray-700">📈 Top Ventes (7j)</h3>
        <div class="space-y-2">
          <div v-if="topSales.length === 0" class="text-sm text-gray-500">Aucune donnée de vente</div>
          <div v-for="sale in topSales" :key="sale.rank" class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-primary">{{ sale.rank }}</span>
              <span class="text-sm">{{ sale.name }}</span>
            </div>
            <span class="font-semibold text-sm">{{ sale.sales }} ventes</span>
          </div>
        </div>
        <NuxtLink to="/sales" class="mt-4 block w-full py-2 bg-gray-100 text-center rounded hover:bg-gray-200">
          Consulter les ventes
        </NuxtLink>
      </div>

      <!-- AI Suggestions -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2 text-gray-700">⚙️ Suggestions Réassort</h3>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded">
          <div class="flex items-start gap-2 mb-2">
            <span class="text-2xl">{{ aiSuggestions[0].icon }}</span>
            <div>
              <div class="font-medium text-sm">{{ aiSuggestions[0].title }}</div>
              <div class="text-xs text-gray-600">{{ aiSuggestions[0].subtitle }}</div>
            </div>
          </div>
          <div class="text-sm font-medium text-blue-700 mb-2">
            → {{ aiSuggestions[0].action }}
          </div>
          <button @click="handleCreateSupplierOrder(0)" class="w-full py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
            📋 Créer commande fournisseur
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboardStore'
import { computed } from 'vue'

const store = useDashboardStore()

// Computed properties for template access
const revenue = computed(() => store.revenue)
const revenueChange = computed(() => store.revenueChange)
const totalRevenue = computed(() => store.totalRevenue)
const stockAlerts = computed(() => store.stockAlerts)
const atelierStats = computed(() => store.atelierStats)
const topSales = computed(() => store.topSales)
const aiSuggestions = computed(() => store.aiSuggestions)

// Charger les données au montage
onMounted(() => {
  store.fetchDashboardData()
})

// Fonctions d'action
function handleOrderProduct(productId: string) {
  store.orderProduct(productId)
  // TODO: Ouvrir modal ou rediriger vers page commande
  alert(`Commande initiée pour le produit ${productId}`)
}

function handleCreateSupplierOrder() {
  store.createSupplierOrder(0) // Première suggestion
  // TODO: Ouvrir modal ou rediriger vers page commande fournisseur
  alert('Création de commande fournisseur initiée')
}
</script>

<style scoped>
.text-primary { color: #113e1c }
.bg-primary { background-color: #113e1c }
.text-secondary { color: #059669 }
.bg-secondary { background-color: #059669 }
.text-alert { color: #F59E0B }
.bg-alert { background-color: #F59E0B }
.text-error { color: #EF4444 }
.bg-error { background-color: #EF4444 }
</style>