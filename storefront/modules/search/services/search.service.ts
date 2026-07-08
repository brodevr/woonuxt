/**
 * Search service.
 *
 * Selects the active SearchProvider. Today it wires the MockSearchProvider to
 * the catalog service; when Typesense is available, swap in a
 * TypesenseSearchProvider here (querying the engine directly with a
 * search-only key) — nothing above this layer changes. See
 * docs/architecture.md §11.
 */
import { createCatalogService } from '~/modules/catalog/services/catalog.service'
import { createMockSearchProvider } from '~/modules/search/services/mock-search.provider'
import type { SearchProvider } from '~/modules/search/types'

export function createSearchService(graphqlEndpoint: string): SearchProvider {
  const catalog = createCatalogService(graphqlEndpoint)
  // Default engine: in-memory provider backed by the full catalog.
  return createMockSearchProvider(() => catalog.getProducts())
}
