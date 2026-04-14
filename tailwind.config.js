/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#113e1c',
        secondary: '#059669',
        alert: '#F59E0B',
        error: '#EF4444',
        background: '#f9fafb',
      },
    },
  },
  plugins: [],
}
