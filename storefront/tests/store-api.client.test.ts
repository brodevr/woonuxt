import { describe, it, expect } from 'vitest'
import { createStoreApiClient, type RawResponse } from '../core/http/store-api.client'
import { StoreApiError } from '../core/errors'

const BASE = 'https://wp.example.com/wp-json/wc/store/v1'

function headerStub(values: Record<string, string>) {
  return { get: (name: string) => values[name] ?? null }
}

describe('storeApiClient', () => {
  it('captures the Cart-Token from the response and persists it', async () => {
    let stored: string | null = null
    const client = createStoreApiClient({
      baseUrl: BASE,
      getToken: () => stored,
      setToken: (t) => {
        stored = t
      },
      rawFetch: async (): Promise<RawResponse> => ({
        _data: { items: [] },
        status: 200,
        headers: headerStub({ 'Cart-Token': 'token-abc' }),
      }),
    })

    await client.request('/cart')
    expect(stored).toBe('token-abc')
  })

  it('sends the stored Cart-Token on subsequent requests', async () => {
    let capturedHeaders: Record<string, string> = {}
    const client = createStoreApiClient({
      baseUrl: BASE,
      getToken: () => 'token-xyz',
      setToken: () => {},
      rawFetch: async (_url, options): Promise<RawResponse> => {
        capturedHeaders = options.headers as Record<string, string>
        return { _data: {}, status: 200, headers: headerStub({}) }
      },
    })

    await client.request('/cart')
    expect(capturedHeaders['Cart-Token']).toBe('token-xyz')
  })

  it('builds the URL and forwards method/body', async () => {
    let calledUrl = ''
    let calledOptions: Record<string, unknown> = {}
    const client = createStoreApiClient({
      baseUrl: BASE,
      getToken: () => null,
      setToken: () => {},
      rawFetch: async (url, options): Promise<RawResponse> => {
        calledUrl = url
        calledOptions = options
        return { _data: {}, status: 200, headers: headerStub({}) }
      },
    })

    await client.request('/cart/add-item', { method: 'POST', body: { id: 5, quantity: 2 } })
    expect(calledUrl).toBe(`${BASE}/cart/add-item`)
    expect(calledOptions.method).toBe('POST')
    expect(calledOptions.body).toEqual({ id: 5, quantity: 2 })
  })

  it('normalizes failures to StoreApiError with status and code', async () => {
    const client = createStoreApiClient({
      baseUrl: BASE,
      getToken: () => null,
      setToken: () => {},
      rawFetch: async () => {
        throw { status: 400, data: { code: 'woocommerce_rest_cart_invalid_key' } }
      },
    })

    await expect(client.request('/cart/update-item')).rejects.toThrowError(StoreApiError)
    await client.request('/cart/update-item').catch((err: StoreApiError) => {
      expect(err.status).toBe(400)
      expect(err.code).toBe('woocommerce_rest_cart_invalid_key')
    })
  })
})
