<template>
  <div class="h-full bg-[#F9FAFB] flex flex-col">
    <!-- Sub-header discret -->
    <header class="h-[40px] flex items-center px-4 bg-white/60 backdrop-blur-sm border-b border-gray-100 shrink-0">
      <h1 class="text-sm font-normal text-gray-400">💳 Caisse</h1>
    </header>

    <!-- Zone Recherche (80px) avec autocomplétion -->
    <section class="px-4 py-4 shrink-0 relative">
      <div class="relative">
        <input
          ref="searchInput"
          v-model="search"
          @keyup.enter="handleSearch"
          @input="filterSuggestions"
          @blur="hideSuggestions"
          placeholder="🔍 Recherche produit ou scan code-barre..."
          class="w-full h-[48px] px-4 border-2 border-gray-300 rounded-lg text-[#1F2937] placeholder-gray-400 focus:border-[#113e1c] focus:outline-none focus:ring-2 focus:ring-[#113e1c]/20 transition-all"
          aria-label="Recherche produit ou scan code-barre"
          autocomplete="off"
        />
        <!-- Liste d'autocomplétion -->
        <ul
          v-if="suggestions.length > 0"
          class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto z-50"
        >
          <li
            v-for="product in suggestions"
            :key="product.sku"
            @click="addProductFromSuggestion(product)"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
          >
            <div>
              <div class="font-medium text-[#1F2937]">{{ product.name }}</div>
              <div class="text-sm text-gray-500">{{ product.sku }}</div>
            </div>
            <div class="font-semibold text-[#113e1c]">{{ product.price.toFixed(2) }} €</div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Zone Panier (Flex-1, scrollable) -->
    <section class="flex-1 mx-4 mb-4 bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <div class="p-4 border-b border-gray-100 shrink-0">
        <h2 class="text-lg font-semibold text-[#1F2937]">📦 Panier ({{ cart.count }} articles)</h2>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4">
        <ul v-if="cart.items.length > 0" class="space-y-3" role="list">
          <li
            v-for="item in cart.items"
            :key="item.sku"
            class="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-gray-100"
          >
          <div class="flex-1 min-w-0">
            <div class="font-medium text-[#1F2937] truncate">{{ item.name }}</div>
            <div class="text-sm text-gray-600">{{ item.sku }}</div>
          </div>
          <!-- Contrôles de quantité discrets -->
          <div class="flex items-center gap-1 mr-3">
            <button
              @click="cart.updateQuantity(item.sku, -1)"
              class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors text-sm"
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span class="w-8 text-center text-sm font-medium text-gray-700">{{ item.qty }}</span>
            <button
              @click="cart.updateQuantity(item.sku, 1)"
              class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors text-sm"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-[#1F2937] min-w-[80px] text-right">{{ (item.price * item.qty).toFixed(2) }} €</span>
            <button
              @click="cart.removeItem(item.sku)"
              class="text-[#EF4444] hover:text-[#EF4444]/80 p-1 rounded hover:bg-red-50 transition-colors"
              aria-label="Supprimer l'article"
            >
              🗑️
            </button>
          </div>
          </li>
        </ul>
        <div v-else class="text-center text-gray-400 py-8">
          <p class="text-lg">🛒 Le panier est vide</p>
          <p class="text-sm mt-2">Scannez un produit ou utilisez la recherche</p>
        </div>
      </div>
      
      <!-- Total sticky -->
      <div class="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
        <div class="text-right font-bold text-2xl text-[#1F2937]">TOTAL : {{ cart.total.toFixed(2) }} €</div>
      </div>
    </section>

    <!-- Zone Actions (Footer - 80px) -->
    <footer class="h-[80px] px-4 pb-4 shrink-0 flex items-center gap-3">
      <button
        @click="handleClearCart"
        class="h-[48px] px-4 bg-gray-200 text-[#1F2937] rounded-lg font-medium hover:bg-gray-300 transition-colors"
        aria-label="Vider le panier"
      >
        🗑️ Vider
      </button>
      <button
        @click="startCheckoutCB"
        class="flex-1 h-[48px] bg-[#113e1c] text-white rounded-lg font-semibold hover:bg-[#113e1c]/90 transition-colors shadow-lg"
        aria-label="Payer par carte bancaire"
      >
        💳 CB (F3)
      </button>
      <button
        @click="startCheckoutCash"
        class="flex-1 h-[48px] bg-[#059669] text-white rounded-lg font-semibold hover:bg-[#059669]/90 transition-colors shadow-lg"
        aria-label="Payer en espèces"
      >
        💵 ESPÈCES (F4)
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

interface APIVariation {
  id: string
  size: string
  color: string
  stock: number
  price: string | number
}

interface APIProduct {
  id: string
  sku: string
  name: string
  basePrice: string | number
  variations: APIVariation[]
}

interface Product {
  sku: string
  name: string
  price: number
}

const cart = useCartStore()
const search = ref('')
const cashierName = 'Marie'
const searchInput = ref<HTMLInputElement | null>(null)
const allProducts = ref<Product[]>([])
const suggestions = ref<Product[]>([])

// Charger les produits au montage et transformer les données
onMounted(async () => {
  try {
    const response = await $fetch<{ success: boolean; data: APIProduct[] }>('/api/products')
    // Transformer les produits API en format simple pour le POS
    allProducts.value = response.data.map(p => ({
      sku: p.sku,
      name: p.name,
      price: typeof p.basePrice === 'number' ? p.basePrice : parseFloat(p.basePrice) || 0
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des produits', error)
  }
})

const focusSearch = () => {
  searchInput.value?.focus()
}

function handleClearCart() {
  if (confirm('Vider le panier ?')) {
    cart.clearCart()
  }
}

// Filtrer les suggestions pendant la frappe
function filterSuggestions() {
  const query = search.value.trim().toLowerCase()
  if (query.length < 1) {
    suggestions.value = []
    return
  }

  suggestions.value = allProducts.value.filter(
    (p) =>
      p.sku.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query)
  ).slice(0, 5) // Limiter à 5 suggestions
}

// Ajouter un produit depuis la suggestion
function addProductFromSuggestion(product: Product) {
  cart.addItem(product.sku, product.name, product.price)
  search.value = ''
  suggestions.value = []
}

// Cacher les suggestions quand on clique ailleurs
function hideSuggestions() {
  setTimeout(() => {
    suggestions.value = []
  }, 200)
}

useKeyboardShortcuts(focusSearch, startCheckoutCB, startCheckoutCash, handleClearCart)

async function handleSearch() {
  if (!search.value.trim()) return
  try {
    const response = await $fetch<{ success: boolean; data: APIProduct[] }>('/api/products')
    const query = search.value.trim().toLowerCase()
    const apiProduct = response.data.find(
      (p) => p.sku.toLowerCase() === query || p.name.toLowerCase().includes(query)
    )
    if (apiProduct) {
      const price = typeof apiProduct.basePrice === 'number' ? apiProduct.basePrice : parseFloat(apiProduct.basePrice) || 0
      cart.addItem(apiProduct.sku, apiProduct.name, price)
    } else {
      alert('Produit non trouvé')
    }
  } catch (error) {
    console.error('Erreur lors de la recherche produit', error)
    alert('Erreur réseau: impossible de charger les produits')
  }
  search.value = ''
}

function startCheckoutCB() {
  alert('Paiement par Carte Bancaire - Le paiement sera intégré ultérieurement.')
  cart.clearCart()
}

function startCheckoutCash() {
  alert('Paiement en Espèces - Le paiement sera intégré ultérieurement.')
  cart.clearCart()
}
</script>

<style scoped>
.text-primary { color: #113e1c }
.bg-secondary { background-color: #059669 }
</style>
