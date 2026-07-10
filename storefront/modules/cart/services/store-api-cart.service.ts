/**
 * Cart service over the WooCommerce Store API.
 *
 * Typed cart operations (docs/architecture.md §2) built on the Store API
 * client. This is the server-authoritative cart that will replace the current
 * client-only localStorage cart in Phase 4 — totals, taxes, stock and shipping
 * come from WooCommerce, not the browser. The client is injected, so this is
 * unit-testable without a backend.
 */
import type { StoreApiClient } from '~/core/http/store-api.client'

/** Subset of the Store API cart item shape the storefront consumes. */
export interface StoreApiCartItem {
  key: string
  id: number
  quantity: number
  name: string
  permalink: string
  prices: {
    price: string
    regular_price: string
    sale_price: string
    currency_code: string
    currency_minor_unit: number
  }
  images?: { src: string; alt: string }[]
}

/** Subset of the Store API cart response the storefront consumes. */
export interface StoreApiCart {
  items: StoreApiCartItem[]
  items_count: number
  needs_shipping: boolean
  totals: {
    total_items: string
    total_price: string
    currency_code: string
    currency_minor_unit: number
  }
}

export interface StoreApiCartService {
  getCart(): Promise<StoreApiCart>
  addItem(id: number, quantity?: number): Promise<StoreApiCart>
  updateItem(key: string, quantity: number): Promise<StoreApiCart>
  removeItem(key: string): Promise<StoreApiCart>
}

export function createStoreApiCartService(client: StoreApiClient): StoreApiCartService {
  return {
    getCart() {
      return client.request<StoreApiCart>('/cart')
    },
    addItem(id: number, quantity = 1) {
      return client.request<StoreApiCart>('/cart/add-item', {
        method: 'POST',
        body: { id, quantity },
      })
    },
    updateItem(key: string, quantity: number) {
      return client.request<StoreApiCart>('/cart/update-item', {
        method: 'POST',
        body: { key, quantity },
      })
    },
    removeItem(key: string) {
      return client.request<StoreApiCart>('/cart/remove-item', {
        method: 'POST',
        body: { key },
      })
    },
  }
}
