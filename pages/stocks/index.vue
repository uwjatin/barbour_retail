<template>
  <div class="min-h-screen bg-background flex flex-col p-4">
    <!-- Header -->
    <header class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-2xl font-bold text-primary" role="heading" aria-level="1">
        📦 Stocks
      </h1>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Boutique:</label>
        <select 
          v-model="selectedShop"
          class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="all">Toutes</option>
          <option value="saint-germain">Saint-Germain</option>
          <option value="malesherbes">Malesherbes</option>
          <option value="atelier">Atelier Saint-Germain</option>
        </select>
      </div>
    </header>

    <!-- Filtres et recherche -->
    <section class="bg-white rounded-lg shadow p-4 border border-gray-100 mb-4 shrink-0">
      <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <!-- Recherche par nom -->
        <div class="relative w-full lg:w-72">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Rechercher un produit..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3">
          <!-- Filtre Type -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Type:</label>
            <select 
              v-model="filterType"
              class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option v-for="type in allTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Filtre Taille -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Taille:</label>
            <select 
              v-model="filterSize"
              class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option v-for="size in allSizes" :key="size.value" :value="size.value">
                {{ size.label }}
              </option>
            </select>
          </div>

          <!-- Filtre Couleur -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Couleur:</label>
            <select 
              v-model="filterColor"
              class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option v-for="color in allColors" :key="color.value" :value="color.value">
                {{ color.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Résumé des filtres actifs -->
      <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t flex items-center gap-2">
        <span class="text-sm text-gray-500">Filtres actifs:</span>
        <button 
          @click="resetFilters"
          class="text-sm text-primary hover:underline"
        >
          Réinitialiser
        </button>
      </div>
    </section>

    <!-- Tableau des stocks -->
    <section class="flex-1 bg-white rounded-lg shadow border border-gray-100 flex flex-col min-h-0">
      <div class="flex-1 overflow-y-auto pb-16">
        <table class="w-full">
          <!-- Header du tableau -->
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Produit</th>
              <th
                v-for="size in sizeOrder"
                :key="size"
                :class="['px-3 py-3 text-center text-sm font-semibold border-b w-16', filterSize === size ? 'bg-yellow-200 text-yellow-900' : 'text-gray-700']"
              >
                {{ size }}
              </th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b w-20">Total</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b w-20">Détail</th>
            </tr>
          </thead>

          <!-- Body du tableau -->
          <tbody>
            <template v-for="product in filteredProducts" :key="product.id">
              <!-- Ligne principale du produit -->
              <tr 
                class="bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{ 'border-b': !isProductExpanded(product.id) }"
                @click="toggleProductExpand(product.id)"
              >
                <td class="px-4 py-3 border-b">
                  <div class="font-semibold text-gray-900">{{ product.name }}</div>
                  <div class="text-xs text-gray-500">{{ getTypeLabel(product.type) }}</div>
                </td>
                <td 
                  v-for="size in sizeOrder" 
                  :key="size"
                  :class="['px-3 py-3 text-center border-b', filterSize === size ? 'bg-yellow-100' : '']"
                >
                  <span 
                    :class="['text-sm font-medium', getStockBySize(product, size) > 0 ? 'text-gray-900' : 'text-gray-300']"
                  >
                    {{ getStockBySize(product, size) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center border-b">
                  <span class="text-sm font-bold text-primary">
                    {{ getTotalStockForProduct(product) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center border-b">
                  <button 
                    @click.stop="toggleProductExpand(product.id)"
                    class="text-gray-500 hover:text-primary transition-colors"
                  >
                    <span v-if="isProductExpanded(product.id)">▲</span>
                    <span v-else>▼</span>
                  </button>
                </td>
              </tr>

              <!-- Lignes de détail par couleur (si déplié) -->
              <tr 
                v-for="color in getFilteredColorsForProduct(product)" 
                :key="color"
                v-if="isProductExpanded(product.id)"
                class="bg-gray-50 border-b border-gray-200"
              >
                <td class="pl-8 pr-4 py-2 font-medium">
                  <span 
                    class="inline-block w-3 h-3 rounded-full mr-2"
                    :style="{ backgroundColor: getColorHex(color) }"
                  ></span>
                  {{ color }}
                </td>
                <td 
                  v-for="size in sizeOrder" 
                  :key="size"
                  :class="['px-3 py-2 text-center', filterSize === size ? 'bg-yellow-100' : '']"
                >
                  <span 
                    :class="['text-xs', getStockBySizeAndColor(product, size, color) > 0 ? 'text-gray-700' : 'text-gray-300']"
                  >
                    {{ getStockBySizeAndColor(product, size, color) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-center font-semibold">
                  {{ getTotalStockByColor(product, color) }}
                </td>
                <td class="px-4 py-2"></td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Message si aucun résultat -->
        <div v-if="filteredProducts.length === 0" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-2">📦</div>
          <div class="text-lg">Aucun produit trouvé</div>
          <div class="text-sm mt-1">Essayez de modifier vos filtres</div>
        </div>
      </div>

      <!-- Footer avec totaux - toujours visible en bas -->
      <div v-if="filteredProducts.length > 0" class="bg-gray-100 border-t-2 border-gray-300 shrink-0 sticky bottom-0 z-20">
        <div class="flex items-center justify-end">
          <div class="w-48 px-4 py-3 text-right font-bold">TOTAL</div>
          <template v-for="size in sizeOrder" :key="size">
            <div :class="['w-16 px-3 py-3 text-center font-bold', filterSize === size ? 'bg-yellow-200' : '']">
              {{ getTotalStockBySize(size) }}
            </div>
          </template>
          <div class="w-20 px-4 py-3 text-center text-xl text-primary font-bold">{{ totalQuantity }}</div>
          <div class="w-20 px-4 py-3"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStockStore, type Product, type ProductType, type Size, type Color } from '@/stores/stockStore';

// ---- Store ------------------------------------------------
const stockStore = useStockStore();

// ---- Lifecycle --------------------------------------------
onMounted(async () => {
  try {
    await stockStore.fetchProducts();
  } catch (error) {
    console.error('Erreur lors du chargement des stocks', error);
  }
});

// ---- State ------------------------------------------------
const searchQuery = ref('');
const filterType = ref<ProductType | 'all'>('all');
const filterSize = ref<Size | 'all'>('all');
const filterColor = ref<Color | 'all'>('all');
const expandedProducts = ref<string[]>([]);
const selectedShop = ref('all');

// ---- Constants ------------------------------------------------
const { allTypes, allSizes, allColors, sizeOrder, getStockBySize, getStockBySizeAndColor, getColorsForProduct, getTotalStockForProduct } = stockStore;

const colorHexMap: Record<Color, string> = {
  Black: '#000000',
  Navy: '#1e3a8a',
  Olive: '#556b2f',
  Sage: '#87a878',
  Camel: '#c19a6b',
  Marron: '#8b4513',
  Beige: '#f5f5dc',
  Tartan: '#cc0000',
};

// ---- Computed ------------------------------------------------
const hasActiveFilters = computed(() => {
  return filterType.value !== 'all' || 
         filterSize.value !== 'all' || 
         filterColor.value !== 'all' ||
         searchQuery.value.trim() !== '';
});

const filteredProducts = computed(() => {
  let result = stockStore.products;

  // Filtre par recherche (nom)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query)
    );
  }

  // Filtre par type
  if (filterType.value !== 'all') {
    result = result.filter(p => p.type === filterType.value);
  }

  return result;
});

// Totaux généraux (respectent tous les filtres actifs)
const totalQuantity = computed(() => {
  return filteredProducts.value.reduce((sum, p) => sum + getTotalStockForProduct(p), 0);
});

// Totaux par taille
const getTotalStockBySize = (size: Size): number => {
  return filteredProducts.value.reduce((sum, p) => sum + getStockBySize(p, size), 0);
};

// Détermine quels produits doivent être ouverts automatiquement selon les filtres
const autoExpandedProducts = computed(() => {
  const expanded = new Set<string>();
  
  filteredProducts.value.forEach(product => {
    // Si filtre taille actif et produit a cette taille
    if (filterSize.value !== 'all') {
      if (product.variations.some(v => v.size === filterSize.value)) {
        expanded.add(product.id);
      }
    }
    
    // Si filtre couleur actif et produit a cette couleur
    if (filterColor.value !== 'all') {
      if (product.variations.some(v => v.color === filterColor.value)) {
        expanded.add(product.id);
      }
    }
  });
  
  return expanded;
});

// Combine les produits manuellement ouverts avec ceux auto-ouverts
const isProductExpanded = (productId: string) => {
  return expandedProducts.value.includes(productId) || autoExpandedProducts.value.has(productId);
};

// Filtre les couleurs à afficher selon le filtre
const getFilteredColorsForProduct = (product: Product) => {
  const colors = getColorsForProduct(product);
  if (filterColor.value === 'all') {
    return colors;
  }
  // Si filtre couleur actif, ne retourner que cette couleur si elle existe
  return colors.filter(c => c === filterColor.value);
};

// ---- Methods ------------------------------------------------
function getTypeLabel(type: ProductType): string {
  const labels: Record<ProductType, string> = {
    homme: 'Homme',
    femme: 'Femme',
    accessoires: 'Accessoires',
  };
  return labels[type];
}

function getColorHex(color: Color): string {
  return colorHexMap[color] || '#cccccc';
}

function getTotalStockByColor(product: Product, color: Color): number {
  return product.variations
    .filter(v => v.color === color)
    .reduce((sum, v) => sum + v.stock, 0);
}

function toggleProductExpand(productId: string) {
  const index = expandedProducts.value.indexOf(productId);
  if (index > -1) {
    expandedProducts.value.splice(index, 1);
  } else {
    expandedProducts.value.push(productId);
  }
}

function resetFilters() {
  searchQuery.value = '';
  filterType.value = 'all';
  filterSize.value = 'all';
  filterColor.value = 'all';
}
</script>

<style scoped>
.text-primary { color: #113e1c; }
.bg-primary { background-color: #113e1c; }
.text-secondary { color: #059669; }
.bg-secondary { background-color: #059669; }
.text-alert { color: #F59E0B; }
.bg-alert { background-color: #F59E0B; }
.bg-background { background-color: #F9FAFB; }

/* Scrollbar styling */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Table styling */
table {
  border-collapse: collapse;
}

th, td {
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:last-child td {
  border-bottom: none;
}
</style>