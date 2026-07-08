/**
 * useWooNuxt — thin composable facade over the catalog service.
 *
 * Reads the runtime GraphQL endpoint and delegates to `catalogService`.
 * All data-fetching and mapping logic lives in the service layer
 * (`modules/catalog/services/catalog.service.ts`); this composable only wires
 * runtime config into it and exposes a stable API to pages/components.
 */
import { createCatalogService } from '~/modules/catalog/services/catalog.service'

export function useWooNuxt() {
  const config = useRuntimeConfig()
  const graphqlUrl = config.public.graphqlUrl as string

  const service = createCatalogService(graphqlUrl)

  return {
    getSettings: () => service.getSettings(),
    getProducts: (category?: string) => service.getProducts(category),
    getProduct: (slug: string) => service.getProduct(slug),
    getCategories: () => service.getCategories(),
  }
}
