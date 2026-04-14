// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Compatibility date required by Nuxt 3
  compatibilityDate: '2025-07-15',
  // Enable Nuxt devtools for debugging
  devtools: { enabled: true },
  // Global CSS – Tailwind entry point
  css: ['~/assets/css/main.css'],
  // Auto‑import stores from the `stores/` directory
  imports: { dirs: ['stores'] },
  // Register Pinia module
  modules: ['@pinia/nuxt'],
  // PostCSS configuration for Tailwind CSS 3.x
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
