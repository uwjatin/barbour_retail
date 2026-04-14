<template>
  <div class="min-h-screen bg-[#F9FAFB] flex flex-col p-4">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <h1 class="text-2xl font-bold text-[#113e1c] flex items-center gap-2">
        <span role="img" aria-label="Notifications">🔔</span>
        Notifications
      </h1>
    </header>

    <!-- Grid 2 colonnes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
      <!-- Colonne 1 : En attente de validation -->
      <section class="bg-white rounded-lg shadow p-4" aria-labelledby="pending-title">
        <h2 
          id="pending-title"
          class="font-semibold mb-4 text-gray-700 flex items-center gap-2 text-base"
        >
          <span role="img" aria-hidden="true">⏳</span>
          En attente de validation
          <span 
            class="px-2 py-1 bg-[#F59E0B] text-white text-xs rounded-full"
            aria-label="{{ pendingCount }} notifications en attente"
          >
            {{ pendingCount }}
          </span>
        </h2>
        
        <div class="space-y-3" role="list" aria-label="Notifications en attente">
          <div 
            v-for="notification in pendingNotifications" 
            :key="notification.id"
            class="p-3 border rounded hover:bg-gray-50 transition-colors"
            role="listitem"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="font-medium text-sm">
                  {{ notification.type === 'SMS' ? 'SMS' : 'Email' }} 
                  {{ notification.reference ? `- ${notification.reference}` : '' }}
                </div>
                <div class="text-sm text-gray-600">{{ notification.recipient }}</div>
              </div>
              <span 
                :class="[
                  'px-2 py-1 text-xs rounded font-medium',
                  notification.type === 'SMS' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                ]"
                :aria-label="`Type: ${notification.type}`"
              >
                {{ notification.type }}
              </span>
            </div>
            
            <!-- Preview contenu -->
            <div class="text-sm bg-gray-100 p-2 rounded mb-3 text-gray-700">
              <span v-if="notification.subject" class="font-medium block mb-1">{{ notification.subject }}</span>
              "{{ notification.content.substring(0, 100) }}{{ notification.content.length > 100 ? '...' : '' }}"
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex gap-2">
              <button 
                @click="handleValidate(notification.id)"
                :disabled="isLoading"
                class="px-3 py-1.5 bg-[#10B981] text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                :aria-label="`Valider et envoyer la notification à ${notification.recipient}`"
              >
                <span v-if="isLoading && validatingId === notification.id" class="animate-spin">⏳</span>
                <span v-else>✓</span>
                Valider & Envoyer
              </button>
              <button 
                @click="handleCancel(notification.id)"
                :disabled="isLoading"
                class="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :aria-label="`Annuler la notification à ${notification.recipient}`"
              >
                ✕ Annuler
              </button>
            </div>
          </div>
          
          <!-- Message si aucune notification en attente -->
          <div 
            v-if="pendingNotifications.length === 0" 
            class="text-center py-8 text-gray-500"
          >
            <span class="text-4xl block mb-2">✓</span>
            Aucune notification en attente de validation
          </div>
        </div>
      </section>

      <!-- Colonne 2 : Historique (24h) -->
      <section class="bg-white rounded-lg shadow p-4" aria-labelledby="history-title">
        <h2 
          id="history-title"
          class="font-semibold mb-4 text-gray-700 flex items-center gap-2 text-base"
        >
          <span role="img" aria-hidden="true">📜</span>
          Historique (24h)
        </h2>
        
        <div class="space-y-2" role="list" aria-label="Historique des notifications">
          <div 
            v-for="notification in historyNotifications" 
            :key="notification.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            role="listitem"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Statut -->
              <span 
                :class="[
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm',
                  notification.status === 'SENT' ? 'bg-green-100 text-green-600' : 
                  notification.status === 'FAILED' ? 'bg-red-100 text-red-600' : 
                  'bg-gray-100 text-gray-600'
                ]"
                :aria-label="statusLabel(notification.status)"
              >
                {{ notification.status === 'SENT' ? '✓' : notification.status === 'FAILED' ? '✕' : '−' }}
              </span>
              
              <!-- Description -->
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium truncate">
                  {{ notification.type === 'SMS' ? 'SMS' : 'Email' }} 
                  {{ notification.status === 'SENT' ? 'envoyé' : notification.status === 'FAILED' ? 'échoué' : 'annulé' }}
                  {{ notification.reference ? `- ${notification.reference}` : '' }}
                </div>
                <div class="text-xs text-gray-500 truncate">{{ notification.recipient }}</div>
              </div>
            </div>
            
            <!-- Timestamp -->
            <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
              {{ getRelativeTime(notification.sentAt || notification.createdAt) }}
            </span>
          </div>
          
          <!-- Message si aucun historique -->
          <div 
            v-if="historyNotifications.length === 0" 
            class="text-center py-8 text-gray-500"
          >
            <span class="text-4xl block mb-2">📭</span>
            Aucune notification dans l'historique
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore, type Notification, type NotificationStatus } from '~/stores/notificationStore';

const store = useNotificationStore();

// ---- Lifecycle --------------------------------------------
onMounted(async () => {
  try {
    await store.fetchNotifications();
  } catch (error) {
    console.error('Erreur lors du chargement des notifications', error);
  }
});

// État local pour le chargement individuel
const validatingId = ref<string | null>(null);

// Getters
const pendingNotifications = computed(() => store.pendingNotifications);
const historyNotifications = computed(() => store.historyNotifications);
const pendingCount = computed(() => store.pendingCount);
const isLoading = computed(() => store.isLoading);

// Actions
async function handleValidate(notificationId: string) {
  validatingId.value = notificationId;
  const success = await store.validateAndSend(notificationId);
  validatingId.value = null;
  
  if (!success && store.error) {
    alert(`Erreur: ${store.error}`);
  }
}

async function handleCancel(notificationId: string) {
  if (confirm('Êtes-vous sûr de vouloir annuler cette notification ?')) {
    await store.cancelNotification(notificationId);
  }
}

function getRelativeTime(date: Date): string {
  return store.getRelativeTime(date);
}

function statusLabel(status: NotificationStatus): string {
  const labels: Record<NotificationStatus, string> = {
    PENDING: 'En attente',
    SENT: 'Envoyé',
    FAILED: 'Échoué',
    CANCELLED: 'Annulé',
  };
  return labels[status] || status;
}
</script>

<style scoped>
/* Design System Colors */
.text-primary { color: #113e1c; }
.bg-primary { background-color: #113e1c; }
.text-secondary { color: #059669; }
.bg-secondary { background-color: #059669; }
.text-alert { color: #F59E0B; }
.bg-alert { background-color: #F59E0B; }

/* Animation pour le spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
