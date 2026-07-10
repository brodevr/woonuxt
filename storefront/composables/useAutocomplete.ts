/**
 * useAutocomplete — instant product search for the header search box.
 *
 * Debounced, as-you-type search that queries WooGraphQL's server-side product
 * `search` through the same-origin /api/graphql proxy (no CORS). A sequence
 * guard drops out-of-order (stale) responses. When a dedicated engine
 * (Typesense) is wired, this composable is the single place to switch to it.
 */
import { ref, watch } from 'vue'
import { createGraphQLClient } from '~/core/http/graphql.client'
import { SEARCH_PRODUCTS } from '~/utils/graphql'

export interface SearchSuggestion {
  id: string
  name: string
  slug: string
  image: string
  price: string
}

const MIN_CHARS = 2
const DEBOUNCE_MS = 220
const LIMIT = 6

export function useAutocomplete() {
  const client = createGraphQLClient('/api/graphql')

  const query = ref('')
  const results = ref<SearchSuggestion[]>([])
  const loading = ref(false)
  const open = ref(false)

  let timer: ReturnType<typeof setTimeout> | undefined
  let seq = 0

  watch(query, (value) => {
    if (timer) clearTimeout(timer)
    const term = value.trim()

    if (term.length < MIN_CHARS) {
      results.value = []
      open.value = false
      loading.value = false
      return
    }

    loading.value = true
    open.value = true
    const mySeq = ++seq

    timer = setTimeout(async () => {
      const data = await client.request<{ products?: { nodes?: any[] } }>(SEARCH_PRODUCTS, {
        search: term,
        first: LIMIT,
      })
      if (mySeq !== seq) return // a newer query already fired

      results.value = (data?.products?.nodes ?? []).map((node) => ({
        id: String(node.databaseId),
        name: node.name,
        slug: node.slug,
        image: node.image?.sourceUrl ?? '',
        price: node.price ?? '',
      }))
      loading.value = false
    }, DEBOUNCE_MS)
  })

  function close() {
    open.value = false
  }

  function clear() {
    query.value = ''
    results.value = []
    open.value = false
    loading.value = false
  }

  return { query, results, loading, open, close, clear }
}
