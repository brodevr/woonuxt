/**
 * Search domain types.
 *
 * Provider-agnostic contract (docs/architecture.md §11). The UI, store and
 * composables depend only on these types, so the engine behind them
 * (MockSearchProvider now, Typesense/Algolia later) can be swapped without
 * touching anything above the service layer.
 */
import type { Product } from '~/data/mock'

export type SearchSort = 'relevance' | 'price-asc' | 'price-desc' | 'name'

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
}

export interface SearchParams {
  query: string
  filters?: SearchFilters
  sort?: SearchSort
  page?: number
  perPage?: number
}

export interface FacetCount {
  value: string // slug used for filtering
  label: string // human-readable label
  count: number
}

export interface SearchResult {
  hits: Product[]
  total: number
  page: number
  perPage: number
  facets: {
    categories: FacetCount[]
  }
}

/** Contract every search engine adapter implements. */
export interface SearchProvider {
  search(params: SearchParams): Promise<SearchResult>
}
