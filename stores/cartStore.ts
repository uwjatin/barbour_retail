// stores/cartStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface CartItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  size?: string;
  color?: string;
}

export const useCartStore = defineStore("cart", () => {
  // ---- State -------------------------------------------------
  const items = ref<CartItem[]>([]);
  const isCartOpen = ref(false);

  // ---- Getters ------------------------------------------------
  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty * i.price, 0)
  );
  
  const count = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty, 0)
  );

  const itemsBySku = computed(() => {
    const grouped = new Map<string, CartItem>();
    items.value.forEach(item => {
      const key = `${item.sku}-${item.size || 'N/A'}-${item.color || 'N/A'}`;
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.qty += item.qty;
      } else {
        grouped.set(key, { ...item });
      }
    });
    return Array.from(grouped.values());
  });

  // ---- Actions ------------------------------------------------
  function addItem(sku: string, name: string, price: number, qty = 1, size?: string, color?: string) {
    const existing = items.value.find((i) => i.sku === sku && i.size === size && i.color === color);
    if (existing) {
      existing.qty += qty;
    } else {
      items.value.push({ sku, name, qty, price, size, color });
    }
  }

  function removeItem(sku: string, size?: string, color?: string) {
    const index = items.value.findIndex((i) => 
      i.sku === sku && i.size === size && i.color === color
    );
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  }

  function updateQuantity(sku: string, delta: number, size?: string, color?: string) {
    const item = items.value.find((i) => 
      i.sku === sku && i.size === size && i.color === color
    );
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        removeItem(sku, size, color);
      }
    }
  }

  function updateItemQuantity(sku: string, newQty: number, size?: string, color?: string) {
    const item = items.value.find((i) => 
      i.sku === sku && i.size === size && i.color === color
    );
    if (item) {
      if (newQty <= 0) {
        removeItem(sku, size, color);
      } else {
        item.qty = newQty;
      }
    }
  }

  function clearCart() {
    items.value = [];
  }

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value;
  }

  function openCart() {
    isCartOpen.value = true;
  }

  function closeCart() {
    isCartOpen.value = false;
  }

  return { 
    items, 
    isCartOpen,
    total, 
    count, 
    itemsBySku,
    addItem, 
    removeItem, 
    updateQuantity,
    updateItemQuantity,
    clearCart, 
    toggleCart,
    openCart,
    closeCart
  };
});
