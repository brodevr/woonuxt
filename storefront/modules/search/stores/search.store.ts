/**
 * Search store (Pinia).
 *
 * Holds the current search query, filters, sort, pagination and last result.
 * The composable (useSearch) runs the SearchProvider and writes results here.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SearchFilters, SearchSort, SearchResult } from '~/modules/search/types'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const filters = ref<SearchFilters>({})
  const sort = ref<SearchSort>('relevance')
  const page = ref(1)
  const perPage = ref(12)
  const result = ref<SearchResult | null>(null)
  const loading = ref(false)

  function reset() {
    query.value = ''
    filters.value = {}
    sort.value = 'relevance'
    page.value = 1
    result.value = null
  }

  return { query, filters, sort, page, perPage, result, loading, reset }
})
