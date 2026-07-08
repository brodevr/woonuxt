import { describe, it, expect } from 'vitest'
import { createStoreApiCartService } from '../modules/cart/services/store-api-cart.service'
import type { StoreApiClient, StoreApiRequestOptions } from '../core/http/store-api.client'

/** Records every request the service issues against a fake client. */
function recordingClient() {
  const calls: { path: string; options?: StoreApiRequestOptions }[] = []
  const client: StoreApiClient = {
    async request<T>(path: string, options?: StoreApiRequestOptions): Promise<T> {
      calls.push({ path, options })
      return {} as T
    },
  }
  return { client, calls }
}

describe('storeApiCartService', () => {
  it('getCart GETs /cart', async () => {
    const { client, calls } = recordingClient()
    await createStoreApiCartService(client).getCart()
    expect(calls[0]).toEqual({ path: '/cart', options: undefined })
  })

  it('addItem POSTs id + quantity to /cart/add-item', async () => {
    const { client, calls } = recordingClient()
    await createStoreApiCartService(client).addItem(42, 3)
    expect(calls[0].path).toBe('/cart/add-item')
    expect(calls[0].options).toEqual({ method: 'POST', body: { id: 42, quantity: 3 } })
  })

  it('addItem defaults quantity to 1', async () => {
    const { client, calls } = recordingClient()
    await createStoreApiCartService(client).addItem(7)
    expect(calls[0].options?.body).toEqual({ id: 7, quantity: 1 })
  })

  it('updateItem POSTs key + quantity to /cart/update-item', async () => {
    const { client, calls } = recordingClient()
    await createStoreApiCartService(client).updateItem('abc', 5)
    expect(calls[0].path).toBe('/cart/update-item')
    expect(calls[0].options).toEqual({ method: 'POST', body: { key: 'abc', quantity: 5 } })
  })

  it('removeItem POSTs key to /cart/remove-item', async () => {
    const { client, calls } = recordingClient()
    await createStoreApiCartService(client).removeItem('abc')
    expect(calls[0].path).toBe('/cart/remove-item')
    expect(calls[0].options).toEqual({ method: 'POST', body: { key: 'abc' } })
  })
})
