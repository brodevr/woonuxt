import { describe, it, expect } from 'vitest'
import {
  adaptCart,
  adaptItem,
  minorToMajor,
  slugFromPermalink,
} from '../modules/cart/services/cart-adapter'
import type { StoreApiCart } from '../modules/cart/services/store-api-cart.service'

// Shape captured from the real WooCommerce Store API (T-Shirt, id 15, $18).
const realCart: StoreApiCart = {
  items_count: 3,
  needs_shipping: true,
  items: [
    {
      key: '9bf31c7ff062936a96d3c8bd1f8f2ff3',
      id: 15,
      quantity: 3,
      name: 'T-Shirt',
      permalink: 'http://testing.test/product/t-shirt/',
      prices: {
        price: '1800',
        regular_price: '1800',
        sale_price: '1800',
        currency_code: 'USD',
        currency_minor_unit: 2,
      },
      images: [{ src: 'http://testing.test/wp-content/uploads/2019/01/tshirt-2.jpg', alt: '' }],
    },
  ],
  totals: { total_items: '5400', total_price: '5400', currency_code: 'USD', currency_minor_unit: 2 },
}

describe('minorToMajor', () => {
  it('converts minor units to major fixed string', () => {
    expect(minorToMajor('1800', 2)).toBe('18.00')
    expect(minorToMajor('5400', 2)).toBe('54.00')
    expect(minorToMajor('200', 2)).toBe('2.00')
  })
  it('handles zero minor unit currencies', () => {
    expect(minorToMajor('1800', 0)).toBe('1800')
  })
  it('is safe on garbage input', () => {
    expect(minorToMajor('abc', 2)).toBe('0.00')
  })
})

describe('slugFromPermalink', () => {
  it('extracts the slug', () => {
    expect(slugFromPermalink('http://testing.test/product/t-shirt/')).toBe('t-shirt')
    expect(slugFromPermalink('http://testing.test/product/t-shirt')).toBe('t-shirt')
    expect(slugFromPermalink('http://testing.test/product/t-shirt/?x=1')).toBe('t-shirt')
  })
  it('returns empty string for empty input', () => {
    expect(slugFromPermalink('')).toBe('')
  })
})

describe('adaptItem', () => {
  it('maps a Store API item to the UI shape', () => {
    const ui = adaptItem(realCart.items[0])
    expect(ui).toEqual({
      key: '9bf31c7ff062936a96d3c8bd1f8f2ff3',
      quantity: 3,
      product: {
        id: '15',
        name: 'T-Shirt',
        slug: 't-shirt',
        image: 'http://testing.test/wp-content/uploads/2019/01/tshirt-2.jpg',
        price: '18.00',
      },
    })
  })
})

describe('adaptCart', () => {
  it('adapts the full cart with server-computed totals', () => {
    const a = adaptCart(realCart)
    expect(a.itemCount).toBe(3)
    expect(a.subtotal).toBe(54)
    expect(a.total).toBe(54)
    expect(a.items).toHaveLength(1)
    expect(a.items[0].product.price).toBe('18.00')
  })
  it('returns an empty adapted cart for null', () => {
    expect(adaptCart(null)).toEqual({ items: [], itemCount: 0, subtotal: 0, total: 0 })
  })
})
