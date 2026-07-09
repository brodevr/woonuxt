# Documento de Arquitectura de Producción — WooNuxt Headless Storefront

## Context

El proyecto es un storefront headless de WooCommerce (Nuxt 4 + WordPress/WooCommerce) que hoy está en estado prototipo: catálogo por GraphQL con fallback a mock, carrito 100% client-side sin sincronizar con WooCommerce, checkout que apunta a un endpoint REST inexistente, sin auth, sin caché, sin observabilidad, y con dos sistemas de diseño conviviendo. La auditoría previa (ver historial de sesión) documentó estos gaps.

Este documento define la **arquitectura objetivo de producción** antes de escribir código: alto rendimiento, escalabilidad, mantenibilidad y buena UX, con despliegue en Vercel. **No se implementa nada todavía** — es la base de diseño que guiará el desarrollo por fases.

**Entregable:** al aprobar, este contenido se escribe como `docs/architecture.md` y se pushea a la rama `claude/push-status-check-714zav`.

### Decisiones base (confirmadas con el usuario)
- **Store API** de WooCommerce será la API principal de **carrito y checkout** (escritura/sesión).
- **GraphQL** (WPGraphQL + WooGraphQL) sigue para **catálogo, contenido y lecturas** (SSR/ISR cacheables).
- **Estado global con Pinia**, stores por dominio (migra el `useState` actual de `useCart`).
- **Auth guest-first**: checkout como invitado con Store API `Cart-Token`; cuentas **opcionales** con JWT vía WPGraphQL Headless Login (historial, wishlist, direcciones).
- **Búsqueda con motor dedicado** (Typesense recomendado) sincronizado desde WooCommerce — no MySQL/GraphQL (ver §11).
- **Deploy en Vercel** (Nitro preset `vercel`), diseño portable a cualquier host Nitro.

### Estado de implementación (rama `claude/push-status-check-714zav`)

Base construida y verificada (tests + build + SSR en cada paso). Lo marcado
_(base)_ está implementado y testeado pero aún no cableado a un WooCommerce real.

| Fase | Estado | Entregado |
|---|---|---|
| **1 — Arquitectura base** | ✅ | `core/http` (GraphQL client) + `core/errors`; servicio de catálogo; Pinia (cart + settings store); primitivo `<Price>` en `components/ui`; scaffold de GraphQL codegen |
| **2 — Caché / rendimiento** | ✅ | `useCurrency` desde settings reales; SDK de MP solo en checkout; `routeRules` ISR/SWR + Cache-Control; `@nuxt/image`; SEO por producto (`useSeoMeta`) |
| **3 — Búsqueda** | ✅ (motor pendiente de infra) | Módulo `search/` agnóstico + `MockSearchProvider` + UI (`SearchBox`, `/search`); `shop.vue` servido por el motor; `docs/search.md` con el adapter Typesense |
| **4 — Store API / carrito** | 🟡 _(base)_ | `storeApiClient` (Cart-Token) + `storeApiCartService` tipado, testeados. Falta cablear el carrito real (necesita WooCommerce). |
| **5–8** | ⏳ | Auth, checkout/pagos, observabilidad, optimización, producción — requieren backend/infra reales. |

Extras: fix de reactividad en `/product/[slug]`; eliminado el endpoint de debug `/api/test-config`.

Pendiente consciente (necesita infra/criterio): unificar los estilos `kylie`
divergentes (requiere regresión visual, Fase 8); correr codegen/búsqueda contra
datos reales; conectar `fullYoastHead`.

---

## 1. Estrategia de caché

Principio rector: **separar datos cacheables (catálogo/contenido, lentos de cambiar, alto volumen de lectura) de datos personales (carrito/sesión/checkout, nunca cacheables)**. WooCommerce/MySQL no puede ser el que atienda el tráfico de lectura de catálogo a escala — la caché es la que absorbe ese tráfico.

### Capas
1. **CDN / Edge (Vercel Edge Network)** — primera línea. Todo lo cacheable se sirve desde el edge, no toca el origen Nitro ni WordPress.
2. **Nitro route rules (ISR/SWR)** — la app Nuxt define por ruta su política vía `routeRules` en `nuxt.config.ts`. En Vercel, Nitro traduce esto a ISR/edge caching nativo.
3. **Data-layer cache (Nitro `cachedFunction` / `useStorage`)** — cachear respuestas GraphQL individuales (ej. settings de tienda) con TTL, para que múltiples páginas compartan el mismo fetch sin repegar a WordPress.
4. **Caché HTTP de assets** — imágenes/fuentes/JS con `Cache-Control: immutable` (hasheados por Vite).

### Política por tipo de ruta

| Ruta | Estrategia | Justificación |
|---|---|---|
| `/` (home) | **ISR + SWR**, `revalidate` ~600s | Contenido curado, cambia poco; SWR sirve stale mientras revalida en background — cero latencia percibida. |
| `/shop`, `/shop?category=` | **ISR/SWR** ~300s | Listados de catálogo, alta lectura. Los filtros/orden se resuelven client-side o con query params cacheables. |
| `/product/[slug]` | **ISR on-demand** + SWR ~300s | Páginas más numerosas y visitadas; se prerenderan bajo demanda y se cachean. Precio/stock crítico → ver invalidación. |
| Contenido/CMS (páginas estáticas, blog) | **ISR** largo (~3600s) | Cambia muy poco. |
| `/cart`, `/checkout`, `/account/*` | **NUNCA cachear** (`cache: false`, SSR dinámico o CSR puro) | Estado por usuario/sesión. Cachearlo filtraría datos entre usuarios. |
| `/api/*` (BFF propio) | **NUNCA cachear** salvo endpoints de lectura idempotente explícitos | Mutaciones y datos de sesión. |
| Respuesta de Store API (`/wc/store/*`) | **NUNCA cachear** en CDN | Carrito/checkout ligados a `Cart-Token`. |

### Cache-Control
- Cacheable: `Cache-Control: public, s-maxage=<ttl>, stale-while-revalidate=<window>` (el edge sirve stale y revalida).
- Personal: `Cache-Control: private, no-store` en todas las respuestas de carrito/checkout/cuenta.
- Assets hasheados: `Cache-Control: public, max-age=31536000, immutable`.

### Invalidación y revalidación
- **Time-based (SWR)** como default: simple, robusto, sin acoplar WordPress a Vercel. Ventana de staleness aceptable para catálogo (segundos/minutos).
- **On-demand (targeted purge)** para cambios críticos de precio/stock/publicación: **webhooks de WooCommerce** (`product.updated`, `product.deleted`, order stock changes) → endpoint propio en Nitro (`/api/revalidate`, protegido con secret) que **purga la ruta/tag específica** (`product/[slug]`, listados de su categoría). Evita mostrar precio viejo sin invalidar todo el catálogo.
- **Deploy = purge total**: cada deploy de Vercel invalida la caché de build; los cambios de código se reflejan sí o sí.
- **Stock en tiempo real**: el stock exacto NO se confía a la página cacheada. En la página de producto se muestra el stock cacheado como referencia, pero **la validación real de disponibilidad ocurre en el add-to-cart y en el checkout vía Store API** (fuente de verdad no cacheada). Así se combina performance (página cacheada) con correctitud (validación en escritura).

---

## 2. Estrategia de datos

Tres fuentes, con límites claros por responsabilidad:

### GraphQL (WPGraphQL + WooGraphQL) — LECTURA cacheable
- Catálogo: productos, variaciones, categorías, atributos, filtros.
- Contenido/CMS: páginas, banners, menús, SEO (el plugin ya expone `fullYoastHead` — hoy sin usar, **conectarlo**).
- Settings de tienda: `woonuxtSettings` (moneda, branding, `global_attributes`) — hoy expuesto pero **ignorado** por `useCurrency` (bug a corregir).
- Se consume en **SSR/ISR**, se cachea (capa §1). Nunca se usa GraphQL para mutar carrito/checkout.
- **Límite:** GraphQL/MySQL **no** se usa para búsqueda por texto ni faceted search a escala (lento, sin typo-tolerance ni ranking de relevancia) → eso va al motor dedicado (ver §11).

### Motor de búsqueda dedicado (Typesense/Algolia) — LECTURA de búsqueda/descubrimiento
- Índice de productos sincronizado desde WooCommerce (fuente de verdad sigue siendo WooCommerce).
- Sirve: búsqueda instantánea (as-you-type), autocompletado, faceted search (categoría, precio, atributos), typo-tolerance, sinónimos, ranking/merchandising.
- El frontend consulta el motor **directo** con una API key de solo-lectura restringida (baja latencia), o vía BFF si se quiere ocultar todo. Detalle completo en **§11**.

### WooCommerce Store API — ESCRITURA / sesión (nunca cacheable)
- Carrito: `/wc/store/v1/cart`, `add-item`, `update-item`, `remove-item`, `apply-coupon`.
- Envíos: `availableShippingMethods`/`shippingRates` reales por zona (reemplaza el hardcode `flat_rate=5000` de `useCart.ts`).
- Checkout: `POST /wc/store/v1/checkout` con `payment_data` → dispara `process_payment` del gateway real (mecanismo `StoreApi/Legacy.php` ya documentado en `docs/mercadopago-headless-checkout.md`).
- Sesión: **`Cart-Token`** (header) en vez de cookies PHP — headless-friendly, expuesto en CORS desde WooCommerce ≥9.8. Se persiste en el cliente y se reenvía en cada request de carrito.
- Impuestos, totales, validación de stock/precio: **fuente de verdad**, calculados por WooCommerce, nunca por el frontend.

### Backend propio (BFF — Nitro `server/`) — orquestación fina
Se usa **solo cuando** hace falta ocultar secretos, orquestar múltiples llamadas, o adaptar formatos. Casos concretos:
- `/api/revalidate` — receptor de webhooks de WooCommerce para purga de caché (protegido por secret).
- Proxy selectivo de Store API **si** el CORS/`Cart-Token` cross-domain diera problemas (fallback; con Woo ≥9.8 puede no hacer falta).
- Endpoint de pago si se requiere lógica server-side extra (validación de monto contra la orden antes de confirmar) — a definir en fase de checkout.
- **Regla:** el BFF no duplica lógica de negocio de WooCommerce; orquesta y protege. Nada de reimplementar precios/impuestos.

**Antipatrón a evitar:** llamar a Store API directo desde el navegador para todo sin capa de tipos/errores. Se encapsula en un servicio (§4).

---

## 3. Arquitectura del frontend (por dominios)

Estructura orientada a **módulos de dominio** para que escale años sin volverse un `pages/` + `composables/` planos e inmanejables. Nuxt 4 usa `app/` como raíz del código de app.

```
storefront/
  app/
    core/                      # infraestructura transversal, sin lógica de negocio
      http/                    # clientes HTTP (GraphQL client, Store API client)
      config/                  # runtime config tipado, constantes
      errors/                  # clases de error, normalización
      types/                   # tipos compartidos globales
    modules/                   # DOMINIOS — cada uno autocontenido
      catalog/                 # productos, categorías, filtros (lectura GraphQL)
        components/
        composables/           # useProduct, useProductList, useCategories
        services/              # catalog.service.ts (GraphQL)
        queries/               # *.graphql / query builders
        types/
        stores/                # useCatalogStore (Pinia) si aplica
      search/                  # BÚSQUEDA — motor dedicado (ver §11)
        components/            # SearchBox, Autocomplete, SearchResults, Facets
        composables/           # useSearch, useAutocomplete, useFacets
        services/              # search.service.ts (cliente del motor: Typesense/Algolia)
        types/
        stores/                # useSearchStore (query, filtros, resultados)
      cart/
        components/            # CartDrawer, CartItem, CartSummary
        composables/           # useCart (fachada sobre store + service)
        services/              # cart.service.ts (Store API)
        stores/                # useCartStore (Pinia) — reemplaza useState actual
        types/
      checkout/
        components/            # Stepper, ContactStep, ShippingStep, PaymentStep
        composables/
        services/              # checkout.service.ts (Store API), payment adapters
        stores/                # useCheckoutStore
        types/
      auth/
        composables/           # useAuth, useSession
        services/              # auth.service.ts (WPGraphQL Headless Login / JWT)
        stores/                # useAuthStore
      content/                 # CMS, SEO, páginas estáticas
    components/ui/             # UI reutilizable AGNÓSTICA de dominio: Button,
                               # Input, Price, Skeleton... (design system único).
                               # Nota: en Nuxt 4 `shared/` es un directorio
                               # RESERVADO (código app/server) — no puede alojar
                               # componentes .vue (rompe el build de Nitro). Por
                               # eso los primitivos UI viven en components/ui.
      # composables compartidos (useCurrency, useFormat, useMediaQuery) van en
      # composables/ (auto-import estándar de Nuxt).
    pages/                     # rutas finas: solo orquestan módulos, sin lógica
    layouts/
    plugins/
    middleware/                # auth guards, etc.
    assets/
  server/                      # BFF Nitro: /api/revalidate, proxies, webhooks
  tests/                       # e2e (o carpeta e2e/ separada)
  nuxt.config.ts
```

**Reglas de dependencia (para que no se degrade):**
- `pages/` → orquesta `modules/`, no contiene lógica de negocio ni fetch directo.
- `modules/*` → pueden usar `core/` y los primitivos de `components/ui/`, **no** dependen entre sí directamente (comunican vía stores o eventos). Ej.: checkout lee del cart store, no importa componentes internos de cart.
- `components/ui/` → **un solo design system** (elimina la dualidad `main.css` tokens vs estilos `kylie` hardcodeados). Componentes base (`Button`, `Input`, `Price`) que todo el resto reusa.
- `core/` → sin dependencias de dominio; puro plumbing.

Esto convierte el `checkout.vue` de 624 líneas en un módulo con componentes por paso, y el `useWooNuxt` monolítico en servicios por dominio.

---

## 4. Arquitectura de servicios (capas limpias)

Cuatro capas, responsabilidad única cada una. Elimina el composable-gigante (`useWooNuxt` hace fetch + transform + fallback + tipos, todo junto).

```
Componente / Página
      │  (usa)
Composable            → estado reactivo + orquestación de UI (useProductList, useCart)
      │  (llama)
Service               → lógica de negocio del dominio, mapeo DTO→modelo (catalog.service)
      │  (usa)
HTTP Client           → transporte puro: auth headers, errores, retries (graphqlClient, storeApiClient)
      │
Backend (GraphQL / Store API / BFF)
```

### Capa HTTP (`core/http/`)
- **`graphqlClient`**: wrapper sobre `$fetch` con endpoint, headers, manejo de errores GraphQL (array `errors`), y punto único para introducir **persisted queries / typed SDK** más adelante. Reemplaza el `fetchGraphQL` manual embebido en `useWooNuxt`.
- **`storeApiClient`**: wrapper sobre `$fetch` para Store API — inyecta y persiste el `Cart-Token` (lee de store/cookie, lo re-guarda del response header), maneja `Nonce`, normaliza errores. **Punto único** donde vive el manejo de sesión de carrito.
- Ambos: timeouts, reintentos con backoff para errores transitorios, normalización a clases de error tipadas (`core/errors/`).

### Capa Service (`modules/*/services/`)
- Una función/clase por caso de uso: `catalogService.getProducts(params)`, `cartService.addItem(...)`, `checkoutService.placeOrder(...)`.
- **Owner del mapeo DTO → modelo de dominio** (lo que hoy hace `transformProduct`, aislado y testeable).
- No conoce Vue/reactividad — testeable en aislamiento con el client mockeado.

### Capa Composable (`modules/*/composables/`)
- Estado reactivo (`useAsyncData`, refs), llama a services, expone API limpia al componente.
- `useCart` pasa a ser una **fachada** sobre `useCartStore` (Pinia) + `cartService` (Store API) — nada de `localStorage` a mano ni cálculo de envío hardcodeado.

### Capa Store (Pinia, `modules/*/stores/`)
- Estado global por dominio: `useCartStore`, `useAuthStore`, `useCheckoutStore`.
- Persistencia donde aplique (cart token, sesión) vía plugin de persistencia, no `localStorage` disperso.
- Devtools, SSR-safe, testeable.

### Tipos (`types/` por módulo + `core/types/`)
- **Objetivo: eliminar los tipos escritos a mano** de `data/mock.ts`. Introducir **GraphQL Code Generator** para generar tipos desde el schema real → detecta breaking changes del backend en build-time, no en runtime.
- DTOs (respuesta cruda) separados de modelos de dominio (lo que consume la UI); el mapeo vive en services.

---

## 5. Estrategia de despliegue

Pipeline con 4 entornos + rollback, sobre Vercel + Git (GitHub) como fuente.

| Entorno | Trigger | Backend WP | Propósito |
|---|---|---|---|
| **Development** | local (`npm run dev`) | WP local / staging / mock | Desarrollo diario. Fallback a mock permite trabajar sin WP. |
| **Preview** | cada PR (deploy automático Vercel) | WP staging | Revisión por PR, URL única por rama. QA visual y funcional. |
| **Staging** | merge a `develop` (o rama staging) | WP staging (datos realistas) | Pre-producción: e2e, pruebas de carga, validación de integración con WP real. |
| **Production** | merge/tag a `main` | WP producción | Público. |

### Principios
- **Env vars por entorno en Vercel** (`NUXT_PUBLIC_GRAPHQL_URL`, `NUXT_PUBLIC_STORE_API_URL`, `MERCADOPAGO_PUBLIC_KEY`, `REVALIDATE_SECRET`). Nunca secretos en el repo (hoy `.env.example` está limpio — mantener).
- **Promoción de artefacto**: staging y prod comparten el mismo build validado (Vercel promueve el mismo deployment), no rebuild distinto → lo que se testeó es lo que sale.
- **Gates de CI antes de merge**: typecheck + lint + unit/integration + build. e2e en preview/staging.
- **Backend WP versionado aparte**: el plugin (`wp-plugin/`) se despliega al WordPress por su propio canal (WP admin / CI de WP). Pinnear versiones de WooCommerce/WPGraphQL/WooGraphQL (ya están en `constants.php`) y probar upgrades en staging primero — los internals de Store API/gateways pueden cambiar entre versiones.

### Rollback
- **Frontend**: Vercel **Instant Rollback** — promover el deployment anterior (inmediato, sin rebuild). Cada deploy es inmutable y direccionable.
- **Backend WP**: mantener el ZIP de la versión previa del plugin + snapshot de DB antes de migraciones. Rollback del plugin = reactivar versión anterior. Cambios de schema GraphQL deben ser retrocompatibles (aditivos) para permitir rollback del frontend sin romper.
- **Regla de compatibilidad**: frontend y backend evolucionan con contratos retrocompatibles (deprecar, no romper) para que rollback de uno no exija rollback del otro.

---

## 6. Observabilidad

Cobertura de las 4 señales (errores, logs, métricas, trazas) en ambos lados del headless.

### Errores de frontend
- **Sentry** (`@sentry/nuxt`): captura excepciones cliente + SSR, source maps para stacktraces legibles, **Session Replay** para reproducir el bug del usuario, breadcrumbs. Release health por deploy.
- Hook global de errores Vue/Nitro → Sentry, con contexto (ruta, usuario anónimo/logueado, cart token hasheado).

### Errores de backend (Nitro BFF + WordPress)
- **Nitro/BFF**: Sentry server-side en `server/` (webhooks, proxies).
- **WordPress**: logging estructurado del plugin (hoy `woonuxt_log` solo con `WP_DEBUG`) → integrar con un sink (ej. Sentry PHP, o el APM del hosting de WP). Monitorear errores de GraphQL y de gateways de pago.

### Logs
- Frontend/BFF: logs estructurados (JSON) desde Nitro → **Vercel Log Drains** hacia un agregador (Datadog / Axiom / Better Stack). Correlación por request id.
- Nunca loguear PII ni tokens en claro.

### Métricas
- **Web Vitals reales (RUM)**: **Vercel Speed Insights** o Sentry Performance — LCP/INP/CLS de usuarios reales, no solo lab.
- Métricas de negocio: tasa add-to-cart, inicio/abandono de checkout, conversión, latencia de Store API — dashboards en el agregador.
- Backend WP: tiempo de resolución GraphQL, queries lentas de MySQL, tasa de error de gateways.

### Rendimiento / trazas
- **Tracing distribuido** (OpenTelemetry vía Sentry/Datadog): traza una compra end-to-end — navegador → Nitro → Store API/WordPress → gateway. Detecta el cuello de botella real bajo carga.

### Alertas
- **Sentry alerts**: spike de error rate, nuevo issue en release, fallo de checkout.
- **Uptime/synthetic** (Better Stack / Checkly): monitor sintético del flujo crítico (home → producto → add-to-cart → checkout) cada N minutos; alerta si se rompe.
- Alertas de presupuesto de performance (LCP/INP sobre umbral) y de errores de pago (canal dedicado, prioridad alta).

**Stack recomendado (justificación):** **Sentry** (errores+replay+perf, integración Nuxt de primera) + **Vercel Speed Insights/Analytics** (RUM sin fricción en Vercel) + **Axiom o Better Stack** (log drains + uptime, costo razonable). Datadog si ya hay presupuesto/uso enterprise (APM+logs+RUM unificado, más caro).

---

## 7. Estrategia de testing

Pirámide: mucho unit, integration en los bordes, e2e en flujos críticos, carga/estrés antes de prod.

| Nivel | Qué cubre | Herramienta | Dónde corre |
|---|---|---|---|
| **Unit** | Services (mapeo DTO→modelo, `transformProduct`), stores Pinia, composables puros, utils (`useCurrency`, cálculo de totales) | **Vitest** (ya presente) + `@nuxt/test-utils` | CI en cada push |
| **Integration** | HTTP clients contra Store API/GraphQL **mockeados** (MSW), flujo composable→service→client, manejo de errores/reintentos, sesión Cart-Token | Vitest + **MSW** | CI |
| **Component** | Componentes de UI (`ProductCard`, `CartDrawer`, pasos de checkout) render + interacción | Vitest + `@vue/test-utils` (ya presente) | CI |
| **E2E** | Flujos críticos reales: navegar catálogo → add-to-cart → checkout guest → orden; login/cuenta | **Playwright** (ya disponible en el entorno) | Preview/staging |
| **Contract** | Que el schema GraphQL y el shape de Store API que consume el front siguen válidos contra el WP real | Codegen check + tests de contrato en staging | CI/staging |
| **Carga** | Comportamiento bajo tráfico esperado (RPS objetivo) en catálogo cacheado y en Store API | **k6** (o Grafana Cloud k6) | Staging, pre-release |
| **Estrés** | Punto de quiebre: subir carga hasta degradar; validar caché absorbe lectura y WooCommerce solo recibe escrituras | k6 | Staging |
| **Regresión** | Suite e2e + unit como gate; **visual regression** para UI (Playwright screenshots / Percy) | Playwright + CI | Cada PR |

### Enfoque específico
- **Checkout es el más crítico y hoy tiene 0 tests** → prioridad de cobertura unit + e2e (incluye validación de monto server-side cuando exista).
- **Pruebas de carga separadas**: (a) rutas cacheadas → deben resolverse en el edge sin tocar WP (validar hit ratio); (b) Store API (carrito/checkout) → el camino no cacheable que sí pega a WooCommerce, es el que limita concurrencia real.
- Datos de test aislados en WP staging (no producción).

---

## 8. Seguridad (checklist pre-producción)

- **Validación de monto server-side en checkout**: nunca confiar en el `amount` del cliente; validar contra el total real de la orden en WooCommerce (riesgo #1 hoy, ver auditoría).
- **Eliminar/proteger endpoint de debug** `server/api/test-config.ts` (hoy expone `graphqlUrl`/`envUrl` sin auth) — quitar o restringir a dev.
- **CORS** correctamente acotado: WPGraphQL y Store API deben permitir solo el/los dominios del storefront (no `*`), especialmente para exponer `Cart-Token`.
- **Secretos**: solo en env vars de Vercel/WP; `REVALIDATE_SECRET` para el webhook; rotación. Confirmar que no hay claves en el repo (hoy limpio).
- **Rate limiting / WAF**: en el edge (Vercel Firewall) para `/api/*` y para proteger el endpoint GraphQL de queries abusivas; límites de profundidad/complejidad en WPGraphQL.
- **`graphql_connection_max_query_amount`** (hoy sube el límite al total de productos si >100): acotar — permite queries que devuelven miles de nodos sin paginar (riesgo de DoS/latencia). Forzar paginación real.
- **Auth/JWT**: expiración corta + refresh, almacenamiento seguro (httpOnly cookie para el token de sesión donde sea posible), CSRF en mutaciones.
- **Headers de seguridad**: CSP (ojo con el SDK de Mercado Pago inline), HSTS, `X-Content-Type-Options`, `Referrer-Policy` — vía `routeRules` headers.
- **PCI**: el card data nunca toca el frontend/BFF (tokenización en el navegador vía SDK de MP/gateway) — mantener ese límite.
- **Webhooks**: verificar firma/secret de los webhooks de WooCommerce antes de purgar caché.
- **Dependencias**: `npm audit` / Dependabot; pinnear y auditar versiones de plugins WP.
- **Superficie del instalador de plugins** (`class-woonuxt-plugin-manager.php`): hoy protegido (capability+nonce+whitelist) — revisar que siga así, no exponerlo headless.

---

## 9. Roadmap por fases

Orden pensado para reducir riesgo: primero la base estructural y de datos, luego lo transaccional, luego hardening. Cada fase deja el sistema desplegable.

**Fase 1 — Arquitectura base**
Reestructurar a módulos por dominio (§3), introducir capas de servicios/HTTP clients/Pinia (§4), unificar en un solo design system (`shared/ui`), GraphQL Code Generator para tipos. Migrar `useCart` a `useCartStore`. Sin cambiar comportamiento aún — refactor estructural.

**Fase 2 — Caché y rendimiento de lectura**
`routeRules` ISR/SWR por ruta (§1), data-layer cache para settings, Cache-Control, conectar settings reales de moneda (fix `useCurrency`), conectar SEO (`fullYoastHead`), imágenes con `@nuxt/image`. Cargar SDK de MP solo en checkout.

**Fase 3 — Búsqueda (motor dedicado)**
Módulo `search/` (§11): stand-up del motor (Typesense recomendado), pipeline de indexación desde WooCommerce (bulk inicial + incremental por webhooks), search-only key, UI de búsqueda instantánea + autocompletado + facetas. Reemplaza el filtrado en memoria de `shop.vue` por queries al motor. Independiente del carrito → se puede paralelizar con F4.

**Fase 4 — Store API: carrito y envíos**
`storeApiClient` con `Cart-Token`, `cartService`, migrar el carrito de client-side puro a sincronizado con WooCommerce; envíos/impuestos reales desde Store API (elimina hardcodes). Revalidación de stock/precio en add-to-cart.

**Fase 5 — Autenticación (guest-first)**
Store API cart token para invitados ya cubierto en F4. Sumar cuentas opcionales con JWT (WPGraphQL Headless Login): login/registro, `useAuthStore`, guards de `/account/*`, historial de pedidos, direcciones. Wishlist si se desea.

**Fase 6 — Checkout y pagos**
Reescribir `checkout.vue` como módulo por pasos; `POST /wc/store/v1/checkout` con `payment_data` → gateway real de Mercado Pago (según `docs/mercadopago-headless-checkout.md`); **validación de monto server-side**; manejo de errores con UI unificada (fuera `alert()`); página de confirmación con orden real.

**Fase 7 — Observabilidad**
Sentry (front+server+WP), RUM/Web Vitals, log drains, tracing distribuido, alertas y monitor sintético del flujo crítico (§6).

**Fase 8 — Optimización y hardening**
Pruebas de carga/estrés (k6), tuning de TTLs y hit ratio, límites de complejidad GraphQL + paginación forzada, CSP/headers de seguridad, rate limiting, visual regression.

**Fase 9 — Producción**
Pipeline dev/preview/staging/prod + rollback (§5), gates de CI completos, checklist de seguridad (§8), runbook de incidentes, go-live.

---

## 10. Riesgos por escala

### 10.000 productos
- **Bajo riesgo estructural.** Requiere que el catálogo esté **paginado** en GraphQL (hoy `shop.vue` trae todo y filtra en memoria — no sostenible) y filtros/orden server-side. Con ISR/SWR (§1), el catálogo se sirve del edge; WordPress solo se pega en revalidaciones.
- ISR on-demand de `/product/[slug]` escala bien (se cachea al primer hit).

### 100.000 productos
- **El filtrado/orden/búsqueda client-side deja de ser viable** — obligatorio mover todo a queries paginadas server-side, y **el motor de búsqueda dedicado (§11) pasa de recomendable a imprescindible** a este volumen (faceted search en WPGraphQL+MySQL es inviable).
- **`graphql_connection_max_query_amount` al total de productos es un riesgo serio**: una sola query podría intentar traer 100k nodos → agota memoria/timeout de WordPress. **Hay que acotarlo** (fase 7/seguridad).
- Sitemap y prerender selectivo (no prerenderar 100k rutas en build; usar ISR on-demand).
- Costo de invalidación: purga por tags/rutas específicas, nunca purga total ante cada cambio de producto.

### Miles de usuarios concurrentes
- **Lectura de catálogo: OK si la caché funciona** — el edge absorbe; el riesgo es un **hit ratio bajo** por TTLs mal calibrados o exceso de rutas únicas (query params infinitos). Normalizar/whitelistear params cacheables.
- **Carrito/checkout: el cuello de botella real.** Store API pega a WooCommerce/MySQL y **no es cacheable**. Miles de checkouts concurrentes estresan WordPress y el gateway de pago. Mitigación: escalar el hosting de WP (PHP-FPM workers, réplicas de lectura de MySQL, object cache Redis), cola/rate limit en el BFF si hace falta, y pruebas de estrés (§7) para conocer el techo real antes de una campaña.
- **Sesiones**: `Cart-Token` evita sesiones PHP en disco, ayuda a escalar horizontalmente el WP.
- **Gateway de pago**: límites de rate de Mercado Pago bajo picos — manejar reintentos/backoff y errores con gracia.
- **Webhooks de revalidación**: un pico de cambios podría inundar `/api/revalidate` — debounce/cola.

---

## 11. Módulo de búsqueda (motor dedicado)

La búsqueda es una función de e-commerce de primer nivel (convierte intención en venta), pero **no debe resolverse con GraphQL/MySQL**: un `LIKE %texto%` no escala, no tolera errores de tipeo, no rankea por relevancia ni soporta faceted search eficiente. La decisión de arquitectura es **externalizar la búsqueda a un motor especializado**, con WooCommerce como fuente de verdad y el motor como índice derivado.

### Elección del motor

| Motor | Modelo | Pros | Contras |
|---|---|---|---|
| **Typesense** ✅ *recomendado* | Open-source (self-host) o Typesense Cloud | Rápido, typo-tolerance, faceting, sinónimos, geosearch; API simple; **costo bajo**; control total del dato; librería InstantSearch compatible | Requiere operar el servicio (o pagar cloud); ecosistema menor que Algolia |
| **Algolia** | SaaS gestionado | DX/relevancia/merchandising de referencia; cero-ops; analytics de búsqueda integrada | **Caro a escala** (por operación/registro); dato fuera de tu infraestructura |
| **Meilisearch** | Open-source | Muy fácil de arrancar, buena relevancia por defecto | Faceting/analytics menos maduros que Typesense/Algolia a gran escala |
| **Elastic/OpenSearch** | Self-host/SaaS | Máxima potencia/flexibilidad | Ops pesado, sobredimensionado para catálogo de tienda |

**Recomendación: Typesense** — mejor relación potencia/costo/control para este caso, open-source (evita lock-in y costo por operación de Algolia), con typo-tolerance y faceting de primer nivel. **Algolia** queda como alternativa si se prioriza cero-ops y hay presupuesto. La arquitectura del módulo (`search.service.ts` detrás de una interfaz) **abstrae el proveedor** → cambiar de motor no toca la UI.

### Arquitectura de indexación (sincronización)

```
WooCommerce (fuente de verdad)
   │  producto creado/actualizado/eliminado, cambio de stock/precio
   ▼
Webhooks WooCommerce  ──►  Indexer (BFF Nitro /api/search/index  o  plugin WP)
   │                          - normaliza el producto al schema del índice
   │                          - upsert / delete en el motor
   ▼
Motor de búsqueda (Typesense)  ◄── bulk reindex inicial (job) para catálogo existente
   ▲
   │  query (search-only key, restringida)
Frontend módulo search/  ──►  as-you-type, facetas, autocomplete
```

- **Bulk inicial**: job que recorre todo el catálogo de WooCommerce y lo indexa (una vez, y bajo demanda para reindex completo).
- **Incremental**: los mismos webhooks de WooCommerce que disparan la revalidación de caché (§1) alimentan al indexer → índice siempre fresco sin reindexar todo.
- **Documento indexado** (por producto): `id`, `name`, `slug`, `description`/`shortDescription`, `price`, `salePrice`, `categories[]`, `attributes{}` (color, talle...), `image`, `stockStatus`, campos de ranking (ventas/featured). Se indexa solo lo necesario para resultados + facetas, no el producto completo.
- **Consistencia**: el motor es un índice derivado; ante discrepancia, WooCommerce manda. El precio/stock definitivo se revalida en add-to-cart (§1), igual que con las páginas cacheadas.

### Capacidades de UX que habilita
- **Búsqueda instantánea (as-you-type)** con debounce, resultados en < 50 ms.
- **Autocomplete / sugerencias** (productos + categorías + queries populares).
- **Faceted search**: filtrar por categoría, precio, atributos — con conteos por faceta, todo desde el motor (no en memoria como hoy en `shop.vue`).
- **Typo-tolerance** (“zapatila” → “zapatilla”), **sinónimos** (“celu” → “celular”), **ranking/merchandising** (promocionar productos, ordenar por relevancia/ventas).
- **Búsqueda vacía / descubrimiento**: el mismo motor puede servir el listado de `/shop` con facetas, unificando búsqueda y navegación de catálogo.

### Integración en el frontend (§3/§4)
- Módulo `search/`: `SearchBox`, `Autocomplete`, `SearchResults`, `Facets` (componentes); `useSearch`, `useAutocomplete`, `useFacets` (composables); `search.service.ts` (cliente del motor, **interfaz agnóstica del proveedor**); `useSearchStore` (query, filtros, resultados, paginación).
- **API key de solo-lectura restringida** en el frontend (Typesense/Algolia soportan search-only keys con scope) — nunca la admin key. La admin key vive solo en el indexer server-side.
- La búsqueda consulta el **motor directo** desde el cliente (baja latencia, no pega a WordPress); opción de proxy vía BFF si se quiere ocultar el proveedor por completo.

### Seguridad y operación
- Search-only key con scope (no permite escritura ni acceso a otros índices).
- Rate limiting en el edge para el endpoint de búsqueda si se proxy-fica.
- Reindex idempotente y monitoreado (alertar si el índice se desincroniza o el indexer falla — se suma a §6).
- Coste/observabilidad: métricas de búsquedas sin resultados (“no results”) → insumo de merchandising y de sinónimos.

---

## Próximos pasos

Este documento es de diseño; define la base antes de escribir código. El roadmap (§9) guía la implementación fase por fase: cada fase se planifica en detalle al iniciarla y deja el sistema desplegable y testeado antes de pasar a la siguiente. Complementa a `docs/mercadopago-headless-checkout.md`, que detalla la integración de pagos referida en la Fase 6.
