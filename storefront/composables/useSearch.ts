/**
 * useSearch — composable facade over the search store + service.
 *
 * Exposes reactive search state and a `search()` action that runs the active
 * SearchProvider (mock today, Typesense later) and writes the result to the
 * store. Works both for SSR (call search() inside useAsyncData) and for
 * interactive updates from the header/search page.
 */
import { storeToRefs } from 'pinia'
import { useSearchStore } from '~/modules/search/stores/search.store'
import { createSearchService } from '~/modules/search/services/search.service'
import type { SearchParams } from '~/modules/search/types'

export function useSearch() {
  const config = useRuntimeConfig()
  const service = createSearchService(config.public.graphqlUrl as string)
  const store = useSearchStore()
  const { query, filters, sort, page, perPage, result, loading } = storeToRefs(store)

  async function search(overrides: Partial<SearchParams> = {}) {
    loading.value = true
    try {
      const res = await service.search({
        query: overrides.query ?? query.value,
        filters: overrides.filters ?? filters.value,
        sort: overrides.sort ?? sort.value,
        page: overrides.page ?? page.value,
        perPage: overrides.perPage ?? perPage.value,
      })
      result.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  return {
    query,
    filters,
    sort,
    page,
    perPage,
    result,
    loading,
    search,
    reset: store.reset,
  }
}
