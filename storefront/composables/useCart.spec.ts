import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCart } from './useCart'

// Mock useState so it works outside Nuxt
import { ref } from 'vue'

vi.mock('#app', () => ({
  useState: (key: string, init: () => any) => {
    return ref(init())
  }
}))

// We have to mock localStorage for the client-side check
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    clear() {
      store = {}
    }
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useCart', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes with empty cart', () => {
    const { items, itemCount, subtotal } = useCart()
    items.value = [] // Reset
    expect(items.value.length).toBe(0)
    expect(itemCount.value).toBe(0)
    expect(subtotal.value).toBe(0)
  })

  it('adds items to cart', () => {
    const { items, addToCart, itemCount } = useCart()
    items.value = [] // Reset
    
    addToCart({ id: '1', name: 'Product A', price: '10' } as any, 1)
    expect(items.value.length).toBe(1)
    expect(itemCount.value).toBe(1)
    
    // Add same product again should just increase quantity
    addToCart({ id: '1', name: 'Product A', price: '10' } as any, 2)
    expect(items.value.length).toBe(1)
    expect(itemCount.value).toBe(3)
  })

  it('calculates totals correctly with shipping', () => {
    const { items, addToCart, subtotal, total, shippingMethod } = useCart()
    items.value = [] // Reset
    
    addToCart({ id: '1', name: 'Product A', price: '100' } as any, 2)
    expect(subtotal.value).toBe(200)
    
    shippingMethod.value = 'flat_rate'
    expect(total.value).toBe(5200) // 200 + 5000
    
    shippingMethod.value = 'local_pickup'
    expect(total.value).toBe(200) // 200 + 0
  })

  it('removes items and updates quantities', () => {
    const { items, addToCart, removeFromCart, updateQuantity } = useCart()
    items.value = [] // Reset
    
    addToCart({ id: '1', name: 'Product A', price: '100' } as any, 1)
    updateQuantity('1', 5)
    expect(items.value[0].quantity).toBe(5)
    
    // Quantity 0 should remove
    updateQuantity('1', 0)
    expect(items.value.length).toBe(0)
    
    addToCart({ id: '2', name: 'Product B', price: '100' } as any, 1)
    removeFromCart('2')
    expect(items.value.length).toBe(0)
  })
})
