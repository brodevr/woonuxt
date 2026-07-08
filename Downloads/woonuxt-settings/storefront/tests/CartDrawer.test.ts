import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CartDrawer from '../components/CartDrawer.vue'
import { useCart } from '../composables/useCart'
import { mockProducts } from '../data/mock'

describe('CartDrawer Component', () => {
  beforeEach(() => {
    const { clearCart, closeDrawer } = useCart()
    clearCart()
    closeDrawer()
  })

  it('does not render drawer when isDrawerOpen is false', async () => {
    const wrapper = await mountSuspended(CartDrawer)
    expect(wrapper.find('.drawer').exists()).toBe(false)
  })

  it('renders empty state when cart is empty', async () => {
    const { openDrawer } = useCart()
    openDrawer() // state is shared globally in tests

    const wrapper = await mountSuspended(CartDrawer)
    expect(wrapper.find('.drawer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Your cart is empty')
  })

  it('renders cart items and interactions', async () => {
    const { addToCart } = useCart()
    const product = mockProducts[0]
    
    // Add item (this also opens drawer)
    addToCart(product)

    const wrapper = await mountSuspended(CartDrawer)
    
    // Check item rendering
    expect(wrapper.text()).toContain(product.name)
    
    // Quantity controls are visible
    const decreaseBtn = wrapper.findAll('.drawer__qty-btn')[0]
    const increaseBtn = wrapper.findAll('.drawer__qty-btn')[1]
    expect(decreaseBtn.exists()).toBe(true)
    expect(increaseBtn.exists()).toBe(true)
    
    // Test increase quantity
    await increaseBtn.trigger('click')
    
    // Re-evaluate state 
    const { items } = useCart()
    expect(items.value[0].quantity).toBe(2)
    
    // Test remove item
    const removeBtn = wrapper.find('.drawer__remove')
    await removeBtn.trigger('click')
    expect(items.value).toHaveLength(0)
  })
})
