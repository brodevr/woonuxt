import type { CartItem, Product } from '~/data/mock'

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const isDrawerOpen = useState<boolean>('cart-drawer-open', () => false)

  // Restore cart from localStorage on client
  if (import.meta.client) {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch {
        // ignore
      }
    }

    // Watch for changes and persist
    watch(items, (val) => {
      localStorage.setItem('cart', JSON.stringify(val))
    }, { deep: true })
  }

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)
  )

  const shippingMethod = useState<string>('cart-shipping', () => 'flat_rate')
  
  const shippingCost = computed(() => {
    if (shippingMethod.value === 'flat_rate') return 5000
    if (shippingMethod.value === 'local_pickup') return 0
    return 0
  })

  const total = computed(() => subtotal.value + shippingCost.value)

  function addToCart(product: Product, quantity = 1) {
    const existing = items.value.find(item => item.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    isDrawerOpen.value = true
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter(item => item.product.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(item => item.product.id === productId)
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
    itemCount,
    subtotal,
    shippingMethod,
    shippingCost,
    total,
    isDrawerOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
  }
}
