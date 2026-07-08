# Woonuxt Headless WooCommerce Storefront

A modern, mobile-first headless e-commerce storefront built with Nuxt 3, Vue 3, and WooCommerce. Designed with a luxury, minimalist aesthetic (Kylie Cosmetics inspired) and optimized for performance.

## Features

- **Mobile-First Design**: Responsive edge-to-edge grids, elegant typography, and minimalist UI.
- **Headless Checkout**: Secure, custom multi-step checkout wizard integrated with Mercado Pago.
- **Performance Optimized**: Built with Nuxt 3 for fast SSR/SSG rendering, handling large catalogs efficiently.
- **Product Variations**: Dynamic color and size selection on product pages.
- **Security**: Hardened WordPress API endpoints with strict validation and sanitization.

## Architecture

- **Frontend**: Nuxt 3, Vue 3, vanilla CSS with custom properties (`main.css`).
- **Backend API**: WordPress REST API with custom endpoints (`woonuxt-settings` plugin).
- **Payment Gateway**: Mercado Pago (Headless integration via Bricks builder).

## Setup & Development

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   NUXT_PUBLIC_GRAPHQL_URL=http://your-wordpress-site.local/graphql
   NUXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mp_public_key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend (WordPress) Setup

1. Install WooCommerce and WPGraphQL plugins.
2. Install the custom `woonuxt-settings` plugin.
3. Configure Mercado Pago Access Token in wp-config.php or plugin settings:
   ```php
   define('MP_ACCESS_TOKEN', 'your_access_token');
   ```

## Production Deployment

### Frontend (Nuxt)
Deploy to Vercel, Netlify, or any Node.js hosting.
```bash
npm run build
```
For static generation:
```bash
npm run generate
```

### Backend (WordPress)
Ensure your WordPress server is configured with SSL (HTTPS) as required by Mercado Pago.

## Testing

Run unit tests (Vitest):
```bash
npm run test
```
