/**
 * WooCommerce Store API HTTP client.
 *
 * Transport for `/wc/store/v1/*` (cart + checkout). Owns cart-session handling:
 * it sends the persisted `Cart-Token` header and captures the refreshed token
 * from every response so the guest cart survives across requests without PHP
 * cookies (docs/architecture.md §2). Domain logic (cart operations) lives in
 * services on top of this. See docs/mercadopago-headless-checkout.md for the
 * checkout flow that rides on this client.
 */
import { StoreApiError } from '~/core/errors'

/** Minimal shape of a raw fetch response (ofetch's $fetch.raw / undici). */
export interface RawResponse {
  _data: unknown
  status: number
  headers: { get(name: string): string | null }
}

export type RawFetch = (url: string, options: Record<string, unknown>) => Promise<RawResponse>

export interface StoreApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, unknown>
}

export interface StoreApiClient {
  request<T>(path: string, options?: StoreApiRequestOptions): Promise<T>
}

export interface StoreApiClientConfig {
  /** Base URL, e.g. https://wp.example.com/wp-json/wc/store/v1 */
  baseUrl: string
  /** Read the persisted Cart-Token (null if none yet). */
  getToken: () => string | null
  /** Persist a refreshed Cart-Token. */
  setToken: (token: string) => void
  /** Injectable raw fetch (defaults to $fetch.raw); overridden in tests. */
  rawFetch?: RawFetch
}

const CART_TOKEN_HEADER = 'Cart-Token'

export function createStoreApiClient(config: StoreApiClientConfig): StoreApiClient {
  const rawFetch: RawFetch =
    config.rawFetch ?? ((globalThis as any).$fetch?.raw as RawFetch)

  return {
    async request<T>(path: string, options: StoreApiRequestOptions = {}): Promise<T> {
      const headers: Record<string, string> = {}
      const token = config.getToken()
      if (token) {
        headers[CART_TOKEN_HEADER] = token
      }

      let response: RawResponse
      try {
        response = await rawFetch(`${config.baseUrl}${path}`, {
          method: options.method ?? 'GET',
          body: options.body,
          query: options.query,
          headers,
        })
      } catch (error) {
        const status = (error as { status?: number; response?: { status?: number } })?.status
          ?? (error as { response?: { status?: number } })?.response?.status
        const code = (error as { data?: { code?: string } })?.data?.code
        throw new StoreApiError('Store API request failed', status, { cause: error, code })
      }

      // Capture the refreshed cart session token, if present.
      const nextToken = response.headers.get(CART_TOKEN_HEADER)
      if (nextToken) {
        config.setToken(nextToken)
      }

      return response._data as T
    },
  }
}
