/**
 * Cart store (Pinia).
 *
 * Single source of truth for cart state. Replaces the previous `useState`
 * + manual localStorage handling in useCart. Client-side persistence lives
 * here, guarded by `import.meta.client`. Behavior matches the prior composable
 * exactly; shipping is still computed locally (a hardcoded rule) and will be
 * replaced by real Store API shipping rates in Phase 4.
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { CartItem, Product } from '~/data/mock'

const STORAGE_KEY = 'cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isDrawerOpen = ref(false)
  const shippingMethod = ref('flat_rate')

  // Restore + persist on the client only (SSR-safe).
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch {
        // ignore malformed storage
      }
    }

    watch(
      items,
      (val) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      },
      { deep: true },
    )
  }

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0),
  )

  const shippingCost = computed(() => {
    if (shippingMethod.value === 'flat_rate') return 5000
    if (shippingMethod.value === 'local_pickup') return 0
    return 0
  })

  const total = computed(() => subtotal.value + shippingCost.value)

  function addToCart(product: Product, quantity = 1) {
    const existing = items.value.find((item) => item.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    isDrawerOpen.value = true
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter((item) => item.product.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  function openDrawer() {
    isDrawerOpen.value = true
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  return {
    items,
    isDrawerOpen,
    shippingMethod,
    itemCount,
    subtotal,
    shippingCost,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
  }
})
