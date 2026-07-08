// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Use root-level structure (not app/ directory)
  future: {
    compatibilityVersion: 3,
  },

  modules: ['@pinia/nuxt', '@nuxt/image'],

  // Image optimization. Provider auto-detects (Vercel in prod, IPX locally).
  // Remote source hosts must be allowlisted.
  image: {
    domains: ['images.unsplash.com'],
    quality: 80,
    format: ['webp'],
  },

  // Register shared UI primitives (components/ui, e.g. <Price>) without a
  // path prefix; the rest of components/ keeps default auto-import.
  components: [
    { path: '~/components/ui', pathPrefix: false },
    '~/components',
  ],

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Google Fonts via <link> in <head>
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        },
      ],
      // Mercado Pago SDK is loaded only on the checkout page (see
      // pages/checkout.vue), not globally, to keep it off catalog pages.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // Per-route caching (docs/architecture.md §1).
  // Catalog/content: SWR (serve stale, revalidate in background) — absorbs
  // read traffic at the edge. On Vercel `swr` maps to ISR-style caching.
  // Personal routes (cart/checkout/account) and APIs: never cached.
  routeRules: {
    '/': { swr: 600 },
    '/shop': { swr: 300 },
    '/shop/**': { swr: 300 },
    '/product/**': { swr: 300 },
    '/cart': { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
    '/checkout': { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
    '/account/**': { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
    '/api/**': { cache: false, headers: { 'cache-control': 'no-store' } },
  },

  // Runtime config
  runtimeConfig: {
    public: {
      graphqlUrl: process.env.NUXT_PUBLIC_GRAPHQL_URL || 'http://localhost/graphql',
      mercadopagoPublicKey: process.env.NUXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
    },
  },
})
