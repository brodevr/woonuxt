// https://nuxt.com/docs/api/configuration/nuxt-config
console.log('NUXT_PUBLIC_GRAPHQL_URL in config:', process.env.NUXT_PUBLIC_GRAPHQL_URL)
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Use root-level structure (not app/ directory)
  future: {
    compatibilityVersion: 3,
  },

  modules: ['@pinia/nuxt'],

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
      script: [
        { src: 'https://sdk.mercadopago.com/js/v2', async: true, defer: true }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // Runtime config
  runtimeConfig: {
    public: {
      graphqlUrl: process.env.NUXT_PUBLIC_GRAPHQL_URL || 'http://localhost/graphql',
      mercadopagoPublicKey: process.env.NUXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
    },
  },
})
