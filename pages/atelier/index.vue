<template>
  <div class="min-h-screen bg-background flex flex-col p-4">
    <!-- Header -->
    <header class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-2xl font-bold text-primary" role="heading" aria-level="1">
        🔧 Atelier
      </h1>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
      <div class="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl" aria-hidden="true">📋</span>
          <h3 class="font-semibold text-gray-800">Nouveau Dossier</h3>
        </div>
        <button 
          @click="openCreateModal"
          class="w-full py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          + Créer une réparation
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl" aria-hidden="true">⏳</span>
          <h3 class="font-semibold text-gray-800">En Cours</h3>
        </div>
        <div class="text-3xl font-bold text-alert">{{ enCoursCount }}</div>
        <p class="text-sm text-gray-500 mt-1">réparations en cours</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl" aria-hidden="true">✅</span>
          <h3 class="font-semibold text-gray-800">Prêts à Retirer</h3>
        </div>
        <div class="text-3xl font-bold text-secondary">{{ pretARetirerCount }}</div>
        <p class="text-sm text-gray-500 mt-1">en attente de retrait</p>
      </div>
    </div>

    <!-- Liste des Dossiers -->
    <section class="flex-1 bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col min-h-0 overflow-hidden">
      <div class="flex flex-col gap-4 mb-4 shrink-0">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">📋 Liste des Dossiers</h2>
          <span class="text-sm text-gray-500">{{ filteredRepairs.length }} dossier(s)</span>
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
            v-for="repair in filteredRepairs" 
            :key="repair.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
            @click="openEditModal(repair)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900 text-lg">{{ repair.id }}</span>
                <span :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusClasses(repair.status)]">
                  {{ getStatusLabel(repair.status) }}
                </span>
                <span 
                  v-if="repair.status === 'pret_a_retirer' || repair.status === 'termine'"
                  :class="['px-2 py-0.5 rounded text-xs font-medium', repair.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']"
                >
                  {{ repair.isPaid ? '✓ Payé' : '✗ Non payé' }}
                </span>
              </div>
              <div class="font-semibold text-primary text-lg mb-1">{{ formatClientName(repair.clientName) }}</div>
              <div class="text-sm text-gray-600 truncate">{{ repair.description }}</div>
              <div v-if="repair.amount" class="text-sm text-gray-500 mt-1">
                <span class="font-medium">{{ repair.amount.toFixed(2) }}€</span>
                <span v-if="repair.estimatedDays" class="text-gray-400"> • {{ repair.estimatedDays }} jours</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2 ml-4" @click.stop>
              <select 
                v-model="repair.status"
                @change="handleStatusChange(repair)"
                class="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="devis_envoye">Devis envoyé</option>
                <option value="en_cours">En cours</option>
                <option value="pret_a_retirer">Prêt à retirer</option>
                <option value="termine">Terminé</option>
              </select>
              
              <div class="flex gap-1">
                <button @click="openNotificationModal(repair, 'sms')" class="px-2 py-1.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200">📱</button>
                <button @click="openNotificationModal(repair, 'email')" class="px-2 py-1.5 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200">✉️</button>
              </div>
              
              <button @click="openEditModal(repair)" class="px-3 py-1.5 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90">
                <span v-if="repair.status === 'pret_a_retirer' && !repair.isPaid">€</span>
                <span v-else>✏️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Création/Édition Réparation -->
    <Teleport to="body">
      <div 
        v-if="isRepairModalOpen" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="handleModalBackdropClick"
        @keydown.esc="handleModalEsc"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" ref="repairModalRef">
          <!-- Header avec sélecteur de statut et bouton X -->
          <div class="flex justify-between items-center p-6 border-b">
            <h3 class="text-2xl font-bold text-gray-900">
              {{ isEditing ? '✏️ Éditer la réparation' : '📋 Nouvelle Réparation' }}
            </h3>
            <div class="flex items-center gap-3">
              <!-- Sélecteur de statut (uniquement en mode édition) -->
              <select 
                v-if="isEditing"
                v-model="repairForm.status"
                class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="devis_envoye">Devis envoyé</option>
                <option value="en_cours">En cours</option>
                <option value="pret_a_retirer">Prêt à retirer</option>
                <option value="termine">Terminé</option>
              </select>
              
              <!-- Bouton Encaisser pour les réparations prêtes ou terminées -->
              <button 
                v-if="isEditing && (repairForm.status === 'pret_a_retirer' || repairForm.status === 'termine')"
                @click="goToCheckout"
                type="button"
                class="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 transition-colors font-medium"
              >
                💳 Encaisser
              </button>
              
              <button @click="closeRepairModal(true)" class="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">×</button>
            </div>
          </div>
          
          <form @submit.prevent="submitRepairForm" class="p-6 space-y-6">
            <!-- Civilité, Prénom, Nom -->
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Civilité *</label>
                <select v-model="repairForm.clientTitle" required class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary">
                  <option value="Mr">Mr</option>
                  <option value="Mme">Mme</option>
                  <option value="Mlle">Mlle</option>
                </select>
              </div>
              <div class="col-span-5">
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input v-model="repairForm.clientFirstName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Prénom" />
              </div>
              <div class="col-span-5">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input v-model="repairForm.clientLastName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Nom" />
              </div>
            </div>
            
            <!-- Téléphone et Email -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div class="flex">
                  <select v-model="repairForm.countryCode" class="px-2 py-2 border border-r-0 border-gray-300 rounded-l bg-gray-50 text-sm">
                    <option v-for="country in allCountries" :key="country.code" :value="country.code">
                      {{ country.flag }} {{ country.code }}
                    </option>
                  </select>
                  <input 
                    v-model="repairForm.phoneNumber" 
                    type="tel" 
                    @input="formatPhoneInput"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:ring-2 focus:ring-primary" 
                    placeholder="6 12 34 56 78"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="repairForm.clientEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="client@email.com" />
              </div>
            </div>
            
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea v-model="repairForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="Décrivez la réparation..."></textarea>
            </div>
            
            <!-- Montant et Délai -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                <input 
                  v-model="repairForm.amountDisplay" 
                  @input="formatAmountInput"
                  @blur="validateAmount"
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" 
                  placeholder="0,00"
                />
                <p class="text-xs text-gray-500 mt-1">Format: 123,45 (virgule obligatoire, max 2 décimales)</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Délai estimé (jours)</label>
                <input v-model.number="repairForm.estimatedDays" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary" placeholder="3" />
              </div>
            </div>
            
            <!-- Programme fidélité -->
            <div class="flex items-center gap-2">
              <input 
                id="loyaltyProgram" 
                v-model="repairForm.loyaltyProgram" 
                type="checkbox" 
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label for="loyaltyProgram" class="text-sm text-gray-700 cursor-pointer">
                Rejoindre le programme de fidélité
              </label>
            </div>
            
            <!-- Boutons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="closeRepairModal(true)" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Annuler</button>
              <button 
                type="button" 
                @click="submitRepairForm"
                :class="['px-4 py-2 rounded', isFormValid ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed']"
              >
                {{ isSubmitting ? 'Enregistrement...' : (isEditing ? '💾 Enregistrer' : 'Créer le dossier') }}
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
          
          <div v-if="selectedRepairForNotification" class="space-y-4">
            <div class="bg-gray-50 p-3 rounded">
              <div class="font-medium">{{ selectedRepairForNotification.id }}</div>
              <div class="text-sm text-gray-600">{{ selectedRepairForNotification.clientName }}</div>
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
              <textarea v-model="notificationMessage" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary"></textarea>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button @click="closeNotificationModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Annuler</button>
              <button @click="sendNotification" :disabled="!notificationMessage.trim() || selectedNotificationTypes.length === 0" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRepairStore, type Repair, type RepairStatus } from '@/stores/repairStore';
import { useRepairWorkflow } from '@/composables/useRepairWorkflow';
import { useNotificationStore } from '@/stores/notificationStore';

const repairStore = useRepairStore();
const workflow = useRepairWorkflow();
const notificationStore = useNotificationStore();

// State
const filterStatus = ref<RepairStatus | 'all'>('all');
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref(new Date().toISOString().split('T')[0]);
const isSubmitting = ref(false);

// Modal state
const isRepairModalOpen = ref(false);
const isEditing = ref(false);
const editingRepairId = ref<string | null>(null);
const repairModalRef = ref<HTMLElement | null>(null);

// Form state
const initialFormState = {
  clientTitle: 'Mr',
  clientFirstName: '',
  clientLastName: '',
  countryCode: '+33',
  phoneNumber: '',
  clientEmail: '',
  description: '',
  amount: 0,
  amountDisplay: '',
  estimatedDays: undefined as number | undefined,
  loyaltyProgram: false,
  status: 'devis_envoye' as RepairStatus,
};

const repairForm = ref({ ...initialFormState });
const formSnapshot = ref(''); // Stockage de l'état initial pour comparaison
const formHasChanges = ref(false);

// Notification state
const isNotificationModalOpen = ref(false);
const selectedRepairForNotification = ref<Repair | null>(null);
const selectedNotificationTypes = ref<Array<'sms' | 'email'>>([]);
const notificationMessage = ref('');
const notificationFormChanged = ref(false);

// Confirmation modal
const showConfirmModal = ref(false);
const pendingCloseAction = ref<(() => void) | null>(null);

// Filters
const filters = [
  { value: 'all', label: 'Tous', activeClass: 'bg-primary text-white' },
  { value: 'devis_envoye', label: 'Devis', activeClass: 'bg-alert text-white' },
  { value: 'en_cours', label: 'En cours', activeClass: 'bg-primary text-white' },
  { value: 'pret_a_retirer', label: 'Prêt', activeClass: 'bg-secondary text-white' },
  { value: 'termine', label: 'Terminé', activeClass: 'bg-gray-600 text-white' },
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
  { code: '+7', flag: '🇷🇺', name: 'Russie' },
  { code: '+86', flag: '🇨🇳', name: 'Chine' },
  { code: '+81', flag: '🇯🇵', name: 'Japon' },
  { code: '+82', flag: '🇰🇷', name: 'Corée du Sud' },
  { code: '+91', flag: '🇮🇳', name: 'Inde' },
  { code: '+61', flag: '🇦🇺', name: 'Australie' },
  { code: '+64', flag: '🇳🇿', name: 'Nouvelle-Zélande' },
];

// Computed
const repairs = computed(() => repairStore.repairs);
const enCoursCount = computed(() => repairStore.enCoursCount);
const pretARetirerCount = computed(() => repairStore.pretARetirerCount);

const filteredRepairs = computed(() => {
  let result = repairs.value;
  
  if (filterStatus.value !== 'all') {
    result = result.filter(r => r.status === filterStatus.value);
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r => 
      r.clientName.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  }
  
  if (startDate.value) {
    result = result.filter(r => new Date(r.createdAt) >= new Date(startDate.value));
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);
    result = result.filter(r => new Date(r.createdAt) <= end);
  }
  
  return result;
});

const isFormValid = computed(() => {
  return repairForm.value.clientFirstName.trim() !== '' && 
         repairForm.value.clientLastName.trim() !== '' &&
         repairForm.value.description.trim() !== '';
});

// Methods
function getStatusClasses(status: RepairStatus): string {
  return workflow.getStatusClasses(status);
}

function getStatusLabel(status: RepairStatus): string {
  return workflow.getStatusLabel(status);
}

function handleStatusChange(repair: Repair) {
  repairStore.updateRepairStatus(repair.id, repair.status);
  filterStatus.value = repair.status;
}

function setFilter(value: RepairStatus | 'all') {
  console.log('Setting filter to:', value);
  filterStatus.value = value;
}

// Formatage du nom client : Prénom NOM
function formatClientName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '';
  if (parts.length === 1) return fullName;
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ').toUpperCase();
  return `${firstName} ${lastName}`;
}

// Amount formatting
function formatAmountInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Remplacer le point par une virgule
  value = value.replace(/\./g, ',');
  
  // Autoriser uniquement chiffres, virgule
  value = value.replace(/[^\d,]/g, '');
  
  // Empêcher plus d'une virgule
  const parts = value.split(',');
  if (parts.length > 2) {
    value = parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Limiter à 2 décimales
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + ',' + parts[1].substring(0, 2);
  }
  
  repairForm.value.amountDisplay = value;
}

function validateAmount() {
  const value = repairForm.value.amountDisplay.replace(',', '.');
  const numValue = parseFloat(value);
  repairForm.value.amount = isNaN(numValue) ? 0 : numValue;
}

function formatPhoneInput() {
  repairForm.value.phoneNumber = repairForm.value.phoneNumber.replace(/[^\d]/g, '');
}

// Modal management
function openCreateModal() {
  isEditing.value = false;
  editingRepairId.value = null;
  repairForm.value = { ...initialFormState };
  formSnapshot.value = JSON.stringify(initialFormState);
  formHasChanges.value = false;
  isRepairModalOpen.value = true;
  setupModalListeners();
}

function openEditModal(repair: Repair) {
  isEditing.value = true;
  editingRepairId.value = repair.id;
  
  console.log('=== openEditModal called ===');
  console.log('Repair data:', {
    id: repair.id,
    clientName: repair.clientName,
    clientPhone: repair.clientPhone,
    clientEmail: repair.clientEmail,
    customer: (repair as any).customer
  });
  
  // Use customer data if available, otherwise parse from repair fields
  let clientTitle = 'Mr';
  let clientFirstName = '';
  let clientLastName = '';
  
  // Try to get from customer object (includes title, firstName, lastName)
  if ((repair as any).customer) {
    clientTitle = (repair as any).customer.title || 'Mr';
    clientFirstName = (repair as any).customer.firstName || '';
    clientLastName = (repair as any).customer.lastName || '';
    console.log('Using customer data:', { clientTitle, clientFirstName, clientLastName });
  } else {
    // Fallback: parse from clientName
    const nameParts = repair.clientName.split(' ');
    clientFirstName = nameParts[0] || '';
    clientLastName = nameParts.slice(1).join(' ') || '';
    console.log('Using fallback parsing:', { clientFirstName, clientLastName });
  }
  
  // Parse phone - handle various formats
  let countryCode = '+33';
  let phoneNumber = '';
  if (repair.clientPhone) {
    // Try to extract country code and phone number
    const phoneMatch = repair.clientPhone.match(/^(\+\d{1,4})\s?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8,10})$/);
    if (phoneMatch) {
      countryCode = phoneMatch[1];
      phoneNumber = phoneMatch[2].replace(/\s/g, '');
    } else {
      // Fallback: try to split by first space or just use as-is
      const parts = repair.clientPhone.split(' ');
      if (parts.length > 1 && parts[0].startsWith('+')) {
        countryCode = parts[0];
        phoneNumber = parts.slice(1).join('');
      } else {
        // Assume French number without country code
        countryCode = '+33';
        phoneNumber = repair.clientPhone.replace(/\s/g, '');
      }
    }
  }
  
  const formData = {
    clientTitle,
    clientFirstName,
    clientLastName,
    countryCode,
    phoneNumber,
    clientEmail: repair.clientEmail || '',
    description: repair.description,
    amount: repair.amount || 0,
    amountDisplay: repair.amount ? repair.amount.toFixed(2).replace('.', ',') : '',
    estimatedDays: repair.estimatedDays,
    loyaltyProgram: false,
    status: repair.status,
  };
  
  repairForm.value = { ...formData };
  formSnapshot.value = JSON.stringify(formData);
  formHasChanges.value = false;
  isRepairModalOpen.value = true;
  setupModalListeners();
}

function closeRepairModal(forceClose = false) {
  console.log('closeRepairModal called, forceClose:', forceClose, 'snapshot:', formSnapshot.value);
  
  // Si forceClose est true (clic sur Annuler), on ferme sans vérifier
  if (forceClose) {
    console.log('Force close - fermeture immédiate');
    isRepairModalOpen.value = false;
    cleanupModalListeners();
    formSnapshot.value = '';
    return;
  }
  
  // Sinon on vérifie s'il y a des changements
  const currentState = JSON.stringify(repairForm.value);
  const hasChanges = currentState !== formSnapshot.value && formSnapshot.value !== '';
  
  console.log('Current state:', currentState);
  console.log('Snapshot:', formSnapshot.value);
  console.log('Has changes:', hasChanges);
  
  if (hasChanges) {
    console.log('Affichage modal confirmation');
    pendingCloseAction.value = () => {
      isRepairModalOpen.value = false;
      cleanupModalListeners();
      formSnapshot.value = '';
    };
    showConfirmModal.value = true;
  } else {
    console.log('Fermeture sans confirmation');
    isRepairModalOpen.value = false;
    cleanupModalListeners();
    formSnapshot.value = '';
  }
}

function handleModalBackdropClick() {
  closeRepairModal();
}

function handleModalEsc(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeRepairModal();
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
  console.log('confirmExitWithoutSave called');
  showConfirmModal.value = false;
  formHasChanges.value = false;
  notificationFormChanged.value = false;
  formSnapshot.value = ''; // Reset snapshot
  isRepairModalOpen.value = false; // Force close
  cleanupModalListeners();
}

// Navigation vers la caisse pour encaissement
async function goToCheckout() {
  if (!editingRepairId.value) return;
  
  // Vérifier s'il y a des changements non sauvegardés
  const currentState = JSON.stringify(repairForm.value);
  const hasChanges = currentState !== formSnapshot.value && formSnapshot.value !== '';
  
  // Sauvegarder d'abord les modifications si nécessaire
  if (hasChanges) {
    const fullName = `${repairForm.value.clientFirstName} ${repairForm.value.clientLastName}`.trim();
    const fullPhone = repairForm.value.phoneNumber ? `${repairForm.value.countryCode}${repairForm.value.phoneNumber}` : '';
    
    const repairData = {
      clientName: fullName,
      clientPhone: fullPhone,
      clientEmail: repairForm.value.clientEmail,
      description: repairForm.value.description,
      status: repairForm.value.status,
      amount: repairForm.value.amount,
      estimatedDays: repairForm.value.estimatedDays,
    };
    
    repairStore.updateRepair(editingRepairId.value, repairData);
  }
  
  // Rediriger vers la caisse
  const repair = repairStore.getRepairById(editingRepairId.value);
  if (repair) {
    const url = await workflow.handleCheckoutRepair(repair);
    isRepairModalOpen.value = false;
    cleanupModalListeners();
    await navigateTo(url);
  }
}

// Form submission
async function submitRepairForm() {
  console.log('=== submitRepairForm called ===');
  console.log('isEditing:', isEditing.value);
  console.log('editingRepairId:', editingRepairId.value);
  console.log('isFormValid:', isFormValid.value);
  console.log('Form data:', {
    clientTitle: repairForm.value.clientTitle,
    clientFirstName: repairForm.value.clientFirstName,
    clientLastName: repairForm.value.clientLastName,
    countryCode: repairForm.value.countryCode,
    phoneNumber: repairForm.value.phoneNumber,
    clientEmail: repairForm.value.clientEmail,
    description: repairForm.value.description,
  });
  
  if (!isFormValid.value) {
    console.log('Form invalid - showing alert');
    alert('Veuillez remplir tous les champs obligatoires (Prénom, Nom et Description)');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const fullName = `${repairForm.value.clientFirstName} ${repairForm.value.clientLastName}`.trim();
    const fullPhone = repairForm.value.phoneNumber ? `${repairForm.value.countryCode} ${repairForm.value.phoneNumber}` : '';
    
    const repairData: any = {
      clientName: fullName,
      clientPhone: fullPhone,
      clientEmail: repairForm.value.clientEmail,
      clientTitle: repairForm.value.clientTitle,
      clientFirstName: repairForm.value.clientFirstName,
      clientLastName: repairForm.value.clientLastName,
      description: repairForm.value.description,
      status: isEditing.value ? repairForm.value.status : 'devis_envoye' as RepairStatus,
      amount: repairForm.value.amount,
      estimatedDays: repairForm.value.estimatedDays,
    };
    
    if (isEditing.value && editingRepairId.value) {
      const repair = repairStore.getRepairById(editingRepairId.value);
      console.log('Existing repair:', {
        id: repair?.id,
        clientId: repair?.clientId,
        clientName: repair?.clientName,
      });
      repairData.clientId = repair?.clientId;
      
      console.log('Sending update with data:', repairData);
      await repairStore.updateRepair(editingRepairId.value, repairData);
    } else {
      await workflow.handleCreateRepair(repairData);
    }
    
    // Reset et fermeture de la popup
    formHasChanges.value = false;
    formSnapshot.value = ''; // Reset le snapshot pour permettre la fermeture sans confirmation
    isRepairModalOpen.value = false;
    cleanupModalListeners();
    
    // Optionnel : afficher une notification de succès (à implémenter avec un toast system)
    console.log(isEditing.value ? 'Réparation mise à jour' : 'Nouvelle réparation créée');
    
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue lors de l\'enregistrement.');
  } finally {
    isSubmitting.value = false;
  }
}

// Notification methods
function openNotificationModal(repair: Repair, type: 'sms' | 'email') {
  selectedRepairForNotification.value = repair;
  selectedNotificationTypes.value = [type];
  
  const statusMessages: Record<string, string> = {
    devis_envoye: `Bonjour ${repair.clientName}, votre devis pour la réparation ${repair.id} est prêt. Montant: ${repair.amount?.toFixed(2)}€.`,
    en_cours: `Bonjour ${repair.clientName}, votre réparation ${repair.id} est en cours de traitement.`,
    pret_a_retirer: `Bonjour ${repair.clientName}, votre réparation ${repair.id} est terminée et prête à être retirée.`,
    termine: `Bonjour ${repair.clientName}, votre réparation ${repair.id} a été réglée. Merci !`,
  };
  
  notificationMessage.value = statusMessages[repair.status] || '';
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
  if (!notificationMessage.value.trim() || selectedNotificationTypes.value.length === 0 || !selectedRepairForNotification.value) return;
  
  const repair = selectedRepairForNotification.value;
  
  try {
    for (const type of selectedNotificationTypes.value) {
      let recipient = '';
      
      if (type === 'sms') {
        recipient = repair.clientPhone || '';
        if (!recipient) {
          console.warn('No phone number for SMS notification');
          continue;
        }
      } else if (type === 'email') {
        recipient = repair.clientEmail || '';
        if (!recipient) {
          console.warn('No email for email notification');
          continue;
        }
      }
      
      await notificationStore.createNotification(
        type === 'sms' ? 'SMS' : 'EMAIL',
        recipient,
        notificationMessage.value,
        undefined,
        undefined,
        repair.id,
        undefined,
        repair.clientId
      );
    }
    
    isNotificationModalOpen.value = false;
    selectedRepairForNotification.value = null;
    selectedNotificationTypes.value = [];
    notificationMessage.value = '';
    notificationFormChanged.value = false;
    
  } catch (error) {
    console.error('Error sending notification:', error);
    alert('Une erreur est survenue lors de l\'envoi de la notification.');
  }
}

// Lifecycle
onMounted(async () => {
  await repairStore.fetchRepairs();
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