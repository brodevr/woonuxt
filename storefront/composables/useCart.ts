/**
 * useCart — thin composable facade over the Pinia cart store.
 *
 * Preserves the exact public API previously exposed by useCart so pages,
 * components and tests are unaffected. State/getters are surfaced as refs via
 * storeToRefs; actions are delegated directly to the store.
 */
import { storeToRefs } from 'pinia'
import { useCartStore } from '~/modules/cart/stores/cart.store'

export function useCart() {
  const store = useCartStore()
  const { items, itemCount, subtotal, shippingMethod, shippingCost, total, isDrawerOpen } =
    storeToRefs(store)

  return {
    items,
    itemCount,
    subtotal,
    shippingMethod,
    shippingCost,
    total,
    isDrawerOpen,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
  }
}
