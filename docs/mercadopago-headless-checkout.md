# Checkout headless con Mercado Pago vía WooCommerce Store API

**Estado:** propuesta / no implementado — documento de diseño para referencia futura.

## Problema

El checkout actual (`storefront/pages/checkout.vue`) está armado para llamar a un endpoint REST propio (`POST {WP}/wp-json/woonuxt/v1/process-payment`) que **no existe** en `wp-plugin/`. El plugin de WordPress instalado en este proyecto (`woonuxt-settings`) solo expone Stripe/PayPal vía GraphQL — no tiene nada de Mercado Pago. Fuera de "Demo Mode" (sin credenciales de MP), el checkout no tiene backend real que lo atienda.

Se evaluó cómo conectar el checkout embebido (Payment Brick de Mercado Pago, ya construido en Nuxt) con el **plugin oficial de WooCommerce para Mercado Pago** (`mercadopago/cart-woocommerce`) sin:
- Redirigir al usuario a una página hosteada por Mercado Pago (rompe la experiencia headless).
- Renderizar el bloque visual de checkout de WooCommerce (seguimos queriendo un checkout 100% custom en Nuxt).
- Reimplementar la lógica de cobro a mano (mantenimiento, PCI scope, riesgo de bugs).

## Hallazgo clave

WooCommerce core (no el plugin de MP) ya resuelve exactamente este problema mediante la **Store API** — la REST API pensada para consumo headless que usa internamente el bloque de Checkout. No hace falta renderizar ese bloque; se le puede pegar directo desde Nuxt.

El puente entre "petición REST" y "gateway de pago clásico" ya está resuelto por el propio core de WooCommerce, en `plugins/woocommerce/src/StoreApi/Legacy.php` (método `process_legacy_payment`):

```php
$_POST = $context->payment_data;
// ...
$gateway_result = $payment_method_object->process_payment( $context->order->get_id() );
```

`$context->payment_data` viene del campo `payment_data` del body de `POST /wc/store/v1/checkout` — documentado oficialmente:

> "The checkout block currently has legacy handling for payment processing. It converts incoming `payment_data` provided by the client-side payment method to `$_POST` and calls the payment gateway's `process_payment` function."
> — [Payment method integration (WooCommerce docs)](https://developer.woocommerce.com/docs/block-development/extensible-blocks/cart-and-checkout-blocks/checkout-payment-methods/payment-method-integration/)

Es decir: **no hace falta escribir ningún endpoint custom en `wp-plugin/`**. Alcanza con llamar al endpoint estándar de WooCommerce (`/wc/store/v1/checkout`) con el `payment_method` y `payment_data` correctos, y WooCommerce invoca el gateway real de Mercado Pago (`CustomGateway`, del plugin oficial) exactamente como si fuera un checkout clásico.

### Por qué es menos frágil que un bridge propio

| | Bridge PHP propio (descartado) | Store API (propuesto) |
|---|---|---|
| Quién arma `$_POST` | Código nuestro, copiando comportamiento interno no documentado de `CustomGateway`/`Form::sanitizedPostData` | El core de WooCommerce (`StoreApi/Legacy.php`), contrato público y estable |
| Riesgo ante updates | Alto — MP puede cambiar internals sin aviso | Bajo — mientras el plugin siga registrado como Blocks-compatible (`CustomBlock.php`, confirmado que existe), la traducción la sigue haciendo Woo core |
| Código nuevo a mantener | Un controller REST completo en PHP | Ninguno — solo llamadas HTTP desde Nuxt |

Confirmado además que el plugin de MP ya tiene una integración Blocks para el checkout embebido (`src/Blocks/CustomBlock.php extends AbstractPaymentMethodType`), y que esa clase **no reimplementa el pago** — solo registra metadata/scripts y deja que WooCommerce core invoque el mismo `CustomGateway::process_payment()` de siempre. Esto confirma que el plugin fue diseñado sabiendo que se puede llegar a él por esta vía.

## Gateway y campos confirmados (código fuente real de `mercadopago/cart-woocommerce`)

- ID del gateway: **`woo-mercado-pago-custom`** (`CustomBlock.php`, propiedad `$name`).
- `CustomGateway::proccessPaymentInternal()` → `getCheckoutFormData()` espera `$_POST['mercadopago_custom']` como **array PHP nativo** (no JSON) con:
  - `token` — lo devuelve el Payment Brick en el navegador.
  - `amount` — debe matchear el total real de la orden (validar server-side, no confiar en el cliente).
  - `payment_method_id` — lo devuelve el Brick.
  - `installments` — lo devuelve el Brick.
  - `issuer` — issuer_id de la tarjeta, lo devuelve el Brick.
  - `doc_type` / `doc_number` — DNI/CUIT del pagador (formulario de checkout).
  - `customer_id` (opcional) — si se guardan tarjetas.
- `AbstractGateway::process_payment()` también lee por separado `$_POST['mercadopago_checkout_session']` (fraud prevention / device fingerprint). Como `$_POST = $context->payment_data` **reemplaza** `$_POST` entero (no lo mergea), hay que incluir esta key también dentro del mismo array `payment_data`.
- El email/payer se toma de la `WC_Order` (billing), no hace falta mandarlo en `payment_data`.

## Flujo propuesto end-to-end

```
1. GET  /wc/store/v1/cart                         → guardar header "Cart-Token"
2. POST /wc/store/v1/cart/add-item (x N)           → con header Cart-Token
3. PUT  /wc/store/v1/checkout (o /cart/update-*)   → setear billing/shipping address y shipping method
4. [cliente] Payment Brick de MP genera "token" con el total ya confirmado por Woo
5. POST /wc/store/v1/checkout                      → body:
   {
     "billing_address": { ... },
     "payment_method": "woo-mercado-pago-custom",
     "payment_data": [
       { "key": "mercadopago_custom", "value": {
           "token": "...", "amount": "...", "payment_method_id": "...",
           "installments": "...", "issuer": "...",
           "doc_type": "...", "doc_number": "..."
       }},
       { "key": "mercadopago_checkout_session", "value": { ...fingerprint... } }
     ]
   }
6. Respuesta trae payment_result.payment_status / redirect_url (no debería requerir redirect en el flujo embebido)
```

Todo esto sin salir nunca del dominio del storefront ni renderizar ningún bloque de WordPress — Nuxt sigue siendo dueño de la UI al 100%.

## Abierto / por confirmar antes de implementar

1. **Shape exacto de `mercadopago_checkout_session`** — qué datos genera el SDK `sdk.mercadopago.com/js/v2` (ya cargado globalmente en `nuxt.config.ts`) para device fingerprint / prevención de fraude, y cómo se lee del lado cliente.
2. **CORS del `Cart-Token`** — la Store API lo expone en CORS desde WooCommerce 9.8; confirmar la versión de WooCommerce que se va a usar en el WordPress real, dado que Nuxt y WP corren en dominios distintos.
3. **Validación de `amount`** — no confiar en el total que manda el cliente; habría que verificar server-side (hook `woocommerce_rest_checkout_process_payment_with_context` o similar) que `amount` matchea `$order->get_total()` antes de dejar pasar el pago, para evitar manipulación del monto desde el navegador.
4. **Versión del plugin oficial de MP a instalar** — confirmar que la versión que se instale en el WP real siga trayendo `CustomBlock.php` / soporte Blocks (se validó contra la rama `main` del repo público a jul-2026).
5. Reemplazar en `checkout.vue` el `preferenceId: '<PREFERENCE_ID>'` hardcodeado y el `$fetch` al endpoint inexistente `/wp-json/woonuxt/v1/process-payment` por las llamadas a la Store API descritas arriba.

## Referencias

- [mercadopago/cart-woocommerce (repo oficial del plugin)](https://github.com/mercadopago/cart-woocommerce)
- [`CustomGateway.php`](https://raw.githubusercontent.com/mercadopago/cart-woocommerce/main/src/Gateways/CustomGateway.php)
- [`AbstractGateway.php`](https://raw.githubusercontent.com/mercadopago/cart-woocommerce/main/src/Gateways/AbstractGateway.php)
- [`Form.php` (sanitizedPostData)](https://raw.githubusercontent.com/mercadopago/cart-woocommerce/main/src/Helpers/Form.php)
- [`CustomTransaction.php`](https://raw.githubusercontent.com/mercadopago/cart-woocommerce/main/src/Transactions/CustomTransaction.php)
- [`CustomBlock.php`](https://raw.githubusercontent.com/mercadopago/cart-woocommerce/main/src/Blocks/CustomBlock.php)
- [WooCommerce Store API — Checkout endpoint](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/)
- [WooCommerce Store API — Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/)
- [Payment method integration (WooCommerce docs)](https://developer.woocommerce.com/docs/block-development/extensible-blocks/cart-and-checkout-blocks/checkout-payment-methods/payment-method-integration/)
- [`StoreApi/Legacy.php` — code reference](https://woocommerce.github.io/code-reference/files/woocommerce-src-storeapi-legacy.html)
