import { mockSettings, mockProducts, mockCategories } from '~/data/mock'
import { GET_WOONUXT_SETTINGS, GET_PRODUCTS, GET_PRODUCT_BY_SLUG, GET_CATEGORIES } from '~/utils/graphql'

export function useWooNuxt() {
  const config = useRuntimeConfig()
  const graphqlUrl = config.public.graphqlUrl as string

  console.log('--- useWooNuxt initialized ---')
  console.log('graphqlUrl:', graphqlUrl)
  console.log('NUXT_PUBLIC_GRAPHQL_URL (process.env):', process.env.NUXT_PUBLIC_GRAPHQL_URL)

  // Generic GraphQL fetcher
  async function fetchGraphQL(query: string, variables = {}) {
    if (!graphqlUrl) {
      console.warn('GraphQL URL not configured. Using mock data.')
      return null
    }

    try {
      const { data, error } = await useFetch(graphqlUrl, {
        method: 'POST',
        body: {
          query,
          variables
        }
      })
      
      if (error.value) {
        console.error('GraphQL Fetch Error:', error.value)
        return null
      }
      
      return (data.value as any)?.data
    } catch (e) {
      console.error('GraphQL Error:', e)
      return null
    }
  }

  // Get Store Settings
  async function getSettings() {
    if (!graphqlUrl) return mockSettings

    const data = await fetchGraphQL(GET_WOONUXT_SETTINGS)
    return data?.woonuxtSettings || mockSettings
  }

  // Get Products
  async function getProducts(category?: string) {
    if (!graphqlUrl) {
      if (category) {
        return mockProducts.filter(p => p.categorySlug === category)
      }
      return mockProducts
    }

    const variables = category ? { category: [category] } : {}
    const data = await fetchGraphQL(GET_PRODUCTS, variables)
    
    // Transform GraphQL response to our Product interface
    if (data?.products?.nodes) {
      return data.products.nodes.map((p: any) => transformProduct(p))
    }
    
    return []
  }

  // Get Product by Slug
  async function getProduct(slug: string) {
    if (!graphqlUrl) {
      return mockProducts.find(p => p.slug === slug) || null
    }

    const data = await fetchGraphQL(GET_PRODUCT_BY_SLUG, { slug })
    if (data?.product) {
      return transformProduct(data.product)
    }
    
    return null
  }

  // Get Categories
  async function getCategories() {
    if (!graphqlUrl) return mockCategories

    const data = await fetchGraphQL(GET_CATEGORIES)
    if (data?.productCategories?.nodes) {
      return data.productCategories.nodes.map((c: any) => ({
        name: c.name,
        slug: c.slug,
        count: c.count,
        image: c.image?.sourceUrl || ''
      }))
    }
    
    return []
  }

  // Helper to transform WooCommerce GraphQL product to our frontend format
  function transformProduct(p: any) {
    // Extract raw price numbers by removing currency symbols and formatting
    const extractPrice = (priceStr: string) => {
      if (!priceStr) return '0'
      // Very basic extraction, might need refinement based on currency format
      const match = priceStr.match(/[\d,\.]+/)
      return match ? match[0].replace(/,/g, '') : '0'
    }

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
      featured: false // WooGraphQL doesn't expose featured directly by default on basic query
    }
  }

  return {
    getSettings,
    getProducts,
    getProduct,
    getCategories
  }
}
