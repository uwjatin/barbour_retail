import { onKeyStroke } from '@vueuse/core'

/**
 * Register global keyboard shortcuts for the POS UI.
 *   F1   → focus the search / scan input
 *   F3   → trigger checkout CB (Carte Bancaire)
 *   F4   → trigger checkout Espèces
 *   Esc  → clear the cart (with confirmation)
 */
export function useKeyboardShortcuts(
  focusSearch: () => void,
  startCheckoutCB: () => void,
  startCheckoutCash: () => void,
  clearCart: () => void
) {
  // Focus search input
  onKeyStroke('F1', (e) => {
    e.preventDefault()
    focusSearch()
  })

  // Checkout CB (F3)
  onKeyStroke('F3', (e) => {
    e.preventDefault()
    startCheckoutCB()
  })

  // Checkout Espèces (F4)
  onKeyStroke('F4', (e) => {
    e.preventDefault()
    startCheckoutCash()
  })

  // Clear cart (Esc)
  onKeyStroke('Escape', (e) => {
    e.preventDefault()
    if (confirm('Vider le panier ?')) {
      clearCart()
    }
  })
}
