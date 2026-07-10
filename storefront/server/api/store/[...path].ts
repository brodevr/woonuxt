/**
 * WooCommerce Store API proxy (BFF).
 *
 * The browser calls /api/store/* (same-origin) and Nitro forwards to the real
 * WooCommerce Store API server-side, so there is no cross-origin CORS problem
 * for cart/checkout (docs/architecture.md §2). The Cart-Token flows both ways:
 * the client's token is forwarded to WooCommerce, and the refreshed token from
 * WooCommerce is returned to the client so the guest cart persists.
 */
export default defineEventHandler(async (event) => {
  const { storeApiUrl } = useRuntimeConfig()
  const path = getRouterParam(event, 'path') || ''
  const target = `${storeApiUrl}/${path}`

  const method = event.method
  const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH'
  const body = hasBody ? await readBody(event) : undefined
  const cartToken = getHeader(event, 'cart-token')

  try {
    const headers: Record<string, string> = {
      // WooCommerce/security plugins reject requests without a User-Agent
      // (they return 503), so always send one from the server.
      'User-Agent': 'WooNuxt-Storefront-BFF',
      Accept: 'application/json',
    }
    if (cartToken) {
      headers['Cart-Token'] = cartToken
    }

    const response = await $fetch.raw(target, {
      method,
      body,
      query: getQuery(event),
      headers,
    })

    // Return the refreshed cart session token to the client.
    const nextToken = response.headers.get('Cart-Token')
    if (nextToken) {
      setResponseHeader(event, 'Cart-Token', nextToken)
    }

    return response._data
  } catch (error: any) {
    // Surface WooCommerce's error body/status to the client unchanged.
    const status = error?.response?.status || error?.status || 502
    setResponseStatus(event, status)
    return error?.data ?? { code: 'store_api_proxy_error', message: 'Store API request failed' }
  }
})
