import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CartDrawer from '../components/CartDrawer.vue'
import { useCartStore } from '../modules/cart/stores/cart.store'
import type { StoreApiCart } from '../modules/cart/services/store-api-cart.service'

// A cart seeded directly into the store (the store is now Store-API-backed and
// async; add/update/remove are integration-verified against real WooCommerce).
const seededCart: StoreApiCart = {
  items_count: 1,
  needs_shipping: true,
  items: [
    {
      key: 'abc123',
      id: 15,
      quantity: 1,
      name: 'T-Shirt',
      permalink: 'http://testing.test/product/t-shirt/',
      prices: {
        price: '1800',
        regular_price: '1800',
        sale_price: '1800',
        currency_code: 'USD',
        currency_minor_unit: 2,
      },
      images: [{ src: 'http://testing.test/img.jpg', alt: '' }],
    },
  ],
  totals: { total_items: '1800', total_price: '1800', currency_code: 'USD', currency_minor_unit: 2 },
}

describe('CartDrawer Component', () => {
  beforeEach(() => {
    const store = useCartStore()
    store.clearCart()
    store.closeDrawer()
  })

  it('does not render drawer when closed', async () => {
    const wrapper = await mountSuspended(CartDrawer)
    expect(wrapper.find('.drawer').exists()).toBe(false)
  })

  it('renders empty state when cart is empty', async () => {
    useCartStore().openDrawer()
    const wrapper = await mountSuspended(CartDrawer)
    expect(wrapper.find('.drawer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Your cart is empty')
  })

  it('renders cart items with quantity controls and remove', async () => {
    const store = useCartStore()
    store.cart = seededCart
    store.openDrawer()

    const wrapper = await mountSuspended(CartDrawer)
    expect(wrapper.text()).toContain('T-Shirt')
    // qty controls + remove present
    expect(wrapper.findAll('.drawer__qty-btn')).toHaveLength(2)
    expect(wrapper.find('.drawer__remove').exists()).toBe(true)
  })
})
