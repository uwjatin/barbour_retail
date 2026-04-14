<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🔧 Configuration & Test des Notifications</h1>

      <!-- Configuration Status -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Configuration Status</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span :class="['w-3 h-3 rounded-full', twilioConfigured ? 'bg-green-500' : 'bg-red-500']"></span>
            <span>Twilio: {{ twilioConfigured ? '✅ Configuré' : '❌ Non configuré' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span :class="['w-3 h-3 rounded-full', emailConfigured ? 'bg-green-500' : 'bg-red-500']"></span>
            <span>Email: {{ emailConfigured ? '✅ Configuré' : '❌ Non configuré' }}</span>
          </div>
        </div>
      </div>

      <!-- SMS Test -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">📱 Test SMS</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <input 
              v-model="testPhone"
              type="text" 
              placeholder="+33 6 12 34 56 78"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              v-model="testSmsMessage"
              rows="3"
              placeholder="Bonjour, votre réparation est prête!"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <button 
            @click="testSms"
            :disabled="sendingSms || !twilioConfigured"
            class="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ sendingSms ? 'Envoi...' : 'Envoyer SMS de test' }}
          </button>
          <div v-if="smsResult" :class="['mt-4 p-4 rounded', smsResult.success ? 'bg-green-100' : 'bg-red-100']">
            <strong>{{ smsResult.success ? '✅' : '❌' }}</strong> {{ smsResult.message }}
          </div>
        </div>
      </div>

      <!-- Email Test -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">✉️ Test Email</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email destinataire</label>
            <input 
              v-model="testEmail"
              type="email"
              placeholder="client@email.com"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
            <input 
              v-model="testEmailSubject"
              type="text"
              placeholder="Votre réparation est prête"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              v-model="testEmailMessage"
              rows="4"
              placeholder="Bonjour,\n\nVotre réparation est prête à être retirée.\n\nCordialement,\nL'équipe Style Anglais"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <button 
            @click="testEmailSend"
            :disabled="sendingEmail || !emailConfigured"
            class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ sendingEmail ? 'Envoi...' : 'Envoyer Email de test' }}
          </button>
          <div v-if="emailResult" :class="['mt-4 p-4 rounded', emailResult.success ? 'bg-green-100' : 'bg-red-100']">
            <strong>{{ emailResult.success ? '✅' : '❌' }}</strong> {{ emailResult.message }}
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">📋 Instructions de Configuration</h3>
        
        <div class="mb-6">
          <h4 class="font-semibold text-yellow-700 mb-2">1. Configurer Twilio (SMS)</h4>
          <ol class="list-decimal list-inside space-y-2 text-sm">
            <li>Créez un compte sur <a href="https://www.twilio.com" target="_blank" class="text-blue-600">twilio.com</a></li>
            <li>Obtenez votre Account SID et Auth Token depuis la console</li>
            <li>Achetez un numéro de téléphone Twilio</li>
            <li>Ajoutez ces valeurs dans le fichier .env:</li>
          </ol>
          <pre class="bg-gray-800 text-white p-3 rounded mt-2 text-sm overflow-x-auto">
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"</pre>
        </div>

        <div>
          <h4 class="font-semibold text-blue-700 mb-2">2. Configurer Email (Gmail)</h4>
          <ol class="list-decimal list-inside space-y-2 text-sm">
            <li>Activez l'authentification à 2 facteurs sur votre compte Google</li>
            <li>Générez un mot de passe d'application: <a href="https://myaccount.google.com/apppasswords" target="_blank" class="text-blue-600">Google App Passwords</a></li>
            <li>Ajoutez ces valeurs dans le fichier .env:</li>
          </ol>
          <pre class="bg-gray-800 text-white p-3 rounded mt-2 text-sm overflow-x-auto">
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASSWORD="votre-mot-de-passe-d-application"
EMAIL_FROM="votre-email@gmail.com"</pre>
        </div>

        <div class="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <strong>⚠️ Note:</strong> Les comptes gratuits Twilio envoient des SMS de test uniquement vers des numéros vérifiés. Pour envoyer à n'importe quel numéro, vous devez passer à un compte payant.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const twilioConfigured = ref(false);
const emailConfigured = ref(false);
const sendingSms = ref(false);
const sendingEmail = ref(false);
const smsResult = ref<{ success: boolean; message: string } | null>(null);
const emailResult = ref<{ success: boolean; message: string } | null>(null);

const testPhone = ref('');
const testSmsMessage = ref('Bonjour, ceci est un test SMS depuis Style Anglais.');
const testEmail = ref('');
const testEmailSubject = ref('Test Email - Style Anglais');
const testEmailMessage = ref('Bonjour,\n\nCeci est un email de test depuis Style Anglais.\n\nCordialement,\nL\'équipe');

onMounted(async () => {
  try {
    const response = await fetch('/api/config/check');
    const config = await response.json();
    twilioConfigured.value = config.twilio;
    emailConfigured.value = config.email;
  } catch (error) {
    console.error('Error checking config:', error);
  }
});

async function testSms() {
  if (!testPhone.value || !testSmsMessage.value) {
    alert('Veuillez remplir le numéro et le message');
    return;
  }

  sendingSms.value = true;
  smsResult.value = null;

  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SMS',
        recipient: testPhone.value,
        content: testSmsMessage.value,
        status: 'PENDING'
      })
    });

    const result = await response.json();
    smsResult.value = {
      success: result.success,
      message: result.success ? 'SMS envoyé avec succès!' : `Erreur: ${result.error}`
    };
  } catch (error: any) {
    smsResult.value = {
      success: false,
      message: `Erreur: ${error.message}`
    };
  } finally {
    sendingSms.value = false;
  }
}

async function testEmailSend() {
  if (!testEmail.value || !testEmailSubject.value || !testEmailMessage.value) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  sendingEmail.value = true;
  emailResult.value = null;

  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'EMAIL',
        recipient: testEmail.value,
        subject: testEmailSubject.value,
        content: testEmailMessage.value,
        status: 'PENDING'
      })
    });

    const result = await response.json();
    emailResult.value = {
      success: result.success,
      message: result.success ? 'Email envoyé avec succès!' : `Erreur: ${result.error}`
    };
  } catch (error: any) {
    emailResult.value = {
      success: false,
      message: `Erreur: ${error.message}`
    };
  } finally {
    sendingEmail.value = false;
  }
}
</script>

<style>
.text-primary { color: #113e1c; }
.bg-primary { background-color: #113e1c; }
</style>
