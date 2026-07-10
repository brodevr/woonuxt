/**
 * Cart store (Pinia) — backed by the WooCommerce Store API.
 *
 * The cart is now server-authoritative: items, prices, totals, taxes and stock
 * come from WooCommerce (docs/architecture.md §2), reached through the
 * same-origin /api/store proxy. The guest session is a Cart-Token kept in a
 * cookie. Actions are async; getters adapt the raw Store API cart to the shape
 * the UI consumes (see cart-adapter). Loaded on the client on first use.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createStoreApiClient } from '~/core/http/store-api.client'
import {
  createStoreApiCartService,
  type StoreApiCart,
} from '~/modules/cart/services/store-api-cart.service'
import { adaptCart } from '~/modules/cart/services/cart-adapter'
import type { Product } from '~/data/mock'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<StoreApiCart | null>(null)
  const isDrawerOpen = ref(false)
  const loading = ref(false)
  const initialized = ref(false)

  // Guest cart session token (no PHP cookies); refreshed from every response.
  const token = useCookie<string | null>('woonuxt_cart_token', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  const client = createStoreApiClient({
    baseUrl: '/api/store',
    getToken: () => token.value ?? null,
    setToken: (t) => {
      token.value = t
    },
  })
  const service = createStoreApiCartService(client)

  const adapted = computed(() => adaptCart(cart.value))
  const items = computed(() => adapted.value.items)
  const itemCount = computed(() => adapted.value.itemCount)
  const subtotal = computed(() => adapted.value.subtotal)
  const total = computed(() => adapted.value.total)

  async function run(op: () => Promise<StoreApiCart>) {
    loading.value = true
    try {
      cart.value = await op()
    } finally {
      loading.value = false
    }
  }

  async function fetchCart() {
    await run(() => service.getCart())
    initialized.value = true
  }

  /** Load the cart once, on the client. */
  async function ensureLoaded() {
    if (!initialized.value && import.meta.client) {
      await fetchCart()
    }
  }

  async function addToCart(product: Product, quantity = 1) {
    await run(() => service.addItem(Number(product.id), quantity))
    isDrawerOpen.value = true
  }

  async function updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      return removeFromCart(key)
    }
    await run(() => service.updateItem(key, quantity))
  }

  async function removeFromCart(key: string) {
    await run(() => service.removeItem(key))
  }

  /** Local reset (a completed Store API checkout clears the server cart). */
  function clearCart() {
    cart.value = null
  }

  function openDrawer() {
    isDrawerOpen.value = true
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  return {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isDrawerOpen,
    loading,
    initialized,
    fetchCart,
    ensureLoaded,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openDrawer,
    closeDrawer,
  }
})
