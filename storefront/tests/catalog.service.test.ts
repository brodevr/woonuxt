import { describe, it, expect } from 'vitest'
import { createCatalogService } from '../modules/catalog/services/catalog.service'
import { mockProducts, mockCategories, mockSettings } from '../data/mock'

/**
 * Verifies the mock-fallback branch of the catalog service (no GraphQL
 * endpoint configured). The GraphQL-backed branch is exercised via
 * integration tests against a mocked client in a later phase.
 */
describe('catalogService (mock fallback, empty endpoint)', () => {
  const service = createCatalogService('')

  it('returns all mock products when no category is given', async () => {
    const products = await service.getProducts()
    expect(products).toEqual(mockProducts)
  })

  it('filters mock products by category slug', async () => {
    const products = await service.getProducts('furniture')
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((p) => p.categorySlug === 'furniture')).toBe(true)
  })

  it('returns a single mock product by slug', async () => {
    const product = await service.getProduct(mockProducts[0].slug)
    expect(product?.id).toBe(mockProducts[0].id)
  })

  it('returns null for an unknown slug', async () => {
    const product = await service.getProduct('does-not-exist')
    expect(product).toBeNull()
  })

  it('returns mock categories', async () => {
    expect(await service.getCategories()).toEqual(mockCategories)
  })

  it('returns mock settings', async () => {
    expect(await service.getSettings()).toEqual(mockSettings)
  })
})
