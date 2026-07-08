/**
 * GraphQL HTTP client.
 *
 * Transport-only layer: knows how to POST a query to the WPGraphQL endpoint,
 * surface GraphQL errors, and normalize failures. It holds no domain logic —
 * services (e.g. catalog.service) sit on top and own the mapping to models.
 *
 * Uses `$fetch` (ofetch) so it works both server-side (SSR) and on the client.
 */
import { GraphQLResponseError } from '~/core/errors'

export interface GraphQLResult<T> {
  data?: T
  errors?: unknown[]
}

export interface GraphQLClient {
  /**
   * Execute a GraphQL query. Returns the `data` payload, or `null` when the
   * client is not configured (no endpoint) or the request fails — callers
   * decide how to fall back (e.g. mock data).
   */
  request<T>(query: string, variables?: Record<string, unknown>): Promise<T | null>
}

export function createGraphQLClient(endpoint: string): GraphQLClient {
  return {
    async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
      if (!endpoint) {
        return null
      }

      try {
        const response = await $fetch<GraphQLResult<T>>(endpoint, {
          method: 'POST',
          body: { query, variables },
        })

        if (response?.errors?.length) {
          throw new GraphQLResponseError('GraphQL query returned errors', response.errors)
        }

        return response?.data ?? null
      } catch (error) {
        // Preserve the current fallback contract: on failure we return null and
        // let the service decide (mock/empty). Log for observability (§6).
        console.error('[graphqlClient] request failed:', error)
        return null
      }
    },
  }
}
