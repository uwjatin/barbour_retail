<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="text-center px-4">
      <h1 class="text-4xl font-bold text-primary mb-4">🏪 Styleanglais</h1>
      <p class="text-lg text-gray-700 mb-8">Gestion de votre boutique de vêtements techniques</p>
      <button
        ref="ctaButton"
        @click="navigateToPos"
        @keydown.enter="navigateToPos"
        class="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors font-semibold text-base"
        aria-label="Accéder à la caisse enregistreuse"
      >
        Accéder à la caisse
      </button>
      <p class="mt-4 text-sm text-gray-500">Appuyez sur F1 pour sélectionner le bouton</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const ctaButton = ref<HTMLButtonElement | null>(null)

const navigateToPos = () => {
  navigateTo('/pos')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'F1') {
    event.preventDefault()
    ctaButton.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Redirection automatique vers la caisse après 2 secondes
  setTimeout(() => {
    navigateToPos()
  }, 2000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>