/**
 * GraphQL proxy (BFF).
 *
 * Lets the browser run GraphQL queries same-origin (/api/graphql) — used by
 * the instant-search autocomplete — so there is no cross-origin CORS concern
 * and the WordPress URL stays server-side. Forwards a User-Agent (WPGraphQL/
 * security plugins 503 requests without one).
 */
export default defineEventHandler(async (event) => {
  const { public: pub } = useRuntimeConfig()
  const body = await readBody(event)

  try {
    return await $fetch(pub.graphqlUrl as string, {
      method: 'POST',
      body,
      headers: {
        'User-Agent': 'WooNuxt-Storefront-BFF',
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    setResponseStatus(event, error?.status || 502)
    return error?.data ?? { errors: [{ message: 'GraphQL proxy request failed' }] }
  }
})
