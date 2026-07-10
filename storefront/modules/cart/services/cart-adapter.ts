/**
 * Cart adapter — maps the WooCommerce Store API cart to the shape the UI
 * consumes. Pure functions, unit-tested (the network actions in the store are
 * integration-verified against a real backend).
 *
 * Store API prices/totals are integers in the currency's MINOR unit
 * (e.g. "1800" with minor_unit 2 = 18.00), so they are converted to major-unit
 * strings/numbers for display via useCurrency.
 */
import type { StoreApiCart, StoreApiCartItem } from '~/modules/cart/services/store-api-cart.service'

/** A cart line adapted for the UI. `key` is the Store API line key used for
 *  update/remove; `product` mirrors the catalog Product fields the UI reads. */
export interface UiCartItem {
  key: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    image: string
    price: string
  }
}

export interface AdaptedCart {
  items: UiCartItem[]
  itemCount: number
  subtotal: number
  total: number
}

/** Convert a minor-unit integer string to a major-unit fixed string. */
export function minorToMajor(minor: string | number, minorUnit: number): string {
  const value = Number(minor)
  if (!Number.isFinite(value)) return (0).toFixed(minorUnit)
  return (value / 10 ** minorUnit).toFixed(minorUnit)
}

/** Extract the product slug from a Store API permalink (…/product/<slug>/). */
export function slugFromPermalink(permalink: string): string {
  if (!permalink) return ''
  const clean = permalink.split('?')[0].replace(/\/+$/, '')
  const segments = clean.split('/')
  return segments[segments.length - 1] || ''
}

export function adaptItem(item: StoreApiCartItem): UiCartItem {
  const minorUnit = item.prices?.currency_minor_unit ?? 2
  return {
    key: item.key,
    quantity: item.quantity,
    product: {
      id: String(item.id),
      name: item.name,
      slug: slugFromPermalink(item.permalink),
      image: item.images?.[0]?.src ?? '',
      price: minorToMajor(item.prices?.price ?? '0', minorUnit),
    },
  }
}

export function adaptCart(cart: StoreApiCart | null): AdaptedCart {
  if (!cart) {
    return { items: [], itemCount: 0, subtotal: 0, total: 0 }
  }
  const minorUnit = cart.totals?.currency_minor_unit ?? 2
  return {
    items: (cart.items ?? []).map(adaptItem),
    itemCount: cart.items_count ?? 0,
    subtotal: Number(minorToMajor(cart.totals?.total_items ?? '0', minorUnit)),
    total: Number(minorToMajor(cart.totals?.total_price ?? '0', minorUnit)),
  }
}
