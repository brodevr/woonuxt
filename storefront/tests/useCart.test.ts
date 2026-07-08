import { describe, it, expect, beforeEach } from 'vitest'
import { useCart } from '../composables/useCart'
import { mockProducts } from '../data/mock'

describe('useCart', () => {
  beforeEach(() => {
    // Clear cart before each test to ensure isolation
    const { clearCart } = useCart()
    clearCart()
  })

  it('should initialize with empty cart', () => {
    const { items, itemCount, subtotal } = useCart()
    expect(items.value).toEqual([])
    expect(itemCount.value).toBe(0)
    expect(subtotal.value).toBe(0)
  })

  it('should add product to cart', () => {
    const { addToCart, items, itemCount, subtotal, isDrawerOpen } = useCart()
    const product = mockProducts[0] // price is '120.00'
    
    addToCart(product)
    
    expect(items.value).toHaveLength(1)
    expect(items.value[0].product.id).toBe(product.id)
    expect(items.value[0].quantity).toBe(1)
    expect(itemCount.value).toBe(1)
    expect(subtotal.value).toBe(parseFloat(product.price))
    expect(isDrawerOpen.value).toBe(true)
  })

  it('should increment quantity when adding same product', () => {
    const { addToCart, items, itemCount } = useCart()
    const product = mockProducts[0]
    
    addToCart(product)
    addToCart(product)
    
    expect(items.value).toHaveLength(1)
    expect(items.value[0].quantity).toBe(2)
    expect(itemCount.value).toBe(2)
  })

  it('should remove product from cart', () => {
    const { addToCart, removeFromCart, items } = useCart()
    const product = mockProducts[0]
    
    addToCart(product)
    expect(items.value).toHaveLength(1)
    
    removeFromCart(product.id)
    expect(items.value).toHaveLength(0)
  })

  it('should update quantity correctly', () => {
    const { addToCart, updateQuantity, items } = useCart()
    const product = mockProducts[0]
    
    addToCart(product)
    updateQuantity(product.id, 5)
    
    expect(items.value[0].quantity).toBe(5)
  })

  it('should remove item when quantity is set to 0', () => {
    const { addToCart, updateQuantity, items } = useCart()
    const product = mockProducts[0]

    addToCart(product)
    updateQuantity(product.id, 0)

    expect(items.value).toHaveLength(0)
  })

  it('should calculate total with shipping cost per method', () => {
    const { addToCart, subtotal, total, shippingMethod } = useCart()
    const product = { ...mockProducts[0], price: '100' }

    addToCart(product, 2)
    expect(subtotal.value).toBe(200)

    shippingMethod.value = 'flat_rate'
    expect(total.value).toBe(5200) // 200 + 5000 flat rate

    shippingMethod.value = 'local_pickup'
    expect(total.value).toBe(200) // 200 + 0 pickup
  })
})
