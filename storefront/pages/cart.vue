<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="cart-page__title animate-fade-in-up">Cart</h1>

      <!-- Empty -->
      <div v-if="items.length === 0" class="cart-page__empty animate-fade-in-up">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" x2="21" y1="6" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 style="font-size: var(--text-2xl); font-weight: 700;">Your cart is empty</h2>
        <p class="text-muted">Add some products to get started.</p>
        <NuxtLink to="/shop" class="btn btn--primary btn--lg">Continue Shopping</NuxtLink>
      </div>

      <!-- Cart contents -->
      <div v-else class="cart-page__layout">
        <div class="cart-page__items">
          <!-- Header -->
          <div class="cart-table__header hide-mobile">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          <!-- Items -->
          <div v-for="item in items" :key="item.key" class="cart-item animate-fade-in-up">
            <div class="cart-item__product">
              <NuxtLink :to="`/product/${item.product.slug}`" class="cart-item__image">
                <NuxtImg :src="item.product.image" :alt="item.product.name" loading="lazy" />
              </NuxtLink>
              <div class="cart-item__info">
                <NuxtLink :to="`/product/${item.product.slug}`" class="cart-item__name">{{ item.product.name }}</NuxtLink>
                <span class="cart-item__category">{{ item.product.category }}</span>
              </div>
            </div>

            <Price class="cart-item__price hide-mobile" :amount="item.product.price" />

            <div class="cart-item__quantity">
              <div class="qty-control">
                <button class="qty-control__btn" @click="updateQuantity(item.key, item.quantity - 1)">−</button>
                <span class="qty-control__value">{{ item.quantity }}</span>
                <button class="qty-control__btn" @click="updateQuantity(item.key, item.quantity + 1)">+</button>
              </div>
            </div>

            <Price class="cart-item__total hide-mobile" :amount="parseFloat(item.product.price) * item.quantity" />

            <button class="cart-item__remove" @click="removeFromCart(item.key)" aria-label="Remove item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>

            <!-- Mobile price -->
            <Price class="cart-item__mobile-price hide-desktop" :amount="parseFloat(item.product.price) * item.quantity" />
          </div>
        </div>

        <!-- Summary -->
        <div class="cart-page__summary animate-fade-in-up">
          <h3 class="summary__title">Order Summary</h3>

          <div class="summary__row">
            <span>Subtotal</span>
            <Price :amount="subtotal" />
          </div>
          <div class="summary__row">
            <span>Shipping</span>
            <span class="text-muted">Calculated at checkout</span>
          </div>

          <div class="divider" style="margin: var(--space-4) 0;"></div>

          <div class="summary__row summary__row--total">
            <span>Total</span>
            <Price :amount="subtotal" />
          </div>

          <NuxtLink to="/checkout" class="btn btn--primary btn--full btn--lg" style="margin-top: var(--space-6);">
            Proceed to Checkout
          </NuxtLink>

          <NuxtLink to="/shop" class="btn btn--outline btn--full" style="margin-top: var(--space-3);">
            Continue Shopping
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Cart — Store',
  meta: [{ name: 'description', content: 'Review your shopping cart.' }],
})

const { items, subtotal, updateQuantity, removeFromCart } = useCart()
</script>

<style scoped>
.cart-page {
  padding-top: calc(var(--header-height) + var(--space-12));
  padding-bottom: var(--space-16);
}

.cart-page__title {
  font-size: var(--text-5xl);
  font-weight: 800;
  margin-bottom: var(--space-10);
}

.cart-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-20) 0;
  text-align: center;
}

.cart-page__layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-10);
  align-items: start;
}

/* Table header */
.cart-table__header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 40px;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* Cart item */
.cart-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 40px;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item__product {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.cart-item__image {
  width: 80px;
  height: 96px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-bg-soft);
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__name {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: var(--leading-snug);
  transition: text-decoration var(--duration-fast) ease;
}

.cart-item__name:hover {
  text-decoration: underline;
}

.cart-item__category {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.cart-item__price,
.cart-item__total {
  font-size: var(--text-sm);
  font-weight: 600;
}

.cart-item__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  transition: color var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.cart-item__remove:hover {
  color: var(--color-error);
  background-color: var(--color-bg-soft);
}

.cart-item__mobile-price {
  grid-column: 1 / -1;
  text-align: right;
  font-weight: 600;
  font-size: var(--text-sm);
}

/* Quantity */
.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.qty-control__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: var(--text-base);
  color: var(--color-text);
  transition: background-color var(--duration-fast) ease;
}

.qty-control__btn:hover {
  background-color: var(--color-bg-soft);
}

.qty-control__value {
  width: 32px;
  text-align: center;
  font-size: var(--text-sm);
  font-weight: 600;
}

/* Summary */
.cart-page__summary {
  background-color: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  position: sticky;
  top: calc(var(--header-height) + var(--space-6));
}

.summary__title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-6);
}

.summary__row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  margin-bottom: var(--space-3);
}

.summary__row--total {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .cart-page__layout {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 1fr auto auto;
    gap: var(--space-3);
  }

  .cart-item__product {
    grid-column: 1 / -1;
  }
}
</style>
