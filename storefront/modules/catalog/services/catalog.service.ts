/**
 * Catalog service.
 *
 * Domain layer for read-only catalog data (products, categories, store
 * settings) sourced from WPGraphQL. Owns the DTO -> domain-model mapping
 * (`mapProduct`) and the mock fallback used when no GraphQL endpoint is
 * configured. Framework-agnostic: no Vue/reactivity here, so it is testable
 * in isolation with a mocked client.
 */
import { createGraphQLClient } from '~/core/http/graphql.client'
import {
  GET_WOONUXT_SETTINGS,
  GET_PRODUCTS,
  GET_PRODUCT_BY_SLUG,
  GET_CATEGORIES,
} from '~/utils/graphql'
import { mockSettings, mockProducts, mockCategories } from '~/data/mock'
import type { Product, Category, StoreSettings } from '~/data/mock'

export interface CatalogService {
  getSettings(): Promise<StoreSettings>
  getProducts(category?: string): Promise<Product[]>
  getProduct(slug: string): Promise<Product | null>
  getCategories(): Promise<Category[]>
}

/** Extract a raw price number from a WooCommerce-formatted price string. */
function extractPrice(priceStr: string): string {
  if (!priceStr) return '0'
  const match = priceStr.match(/[\d,\.]+/)
  return match ? match[0].replace(/,/g, '') : '0'
}

/** Map a WPGraphQL product node to the frontend `Product` model. */
function mapProduct(p: any): Product {
  return {
    id: p.databaseId?.toString() || p.id,
    name: p.name,
    slug: p.slug,
    price: extractPrice(p.price),
    regularPrice: extractPrice(p.regularPrice),
    salePrice: extractPrice(p.salePrice),
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    image: p.image?.sourceUrl || '',
    gallery: p.galleryImages?.nodes?.map((img: any) => img.sourceUrl) || [],
    category: p.productCategories?.nodes?.[0]?.name || '',
    categorySlug: p.productCategories?.nodes?.[0]?.slug || '',
    inStock: p.stockStatus === 'IN_STOCK',
    featured: false,
  }
}

export function createCatalogService(endpoint: string): CatalogService {
  const client = createGraphQLClient(endpoint)
  const hasBackend = !!endpoint

  return {
    async getSettings() {
      if (!hasBackend) return mockSettings
      const data = await client.request<{ woonuxtSettings?: StoreSettings }>(GET_WOONUXT_SETTINGS)
      return data?.woonuxtSettings || mockSettings
    },

    async getProducts(category?: string) {
      if (!hasBackend) {
        return category ? mockProducts.filter((p) => p.categorySlug === category) : mockProducts
      }
      const variables = category ? { category: [category] } : {}
      const data = await client.request<{ products?: { nodes?: any[] } }>(GET_PRODUCTS, variables)
      if (data?.products?.nodes) {
        return data.products.nodes.map(mapProduct)
      }
      return []
    },

    async getProduct(slug: string) {
      if (!hasBackend) {
        return mockProducts.find((p) => p.slug === slug) || null
      }
      const data = await client.request<{ product?: any }>(GET_PRODUCT_BY_SLUG, { slug })
      if (data?.product) {
        return mapProduct(data.product)
      }
      return null
    },

    async getCategories() {
      if (!hasBackend) return mockCategories
      const data = await client.request<{ productCategories?: { nodes?: any[] } }>(GET_CATEGORIES)
      if (data?.productCategories?.nodes) {
        return data.productCategories.nodes.map((c: any) => ({
          name: c.name,
          slug: c.slug,
          count: c.count,
          image: c.image?.sourceUrl || '',
        }))
      }
      return []
    },
  }
}
