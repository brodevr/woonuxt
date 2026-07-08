import { describe, it, expect } from 'vitest'
import { createMockSearchProvider } from '../modules/search/services/mock-search.provider'
import type { Product } from '../data/mock'

function product(over: Partial<Product>): Product {
  return {
    id: '0',
    name: 'Item',
    slug: 'item',
    price: '10',
    description: '',
    shortDescription: '',
    image: '',
    gallery: [],
    category: 'Cat',
    categorySlug: 'cat',
    inStock: true,
    featured: false,
    ...over,
  }
}

const catalog: Product[] = [
  product({ id: '1', name: 'Nordic Chair', price: '100', category: 'Furniture', categorySlug: 'furniture' }),
  product({ id: '2', name: 'Table Lamp', price: '50', category: 'Lighting', categorySlug: 'lighting' }),
  product({ id: '3', name: 'Floor Lamp', price: '200', category: 'Lighting', categorySlug: 'lighting' }),
  product({ id: '4', name: 'Oak Table', price: '300', category: 'Furniture', categorySlug: 'furniture', shortDescription: 'lamp-lit desk' }),
]

const provider = createMockSearchProvider(async () => catalog)

describe('MockSearchProvider', () => {
  it('returns everything for an empty query (discovery)', async () => {
    const res = await provider.search({ query: '' })
    expect(res.total).toBe(4)
    expect(res.hits).toHaveLength(4)
  })

  it('matches by name token, case-insensitive', async () => {
    const res = await provider.search({ query: 'lamp' })
    // "Table Lamp", "Floor Lamp", and "Oak Table" (shortDescription has "lamp-lit")
    expect(res.total).toBe(3)
    expect(res.hits.map((h) => h.id).sort()).toEqual(['2', '3', '4'])
  })

  it('filters by category', async () => {
    const res = await provider.search({ query: '', filters: { category: 'lighting' } })
    expect(res.hits.map((h) => h.id).sort()).toEqual(['2', '3'])
  })

  it('filters by price range', async () => {
    const res = await provider.search({ query: '', filters: { minPrice: 100, maxPrice: 250 } })
    expect(res.hits.map((h) => h.id).sort()).toEqual(['1', '3'])
  })

  it('computes category facet counts before the category filter', async () => {
    const res = await provider.search({ query: '', filters: { category: 'lighting' } })
    const counts = Object.fromEntries(res.facets.categories.map((f) => [f.label, f.count]))
    expect(counts).toEqual({ Furniture: 2, Lighting: 2 })
    // facet.value is the slug used for filtering
    expect(res.facets.categories.map((f) => f.value).sort()).toEqual(['furniture', 'lighting'])
  })

  it('sorts by price ascending and descending', async () => {
    const asc = await provider.search({ query: '', sort: 'price-asc' })
    expect(asc.hits.map((h) => h.price)).toEqual(['50', '100', '200', '300'])
    const desc = await provider.search({ query: '', sort: 'price-desc' })
    expect(desc.hits.map((h) => h.price)).toEqual(['300', '200', '100', '50'])
  })

  it('paginates', async () => {
    const p1 = await provider.search({ query: '', sort: 'price-asc', page: 1, perPage: 2 })
    expect(p1.hits.map((h) => h.price)).toEqual(['50', '100'])
    expect(p1.total).toBe(4)
    const p2 = await provider.search({ query: '', sort: 'price-asc', page: 2, perPage: 2 })
    expect(p2.hits.map((h) => h.price)).toEqual(['200', '300'])
  })
})
