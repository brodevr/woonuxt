/**
 * MockSearchProvider — in-memory SearchProvider over the product catalog.
 *
 * Implements the same contract a Typesense/Algolia adapter will (see
 * docs/architecture.md §11), so the UI works today against mock/catalog data
 * and the real engine drops in later without UI changes. Matching is a simple
 * case-insensitive token scan (no typo-tolerance/ranking — that is the
 * engine's job); faceting/sort/pagination mirror the real API shape.
 */
import type { Product } from '~/data/mock'
import type {
  SearchProvider,
  SearchParams,
  SearchResult,
  FacetCount,
} from '~/modules/search/types'

function matchesQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true // empty query = discovery (return everything)
  const haystack = [product.name, product.shortDescription, product.description, product.category]
    .join(' ')
    .toLowerCase()
  // Every whitespace-separated token must appear somewhere.
  return q.split(/\s+/).every((token) => haystack.includes(token))
}

function inPriceRange(product: Product, min?: number, max?: number): boolean {
  const price = parseFloat(product.price)
  if (min != null && price < min) return false
  if (max != null && price > max) return false
  return true
}

function categoryFacets(products: Product[]): FacetCount[] {
  const counts = new Map<string, { value: string; count: number }>()
  for (const p of products) {
    if (!p.categorySlug) continue
    const existing = counts.get(p.categorySlug)
    if (existing) {
      existing.count++
    } else {
      counts.set(p.categorySlug, { value: p.category || p.categorySlug, count: 1 })
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}

/**
 * @param loadProducts source of the full catalog (mock or GraphQL-backed).
 */
export function createMockSearchProvider(
  loadProducts: () => Promise<Product[]>,
): SearchProvider {
  return {
    async search(params: SearchParams): Promise<SearchResult> {
      const { query, filters = {}, sort = 'relevance', page = 1, perPage = 12 } = params
      const all = await loadProducts()

      // Apply query + price first; category facet counts are computed on this
      // set (before the category filter) so users see counts per category.
      const preCategory = all.filter(
        (p) => matchesQuery(p, query) && inPriceRange(p, filters.minPrice, filters.maxPrice),
      )

      const facets = { categories: categoryFacets(preCategory) }

      let filtered = filters.category
        ? preCategory.filter((p) => p.categorySlug === filters.category)
        : preCategory

      if (sort === 'price-asc') {
        filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      } else if (sort === 'price-desc') {
        filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      }

      const total = filtered.length
      const start = (page - 1) * perPage
      const hits = filtered.slice(start, start + perPage)

      return { hits, total, page, perPage, facets }
    },
  }
}
