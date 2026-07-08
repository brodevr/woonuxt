# Búsqueda — implementación y plan de motor (Typesense)

Complementa `docs/architecture.md` §11. El módulo de búsqueda del storefront
(`storefront/modules/search/`) ya está implementado **detrás de una interfaz
de proveedor** (`SearchProvider`), con un `MockSearchProvider` en memoria que
corre contra el catálogo. Este documento describe cómo enchufar **Typesense**
(el motor recomendado) sin tocar la UI.

## Estado actual (implementado)

- `modules/search/types` — contrato `SearchProvider` + `SearchParams` /
  `SearchResult` / `FacetCount`. Todo lo de arriba (store, composable, UI)
  depende **solo** de estos tipos.
- `modules/search/services/mock-search.provider.ts` — búsqueda en memoria
  (tokens, filtros categoría/precio, facetas de categoría, orden, paginación).
- `modules/search/services/search.service.ts` — **punto único de selección de
  proveedor**. Hoy devuelve el mock backed por el catálogo.
- `stores/search.store.ts` + `composables/useSearch.ts` — estado + fachada.
- UI: `components/SearchBox.vue` (header) y `pages/search.vue`.

## Cómo enchufar Typesense (drop-in)

Solo cambia **una** cosa: `search.service.ts` devuelve un
`TypesenseSearchProvider` en lugar del mock. Nada más en la app cambia.

### 1. Dependencia y config

```bash
npm i typesense
```

Variables de entorno (search-only key en el cliente; **nunca** la admin key):

```
NUXT_PUBLIC_TYPESENSE_HOST=xxx.a1.typesense.net
NUXT_PUBLIC_TYPESENSE_PORT=443
NUXT_PUBLIC_TYPESENSE_PROTOCOL=https
NUXT_PUBLIC_TYPESENSE_SEARCH_KEY=<search-only-api-key>
TYPESENSE_ADMIN_KEY=<solo en el indexer server-side>
```

### 2. Adapter (implementa el mismo `SearchProvider`)

```ts
// modules/search/services/typesense-search.provider.ts
import { Client } from 'typesense'
import type { Product } from '~/data/mock'
import type { SearchProvider, SearchParams, SearchResult } from '~/modules/search/types'

const COLLECTION = 'products'

export function createTypesenseSearchProvider(opts: {
  host: string; port: number; protocol: string; apiKey: string
}): SearchProvider {
  const client = new Client({
    nodes: [{ host: opts.host, port: opts.port, protocol: opts.protocol }],
    apiKey: opts.apiKey, // search-only key
    connectionTimeoutSeconds: 5,
  })

  return {
    async search(params: SearchParams): Promise<SearchResult> {
      const { query, filters = {}, sort = 'relevance', page = 1, perPage = 12 } = params

      const filterBy: string[] = []
      if (filters.category) filterBy.push(`categorySlug:=${filters.category}`)
      if (filters.minPrice != null) filterBy.push(`price:>=${filters.minPrice}`)
      if (filters.maxPrice != null) filterBy.push(`price:<=${filters.maxPrice}`)

      const sortBy =
        sort === 'price-asc' ? 'price:asc' : sort === 'price-desc' ? 'price:desc' : undefined

      const res = await client.collections(COLLECTION).documents().search({
        q: query || '*',
        query_by: 'name,shortDescription,description,category',
        filter_by: filterBy.join(' && ') || undefined,
        sort_by: sortBy,
        facet_by: 'category',
        page,
        per_page: perPage,
      })

      const hits = (res.hits || []).map((h) => h.document as unknown as Product)
      const categoryFacet = (res.facet_counts || []).find((f) => f.field_name === 'category')
      return {
        hits,
        total: res.found ?? hits.length,
        page,
        perPage,
        facets: {
          categories: (categoryFacet?.counts || []).map((c) => ({
            value: c.value, // ideally index a categorySlug facet for filtering
            label: c.value,
            count: c.count,
          })),
        },
      }
    },
  }
}
```

### 3. Selección del proveedor

```ts
// search.service.ts
export function createSearchService(graphqlEndpoint: string): SearchProvider {
  const cfg = useRuntimeConfig().public
  if (cfg.typesenseSearchKey) {
    return createTypesenseSearchProvider({
      host: cfg.typesenseHost, port: cfg.typensePort, protocol: cfg.typenseProtocol,
      apiKey: cfg.typesenseSearchKey,
    })
  }
  const catalog = createCatalogService(graphqlEndpoint)
  return createMockSearchProvider(() => catalog.getProducts())
}
```

Con esto, el proveedor se elige por config: mock en dev sin credenciales,
Typesense cuando están presentes. La UI, el store y el composable no cambian.

## Pipeline de indexación (WooCommerce → Typesense)

El motor es un **índice derivado**; WooCommerce es la fuente de verdad.

```
WooCommerce  ──(webhook product.updated/created/deleted, cambios de stock)──►
   Indexer (BFF Nitro /api/search/index  o  plugin WP, con admin key)
     - normaliza el producto al schema del índice
     - upsert / delete en Typesense
Typesense  ◄── bulk reindex inicial (job que recorre todo el catálogo)
```

- **Schema del documento** (mínimo para resultados + facetas): `id`, `name`,
  `slug`, `shortDescription`, `description`, `price` (float, para sort/rango),
  `salePrice`, `category`, `categorySlug` (facet + filtro), `image`,
  `stockStatus`, y campos de ranking (ventas/featured).
- **Bulk inicial**: job one-shot que pagina el catálogo de WooCommerce e indexa.
- **Incremental**: los **mismos webhooks** que revalidan la caché
  (`docs/architecture.md` §1) alimentan al indexer → índice siempre fresco.
- **Consistencia**: ante discrepancia manda WooCommerce; precio/stock definitivo
  se revalida en add-to-cart (Store API), no en el resultado de búsqueda.

## Seguridad y operación

- **Search-only key** con scope en el cliente; **admin key** solo en el indexer
  server-side.
- Rate limiting en el edge si se proxy-fica la búsqueda por el BFF.
- Reindex idempotente y monitoreado (alertar si el indexer falla o el índice se
  desincroniza — se suma a la observabilidad, `docs/architecture.md` §6).
- Métrica de **búsquedas sin resultados** ("no results") → insumo de
  merchandising y sinónimos.

## Alternativa (Algolia)

Mismo patrón: un `AlgoliaSearchProvider` que implementa `SearchProvider` con el
cliente de Algolia. Se elige igual en `search.service.ts`. La decisión
Typesense vs Algolia (costo/ops vs cero-ops) está en `docs/architecture.md` §11.
