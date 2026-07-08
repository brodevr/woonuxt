# WooNuxt

Headless WooCommerce storefront built with Nuxt, plus the companion WordPress plugin that exposes the GraphQL settings and endpoints it consumes.

## Structure

- **`storefront/`** — Nuxt 3/Vue 3 frontend (product catalog, cart, multi-step checkout with Mercado Pago). See [`storefront/README.md`](storefront/README.md) for setup and development instructions.
- **`wp-plugin/`** — `woonuxt-settings` WordPress plugin. Exposes the GraphQL schema and REST endpoints the storefront reads from (requires WooCommerce + WPGraphQL). See [`wp-plugin/README.md`](wp-plugin/README.md).

## Quick start

```bash
cd storefront
npm install
cp .env.example .env   # set NUXT_PUBLIC_GRAPHQL_URL and NUXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
npm run dev
```

The WordPress backend (with the `wp-plugin` installed and WooCommerce + WPGraphQL active) must be reachable at the configured `NUXT_PUBLIC_GRAPHQL_URL` for live data; otherwise the storefront falls back to mock data (`storefront/data/mock.ts`).
