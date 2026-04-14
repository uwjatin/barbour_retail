<template>
  <nav class="bg-white shadow-sm border-b px-4 py-2">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Logo / Caisse -->
      <NuxtLink to="/pos" class="flex items-center">
        <img 
          src="https://www.styleanglais.fr/wp-content/webp-express/webp-images/uploads/2025/09/barbour-by-jockey-club-logo.png.webp" 
          alt="Barbour by Jockey Club"
          class="object-contain"
          style="width: 300px; height: auto; max-height: 60px;"
        />
      </NuxtLink>

      <!-- Navigation droite : Caisse + Atelier + Dashboard + Notifications -->
      <div class="flex items-center gap-2">
        <!-- Caisse - Accès libre -->
        <NuxtLink
          to="/pos"
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="$route.path === '/pos' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'"
        >
          💳 Caisse
        </NuxtLink>

        <!-- Atelier - Accès libre -->
        <NuxtLink
          to="/atelier"
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="$route.path === '/atelier' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          🔧 Atelier
        </NuxtLink>

        <!-- VAD - Accès libre -->
        <NuxtLink
          to="/vad"
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="$route.path === '/vad' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          🛒 VAD
        </NuxtLink>

        <!-- Dashboard - Accès protégé (cadenas) -->
        <button
          @click="handleDashboardClick"
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
          :class="isAuthenticated ? ($route.path === '/dashboard' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100') : 'text-gray-400 cursor-not-allowed'"
        >
          <span v-if="!isAuthenticated">🔒</span>
          <span v-else>📊</span>
          Dashboard
        </button>

        <!-- Notifications - Discret (icône seule) -->
        <NuxtLink
          to="/notifications"
          class="p-2 rounded-md transition-colors relative"
          :class="$route.path === '/notifications' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
          title="Notifications"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span class="absolute top-0.5 right-0.5 bg-alert text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">3</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Modal de connexion (affiché si click sur Dashboard sans auth) -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showLoginModal = false">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4" @click.stop>
        <h3 class="text-lg font-semibold mb-2">🔒 Accès réservé</h3>
        <p class="text-gray-600 mb-4">Le Dashboard est accessible uniquement aux utilisateurs authentifiés.</p>
        <div class="flex gap-2">
          <button @click="showLoginModal = false" class="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Fermer
          </button>
          <button @click="login" class="flex-1 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const isAuthenticated = ref(false) // À connecter avec auth store
const showLoginModal = ref(false)

const handleDashboardClick = () => {
  if (!isAuthenticated.value) {
    showLoginModal.value = true
  } else {
    navigateTo('/dashboard')
  }
}

const login = () => {
  // TODO: Implémenter authentification
  isAuthenticated.value = true
  showLoginModal.value = false
  navigateTo('/dashboard')
}
</script>

<style scoped>
.text-primary { color: #113e1c }
.bg-primary { background-color: #113e1c }
.text-secondary { color: #059669 }
.bg-secondary { background-color: #059669 }
.text-alert { color: #F59E0B }
.bg-alert { background-color: #F59E0B }
</style>