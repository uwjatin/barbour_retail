<template>
  <div class="min-h-screen bg-background flex flex-col p-4">
    <!-- Header -->
    <header class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-2xl font-bold text-primary" role="heading" aria-level="1">
        🛒 VAD
      </h1>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
      <div class="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl" aria-hidden="true">📞</span>
          <h3 class="font-semibold text-gray-800">Nouvelle Commande</h3>
        </div>
        <button 
          @click="openCreateModal"
          class="w-full py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          + Commande téléphone
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl" aria-hidden="true">⏳</span>
          <h3 class="font-semibold text-gray-800">En Attente</h3>
        </div>
        <div class="text-3xl font-bold text-alert">{{ pendingCount }}</div>
        <p class="text-sm text-gray-500 mt-1">commandes à traiter</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl" aria-hidden="true">🚚</span>
          <h3 class="font-semibold text-gray-800">Expédiées</h3>
        </div>
        <div class="text-3xl font-bold text-secondary">{{ shippedCount }}</div>
        <p class="text-sm text-gray-500 mt-1">commandes expédiées en 24h</p>
      </div>
    </div>

    <!-- Liste des Commandes -->
    <section class="flex-1 bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col min-h-0 overflow-hidden">
      <div class="flex flex-col gap-4 mb-4 shrink-0">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">📋 Liste des Commandes</h2>
          <span class="text-sm text-gray-500">{{ filteredOrders.length }} commande(s)</span>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div class="relative w-full lg:w-64">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Rechercher un client..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="filter in filters" 
              :key="filter.value"
              @click="setFilter(filter.value)"
              :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-colors', filterStatus === filter.value ? filter.activeClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              {{ filter.label }}
            </button>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Du</span>
            <div class="relative cursor-pointer" @click="$event.target.querySelector('input')?.showPicker()">
              <input 
                v-model="startDate" 
                type="date" 
                class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                @click="$event.target.showPicker()"
              />
            </div>
            <span class="text-sm text-gray-600">au</span>
            <div class="relative cursor-pointer" @click="$event.target.querySelector('input')?.showPicker()">
              <input 
                v-model="endDate" 
                type="date" 
                class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                @click="$event.target.showPicker()"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto min-h-0" role="list">
        <div class="space-y-2 pb-4">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
            @click="openEditModal(order)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900 text-lg">{{ order.id }}</span>
                <span :class="['px-2 py-0.5 rounded text-xs font-medium', getTypeClasses(order.type)]">
                  {{ getTypeLabel(order.type) }}
                </span>
                <span :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusClasses(order.status)]">
                  {{ getStatusLabel(order.status) }}
                </span>
                <span 
                  :class="['px-2 py-0.5 rounded text-xs font-medium', getPaymentStatusClasses(order.paymentStatus)]"
                >
                  {{ getPaymentStatusLabel(order.paymentStatus) }}
                </span>
              </div>
              <div class="font-semibold text-primary text-lg mb-1">{{ order.clientFirstName }} {{ order.clientLastName?.toUpperCase() }}</div>
              <div class="text-sm text-gray-600 mb-1">
                {{ order.items.length }} article(s) - {{ order.totalAmount.toFixed(2) }}€
              </div>
              <div v-if="order.clientPhone" class="text-sm text-gray-600 mb-1">
                📞 {{ order.clientPhone }}
              </div>
              <div v-if="order.clientEmail" class="text-sm text-gray-500 mb-1">
                ✉️ {{ order.clientEmail }}
              </div>
              <div v-if="order.notes" class="text-sm text-gray-500 mt-1 truncate">📝 {{ order.notes }}</div>
            </div>
            
            <div class="flex items-center gap-2 ml-4" @click.stop>
              <select 
                v-model="order.status"
                @change="handleStatusChange(order)"
                class="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">En attente</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="cancelled">Annulée</option>
              </select>
              
              <div class="flex gap-1">
                <button 
                  @click="openNotificationModal(order, 'sms')" 
                  class="px-2 py-1.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200"
                  title="Envoyer SMS"
                >
                  📱
                </button>
                <button 
                  @click="openNotificationModal(order, 'email')" 
                  class="px-2 py-1.5 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                  title="Envoyer Email"
                >
                  ✉️
                </button>
              </div>
              
              <button 
                @click="openEditModal(order)" 
                class="px-3 py-1.5 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90"
              >
                <span v-if="order.paymentStatus === 'pending'">💳</span>
                <span v-else>✏️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Création/Édition Commande -->
    <Teleport to="body">
      <div 
        v-if="isOrderModalOpen" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="handleModalBackdropClick"
        @keydown.esc="handleModalEsc"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto" ref="orderModalRef">
          <!-- Header -->
          <div class="flex justify-between items-center p-6 border-b">
            <h3 class="text-2xl font-bold text-gray-900">
              {{ isEditing ? '✏️ Éditer la commande' : '📞 Nouvelle Commande Téléphone' }}
            </h3>
            <div class="flex items-center gap-3">
              <!-- Sélecteur de statut (uniquement en mode édition) -->
              <select 
                v-if="isEditing"
                v-model="orderForm.status"
                @change="handleStatusChangeInModal"
                class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">En attente</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="cancelled">Annulée</option>
              </select>
              <button @click="closeOrderModal(true)" class="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">×</button>
            </div>
          </div>
          
          <form @submit.prevent="submitOrderForm" class="p-6 space-y-6">
            <!-- Section Client -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-4">👤 Informations Client</h4>
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                  <select v-model="orderForm.clientTitle" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary">
                    <option value="Mr">Mr</option>
                    <option value="Mme">Mme</option>
                    <option value="Mlle">Mlle</option>
                  </select>
                </div>
                <div class="col-span-5">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input v-model="orderForm.clientFirstName" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Prénom" />
                </div>
                <div class="col-span-5">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input v-model="orderForm.clientLastName" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Nom" />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <div class="flex">
                    <select v-model="orderForm.countryCode" class="px-2 py-2 border border-r-0 border-gray-300 rounded-l bg-gray-50 text-sm">
                      <option v-for="country in allCountries" :key="country.code" :value="country.code">
                        {{ country.flag }} {{ country.code }}
                      </option>
                    </select>
                    <input 
                      v-model="orderForm.phoneNumber" 
                      type="tel" 
                      required
                      @input="formatPhoneInput"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:ring-2 focus:ring-primary" 
                      placeholder="6 12 34 56 78"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input v-model="orderForm.clientEmail" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="client@email.com" />
                </div>
              </div>
              
              <!-- Adresse de livraison -->
              <div class="mt-4">
                <h5 class="font-medium text-gray-700 mb-3">📍 Adresse de livraison</h5>
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input v-model="orderForm.shippingStreet" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Numéro et rue" />
                  </div>
                  <div class="col-span-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                    <input v-model="orderForm.shippingPostalCode" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="75000" />
                  </div>
                  <div class="col-span-8">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input v-model="orderForm.shippingCity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Paris" />
                  </div>
                </div>
              </div>
              
              <!-- Checkbox adresse de facturation différente -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="orderForm.billingDifferent" 
                    type="checkbox" 
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Adresse de facturation différente</span>
                </label>
              </div>
              
              <!-- Adresse de facturation (conditionnelle) -->
              <div v-if="orderForm.billingDifferent" class="mt-4 p-4 bg-white rounded border border-gray-200">
                <h5 class="font-medium text-gray-700 mb-3">📄 Adresse de facturation</h5>
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input v-model="orderForm.billingName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Nom" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Société (optionnel)</label>
                    <input v-model="orderForm.billingCompany" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Nom de la société" />
                  </div>
                </div>
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input v-model="orderForm.billingStreet" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Numéro et rue" />
                  </div>
                  <div class="col-span-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                    <input v-model="orderForm.billingPostalCode" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="75000" />
                  </div>
                  <div class="col-span-8">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input v-model="orderForm.billingCity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Paris" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Articles -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-4">🛍️ Articles</h4>
              
              <!-- Recherche produit -->
              <div class="relative mb-4">
                <input
                  v-model="productSearch"
                  @input="filterProductSuggestions"
                  @blur="hideProductSuggestions"
                  type="text"
                  placeholder="🔍 Rechercher un produit..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                
                <!-- Suggestions -->
                <ul
                  v-if="productSuggestions.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto z-50"
                >
                  <li
                    v-for="product in productSuggestions"
                    :key="product.sku"
                    @click="addProductToOrder(product)"
                    class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <div class="font-medium text-gray-900">{{ product.name }}</div>
                      <div class="text-sm text-gray-500">{{ product.sku }}</div>
                    </div>
                    <div class="font-semibold text-primary">{{ product.price.toFixed(2) }} €</div>
                  </li>
                </ul>
              </div>
              
              <!-- Liste des articles -->
              <div v-if="orderForm.items.length > 0" class="space-y-2">
                <div 
                  v-for="(item, index) in orderForm.items" 
                  :key="index"
                  class="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                >
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">{{ item.sku }}</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1">
                      <button 
                        @click="updateItemQuantity(index, -1)"
                        class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        −
                      </button>
                      <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
                      <button 
                        @click="updateItemQuantity(index, 1)"
                        class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        +
                      </button>
                    </div>
                    <span class="font-semibold min-w-[80px] text-right">{{ (item.price * item.quantity).toFixed(2) }} €</span>
                    <button 
                      @click="removeItem(index)"
                      class="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-400 py-8">
                <p>Aucun article dans la commande</p>
                <p class="text-sm mt-2">Recherchez des produits ci-dessus</p>
              </div>
              
              <!-- Total -->
              <div v-if="orderForm.items.length > 0" class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-gray-700">Total</span>
                  <span class="text-2xl font-bold text-primary">{{ orderTotal.toFixed(2) }} €</span>
                </div>
              </div>
            </div>

            <!-- Section Paiement (en mode édition seulement) -->
            <div v-if="isEditing" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-4">💳 Paiement</h4>
              <div class="flex gap-3">
                <button 
                  v-if="orderForm.paymentStatus === 'pending'"
                  @click="processPayment('card')"
                  type="button"
                  class="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  💳 Payer par CB
                </button>
                <button 
                  v-if="orderForm.paymentStatus === 'pending'"
                  @click="sendPaymentLink"
                  type="button"
                  class="flex-1 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                >
                  📧 Envoyer lien paiement
                </button>
                <div v-else class="flex-1 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                  ✅ Commande payée
                </div>
              </div>
            </div>
            
            <!-- Boutons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="closeOrderModal(true)" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Annuler</button>
              <button 
                type="button" 
                @click="submitOrderForm"
                :class="['px-4 py-2 rounded', isFormValid ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed']"
              >
                {{ isSubmitting ? 'Enregistrement...' : (isEditing ? '💾 Enregistrer' : 'Créer la commande') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Notification -->
    <Teleport to="body">
      <div 
        v-if="isNotificationModalOpen" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="handleNotificationBackdropClick"
        @keydown.esc="handleNotificationEsc"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-900">📨 Envoyer une notification</h3>
            <button @click="closeNotificationModal" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
          </div>
          
          <div v-if="selectedOrderForNotification" class="space-y-4">
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-medium">{{ selectedOrderForNotification.id }}</div>
              <div class="text-sm text-gray-600">{{ selectedOrderForNotification.clientName }}</div>
              <div class="text-sm text-gray-500">{{ selectedOrderForNotification.totalAmount.toFixed(2) }}€</div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Types de notification</label>
              <div class="flex gap-2">
                <button 
                  @click="toggleNotificationType('sms')"
                  :class="['flex-1 py-2 px-4 rounded border-2 transition-colors', selectedNotificationTypes.includes('sms') ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200']"
                >
                  {{ selectedNotificationTypes.includes('sms') ? '✓ ' : '' }}📱 SMS
                </button>
                <button 
                  @click="toggleNotificationType('email')"
                  :class="['flex-1 py-2 px-4 rounded border-2 transition-colors', selectedNotificationTypes.includes('email') ? 'border-blue-500 bg-blue-50' : 'border-gray-200']"
                >
                  {{ selectedNotificationTypes.includes('email') ? '✓ ' : '' }}✉️ Email
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea v-model="notificationMessage" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary"></textarea>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button @click="closeNotificationModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Annuler</button>
              <button 
                @click="sendNotification" 
                :disabled="!notificationMessage.trim() || selectedNotificationTypes.length === 0" 
                class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                📨 Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmation Sortie -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-bold text-gray-900 mb-4">⚠️ Modifications non enregistrées</h3>
          <p class="text-gray-600 mb-6">Vous avez des modifications non enregistrées. Que souhaitez-vous faire ?</p>
          <div class="flex justify-end gap-3">
            <button @click="confirmExitWithoutSave" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Quitter sans enregistrer</button>
            <button @click="showConfirmModal = false" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Continuer l'édition</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useVADStore, type Order, type OrderStatus, type OrderType, type PaymentMethod, type PaymentStatus } from '@/stores/vadStore';

const vadStore = useVADStore();

// State
const filterStatus = ref<OrderStatus | 'all'>('all');
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref(new Date().toISOString().split('T')[0]);
const isSubmitting = ref(false);

// Modal state
const isOrderModalOpen = ref(false);
const isEditing = ref(false);
const editingOrderId = ref<string | null>(null);
const orderModalRef = ref<HTMLElement | null>(null);

// Product search
const productSearch = ref('');
const productSuggestions = ref<Array<{ sku: string; name: string; price: number }>>([]);
const allProducts = ref<Array<{ sku: string; name: string; price: number }>>([]);

// Form state
const initialFormState = {
  clientTitle: 'Mr',
  clientFirstName: '',
  clientLastName: '',
  countryCode: '+33',
  phoneNumber: '',
  clientEmail: '',
  // Adresse de livraison
  shippingStreet: '',
  shippingPostalCode: '',
  shippingCity: '',
  // Adresse de facturation différente
  billingDifferent: false,
  billingName: '',
  billingCompany: '',
  billingStreet: '',
  billingPostalCode: '',
  billingCity: '',
  items: [] as Array<{ sku: string; name: string; quantity: number; price: number }>,
  notes: '',
  status: 'pending' as OrderStatus,
  paymentStatus: 'pending' as const,
  paymentMethod: undefined as PaymentMethod | undefined,
  totalAmount: 0,
};

const orderForm = ref({ ...initialFormState });
const formSnapshot = ref('');
const formHasChanges = ref(false);

// Notification state
const isNotificationModalOpen = ref(false);
const selectedOrderForNotification = ref<Order | null>(null);
const selectedNotificationTypes = ref<Array<'sms' | 'email'>>([]);
const notificationMessage = ref('');
const notificationFormChanged = ref(false);

// Confirmation modal
const showConfirmModal = ref(false);
const pendingCloseAction = ref<(() => void) | null>(null);

// Filters
const filters = [
  { value: 'all', label: 'Tous', activeClass: 'bg-primary text-white' },
  { value: 'pending', label: 'En attente', activeClass: 'bg-alert text-white' },
  { value: 'processing', label: 'En traitement', activeClass: 'bg-blue-500 text-white' },
  { value: 'shipped', label: 'Expédiée', activeClass: 'bg-secondary text-white' },
  { value: 'cancelled', label: 'Annulée', activeClass: 'bg-gray-500 text-white' },
];

// Countries
const allCountries = [
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+32', flag: '🇧🇪', name: 'Belgique' },
  { code: '+41', flag: '🇨🇭', name: 'Suisse' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+39', flag: '🇮🇹', name: 'Italie' },
  { code: '+34', flag: '🇪🇸', name: 'Espagne' },
  { code: '+49', flag: '🇩🇪', name: 'Allemagne' },
  { code: '+44', flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+1', flag: '🇺🇸', name: 'États-Unis' },
];

// Computed
const orders = computed(() => vadStore.orders);
const pendingCount = computed(() => vadStore.pendingCount);
const shippedCount = computed(() => vadStore.shippedCount);

const filteredOrders = computed(() => {
  let result = orders.value;

  // Filter by status
  if (filterStatus.value !== 'all') {
    result = result.filter(o => o.status === filterStatus.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      o.clientName.toLowerCase().includes(query) ||
      o.id.toLowerCase().includes(query) ||
      o.clientEmail?.toLowerCase().includes(query)
    );
  }
  
  // Filter by date range
  if (startDate.value) {
    result = result.filter(o => new Date(o.createdAt) >= new Date(startDate.value));
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);
    result = result.filter(o => new Date(o.createdAt) <= end);
  }
  
  return result;
});

const orderTotal = computed(() => {
  return orderForm.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const isFormValid = computed(() => {
  return orderForm.value.clientFirstName.trim() !== '' && 
         orderForm.value.clientLastName.trim() !== '' &&
         orderForm.value.clientEmail.trim() !== '' &&
         orderForm.value.phoneNumber.trim() !== '' &&
         orderForm.value.items.length > 0;
});

// Methods
function getStatusClasses(status: OrderStatus): string {
  const classes: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status];
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    cancelled: 'Annulée',
  };
  return labels[status];
}

function getTypeClasses(type: OrderType): string {
  return type === 'ecommerce' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-purple-100 text-purple-800';
}

function getTypeLabel(type: OrderType): string {
  return type === 'ecommerce' ? 'E-commerce' : 'Téléphone';
}

function getPaymentStatusClasses(status: PaymentStatus): string {
  const classes: Record<PaymentStatus, string> = {
    pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return classes[status];
}

function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Paiement en attente',
    paid: 'Payé',
    failed: 'Paiement échoué',
    refunded: 'Remboursé',
  };
  return labels[status];
}

function handleStatusChange(order: Order) {
  vadStore.updateOrderStatus(order.id, order.status);
  filterStatus.value = order.status;
}

function handleStatusChangeInModal() {
  // Met à jour le statut dans le store si on est en mode édition
  if (isEditing.value && editingOrderId.value) {
    vadStore.updateOrderStatus(editingOrderId.value, orderForm.value.status);
  }
}

function setFilter(value: OrderStatus | 'all') {
  filterStatus.value = value;
}

function formatPhoneInput() {
  orderForm.value.phoneNumber = orderForm.value.phoneNumber.replace(/[^\d]/g, '');
}

// Product search methods
function filterProductSuggestions() {
  const query = productSearch.value.trim().toLowerCase();
  if (query.length < 1) {
    productSuggestions.value = [];
    return;
  }

  productSuggestions.value = allProducts.value.filter(
    (p) =>
      p.sku.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query)
  ).slice(0, 5);
}

function hideProductSuggestions() {
  setTimeout(() => {
    productSuggestions.value = [];
  }, 200);
}

function addProductToOrder(product: { sku: string; name: string; price: number }) {
  const existingIndex = orderForm.value.items.findIndex(item => item.sku === product.sku);
  if (existingIndex > -1) {
    orderForm.value.items[existingIndex].quantity += 1;
  } else {
    orderForm.value.items.push({
      sku: product.sku,
      name: product.name,
      quantity: 1,
      price: product.price
    });
  }
  productSearch.value = '';
  productSuggestions.value = [];
}

function updateItemQuantity(index: number, delta: number) {
  const item = orderForm.value.items[index];
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      orderForm.value.items.splice(index, 1);
    }
  }
}

function removeItem(index: number) {
  orderForm.value.items.splice(index, 1);
}

// Modal management
function openCreateModal() {
  isEditing.value = false;
  editingOrderId.value = null;
  orderForm.value = { ...initialFormState };
  formSnapshot.value = JSON.stringify(initialFormState);
  formHasChanges.value = false;
  isOrderModalOpen.value = true;
  setupModalListeners();
  
  // Load products
  loadProducts();
}

function openEditModal(order: Order) {
  isEditing.value = true;
  editingOrderId.value = order.id;
  
  // Parse phone - extract country code and number properly
  let countryCode = '+33';
  let phoneNumber = '';
  if (order.clientPhone) {
    // Remove all spaces and dashes first
    const cleanPhone = order.clientPhone.replace(/[\s-]/g, '');
    
    // Try to match country codes (common European codes)
    const countryCodePatterns = [
      /^\+(\d{3})(\d+)$/,  // +33, +32, +41, etc. (3-digit country code)
      /^\+(\d{2})(\d+)$/,  // +44, +34, etc. (2-digit country code)
      /^\+(\d{4})(\d+)$/   // +351, +352, etc. (4-digit country code)
    ];
    
    let matched = false;
    
    // Try 2-digit country code first (UK, FR, ES, DE, etc.)
    let match = cleanPhone.match(/^\+(\d{2})(\d+)$/);
    if (match) {
      countryCode = '+' + match[1];
      phoneNumber = match[2].replace(/\s/g, '');
      matched = true;
    } else {
      // Try 3-digit country code (FR, BE, CH with +33, +32, +41)
      match = cleanPhone.match(/^\+(\d{3})(\d+)$/);
      if (match) {
        countryCode = '+' + match[1];
        phoneNumber = match[2].replace(/\s/g, '');
        matched = true;
      } else {
        // Try 4-digit country code
        match = cleanPhone.match(/^\+(\d{4})(\d+)$/);
        if (match) {
          countryCode = '+' + match[1];
          phoneNumber = match[2].replace(/\s/g, '');
          matched = true;
        }
      }
    }
    
    // Fallback: if no match, use +33 and the rest
    if (!matched) {
      const fallbackMatch = cleanPhone.match(/^\+(\d+)(.*)$/);
      if (fallbackMatch) {
        countryCode = '+33';
        phoneNumber = fallbackMatch[1] + fallbackMatch[2];
      }
    }
  }
  
  const formData = {
    clientTitle: order.clientTitle || 'Mr',
    clientFirstName: order.clientFirstName || '',
    clientLastName: order.clientLastName || '',
    countryCode,
    phoneNumber,
    clientEmail: order.clientEmail || '',
    // Adresse livraison
    shippingStreet: order.shippingStreet || '',
    shippingPostalCode: order.shippingPostalCode || '',
    shippingCity: order.shippingCity || '',
    // Adresse facturation
    billingDifferent: order.billingDifferent || false,
    billingName: order.billingName || '',
    billingCompany: order.billingCompany || '',
    billingStreet: order.billingStreet || '',
    billingPostalCode: order.billingPostalCode || '',
    billingCity: order.billingCity || '',
    items: order.items.map((item: any) => ({
      sku: item.sku,
      name: item.productName || item.name,
      quantity: item.quantity,
      price: parseFloat(item.unitPrice || item.price || 0),
      size: item.size,
      color: item.color
    })),
    notes: order.notes || '',
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: parseFloat(order.totalAmount),
  };
  
  orderForm.value = { ...formData };
  formSnapshot.value = JSON.stringify(formData);
  formHasChanges.value = false;
  isOrderModalOpen.value = true;
  setupModalListeners();
  
  // Load products
  loadProducts();
}

async function loadProducts() {
  try {
    const response = await $fetch<{ success: boolean; data: typeof allProducts.value }>('/api/products');
    // Map basePrice to price for UI compatibility
    allProducts.value = response.data.map((p: any) => ({
      sku: p.sku,
      name: p.name,
      price: parseFloat(p.basePrice),
      variations: p.variations,
      category: p.category
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des produits', error);
  }
}

function closeOrderModal(forceClose = false) {
  if (forceClose) {
    isOrderModalOpen.value = false;
    cleanupModalListeners();
    formSnapshot.value = '';
    return;
  }
  
  const currentState = JSON.stringify(orderForm.value);
  const hasChanges = currentState !== formSnapshot.value && formSnapshot.value !== '';
  
  if (hasChanges) {
    pendingCloseAction.value = () => {
      isOrderModalOpen.value = false;
      cleanupModalListeners();
      formSnapshot.value = '';
    };
    showConfirmModal.value = true;
  } else {
    isOrderModalOpen.value = false;
    cleanupModalListeners();
    formSnapshot.value = '';
  }
}

function handleModalBackdropClick() {
  closeOrderModal();
}

function handleModalEsc(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeOrderModal();
  }
}

function setupModalListeners() {
  nextTick(() => {
    document.addEventListener('keydown', handleModalEsc);
  });
}

function cleanupModalListeners() {
  document.removeEventListener('keydown', handleModalEsc);
}

function confirmExitWithoutSave() {
  showConfirmModal.value = false;
  formHasChanges.value = false;
  notificationFormChanged.value = false;
  formSnapshot.value = '';
  isOrderModalOpen.value = false;
  cleanupModalListeners();
}

// Payment methods
function processPayment(method: 'card' | 'cash') {
  if (!editingOrderId.value) return;
  
  // Sauvegarder d'abord
  const fullName = `${orderForm.value.clientFirstName} ${orderForm.value.clientLastName}`.trim();
  const fullPhone = orderForm.value.phoneNumber ? `${orderForm.value.countryCode}${orderForm.value.phoneNumber}` : '';
  
  const orderData = {
    clientName: fullName,
    clientFirstName: orderForm.value.clientFirstName,
    clientLastName: orderForm.value.clientLastName,
    clientPhone: fullPhone,
    clientEmail: orderForm.value.clientEmail,
    // Adresse livraison
    shippingStreet: orderForm.value.shippingStreet,
    shippingPostalCode: orderForm.value.shippingPostalCode,
    shippingCity: orderForm.value.shippingCity,
    // Adresse facturation
    billingDifferent: orderForm.value.billingDifferent,
    billingName: orderForm.value.billingName,
    billingCompany: orderForm.value.billingCompany,
    billingStreet: orderForm.value.billingStreet,
    billingPostalCode: orderForm.value.billingPostalCode,
    billingCity: orderForm.value.billingCity,
    items: orderForm.value.items,
    notes: orderForm.value.notes,
    status: orderForm.value.status,
    totalAmount: orderTotal.value,
  };

  vadStore.updateOrder(editingOrderId.value, orderData);
  vadStore.updatePaymentStatus(editingOrderId.value, 'paid', method);
  
  alert(`Paiement ${method === 'card' ? 'par carte bancaire' : 'en espèces'} enregistré !`);
  closeOrderModal(true);
}

function sendPaymentLink() {
  if (!editingOrderId.value) return;
  
  const order = vadStore.getOrderById(editingOrderId.value);
  if (order && order.clientEmail) {
    // Simuler l'envoi d'un email
    alert(`📧 Lien de paiement envoyé à ${order.clientEmail}`);
    
    // Mettre à jour la méthode de paiement
    vadStore.updatePaymentStatus(editingOrderId.value, 'pending', 'pending_link');
  }
}

// Form submission
async function submitOrderForm() {
  if (!isFormValid.value) {
    alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un article');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const fullName = `${orderForm.value.clientFirstName} ${orderForm.value.clientLastName}`.trim();
    const fullPhone = orderForm.value.phoneNumber ? `${orderForm.value.countryCode}${orderForm.value.phoneNumber}` : '';
    
    // Format items to match database schema
    const formattedItems = orderForm.value.items.map(item => ({
      productName: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
      size: item.size || 'M',
      color: item.color || 'Black'
    }));
    
    const orderData = {
      type: 'phone' as OrderType,
      clientName: fullName,
      clientTitle: orderForm.value.clientTitle,
      clientFirstName: orderForm.value.clientFirstName,
      clientLastName: orderForm.value.clientLastName,
      clientPhone: fullPhone,
      clientEmail: orderForm.value.clientEmail,
      shippingStreet: orderForm.value.shippingStreet,
      shippingPostalCode: orderForm.value.shippingPostalCode,
      shippingCity: orderForm.value.shippingCity,
      billingDifferent: orderForm.value.billingDifferent || false,
      billingName: orderForm.value.billingName,
      billingCompany: orderForm.value.billingCompany,
      billingStreet: orderForm.value.billingStreet,
      billingPostalCode: orderForm.value.billingPostalCode,
      billingCity: orderForm.value.billingCity,
      items: formattedItems,
      status: orderForm.value.status,
      paymentStatus: orderForm.value.paymentStatus,
      paymentMethod: orderForm.value.paymentMethod,
      totalAmount: orderTotal.value,
      notes: orderForm.value.notes,
    };
    
    console.log('[VAD Page] Submitting order data:', JSON.stringify(orderData, null, 2));
    
    if (isEditing.value && editingOrderId.value) {
      console.log(`[VAD Page] Updating order ${editingOrderId.value}`);
      await vadStore.updateOrder(editingOrderId.value, orderData);
    } else {
      console.log('[VAD Page] Creating new order');
      await vadStore.createOrder(orderData);
    }
    
    console.log('[VAD Page] Order submitted successfully');
    formHasChanges.value = false;
    formSnapshot.value = '';
    isOrderModalOpen.value = false;
    cleanupModalListeners();
    
  } catch (error) {
    console.error('[VAD Page] Error submitting order:', error);
    const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'enregistrement.';
    alert(errorMsg);
  } finally {
    isSubmitting.value = false;
  }
}

// Notification methods
function openNotificationModal(order: Order, type: 'sms' | 'email') {
  selectedOrderForNotification.value = order;
  selectedNotificationTypes.value = [type];
  
  const statusMessages: Record<string, string> = {
    pending: `Bonjour ${order.clientName}, votre commande ${order.id} est en attente de traitement. Montant: ${order.totalAmount.toFixed(2)}€.`,
    processing: `Bonjour ${order.clientName}, votre commande ${order.id} est en cours de préparation.`,
    shipped: `Bonjour ${order.clientName}, votre commande ${order.id} a été expédiée.`,
    cancelled: `Bonjour ${order.clientName}, votre commande ${order.id} a été annulée.`,
  };
  
  notificationMessage.value = statusMessages[order.status] || '';
  notificationFormChanged.value = false;
  isNotificationModalOpen.value = true;
}

function closeNotificationModal() {
  if (notificationFormChanged.value) {
    pendingCloseAction.value = () => {
      isNotificationModalOpen.value = false;
    };
    showConfirmModal.value = true;
  } else {
    isNotificationModalOpen.value = false;
  }
}

function handleNotificationBackdropClick() {
  closeNotificationModal();
}

function handleNotificationEsc(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeNotificationModal();
  }
}

function toggleNotificationType(type: 'sms' | 'email') {
  const index = selectedNotificationTypes.value.indexOf(type);
  if (index > -1) {
    selectedNotificationTypes.value.splice(index, 1);
  } else {
    selectedNotificationTypes.value.push(type);
  }
  notificationFormChanged.value = true;
}

async function sendNotification() {
  if (!notificationMessage.value.trim() || selectedNotificationTypes.value.length === 0) return;
  
  if (!selectedOrderForNotification.value) return;
  
  const order = selectedOrderForNotification.value;
  const successTypes: string[] = [];
  const failedTypes: string[] = [];
  
  for (const type of selectedNotificationTypes.value) {
    try {
      await vadStore.sendNotification(
        order.id,
        type === 'sms' ? 'SMS' : 'EMAIL',
        notificationMessage.value,
        type === 'email' ? 'Notification VAD' : undefined
      );
      successTypes.push(type === 'sms' ? 'SMS' : 'Email');
    } catch (err) {
      console.error(`Failed to send ${type}:`, err);
      failedTypes.push(type === 'sms' ? 'SMS' : 'Email');
    }
  }
  
  if (successTypes.length > 0) {
    const successStr = successTypes.join(', ');
    alert(`Notification ${successStr} envoyée avec succès !`);
  }
  
  if (failedTypes.length > 0) {
    const failStr = failedTypes.join(', ');
    alert(`Échec de l'envoi de: ${failStr}`);
  }
  
  notificationFormChanged.value = false;
  isNotificationModalOpen.value = false;
  notificationMessage.value = '';
  selectedNotificationTypes.value = [];
}

// Lifecycle
onMounted(async () => {
  // Load products
  try {
    const response = await $fetch<{ success: boolean; data: typeof allProducts.value }>('/api/products');
    allProducts.value = response.data.map((p: any) => ({
      sku: p.sku,
      name: p.name,
      price: parseFloat(p.basePrice),
      variations: p.variations,
      category: p.category
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des produits', error);
  }
  
  // Load orders
  await vadStore.fetchOrders();
});

onUnmounted(() => {
  cleanupModalListeners();
});
</script>

<style scoped>
.text-primary { color: #113e1c; }
.bg-primary { background-color: #113e1c; }
.text-secondary { color: #059669; }
.bg-secondary { background-color: #059669; }
.text-alert { color: #F59E0B; }
.bg-alert { background-color: #F59E0B; }
.bg-background { background-color: #F9FAFB; }

button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
  outline: 2px solid #113e1c;
  outline-offset: 2px;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>