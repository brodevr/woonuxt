/**
 * useCart — thin composable facade over the Store API cart store.
 *
 * Surfaces server-authoritative cart state (items, count, subtotal, total) as
 * refs and delegates actions to the store. Cart operations are async and hit
 * WooCommerce via the /api/store proxy. Line-item operations take the Store API
 * line `key` (item.key), not a product id.
 */
import { storeToRefs } from 'pinia'
import { useCartStore } from '~/modules/cart/stores/cart.store'

export function useCart() {
  const store = useCartStore()
  const { items, itemCount, subtotal, total, isDrawerOpen, loading } = storeToRefs(store)

  return {
    items,
    itemCount,
    subtotal,
    total,
    isDrawerOpen,
    loading,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
    ensureLoaded: store.ensureLoaded,
    fetchCart: store.fetchCart,
  }
}
