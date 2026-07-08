<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div v-if="isDrawerOpen" class="overlay" @click="closeDrawer"></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="drawer">
    <aside v-if="isDrawerOpen" class="drawer" role="dialog" aria-label="Shopping cart">
      <div class="drawer__header">
        <h2 class="drawer__title">Cart <span class="text-muted">({{ itemCount }})</span></h2>
        <button class="drawer__close" @click="closeDrawer" aria-label="Close cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="items.length === 0" class="drawer__empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" x2="21" y1="6" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Your cart is empty</p>
        <NuxtLink to="/shop" class="btn btn--primary" @click="closeDrawer">Continue Shopping</NuxtLink>
      </div>

      <!-- Items -->
      <div v-else class="drawer__items">
        <div v-for="item in items" :key="item.product.id" class="drawer__item">
          <NuxtLink :to="`/product/${item.product.slug}`" class="drawer__item-image" @click="closeDrawer">
            <img :src="item.product.image" :alt="item.product.name" />
          </NuxtLink>
          <div class="drawer__item-info">
            <NuxtLink :to="`/product/${item.product.slug}`" class="drawer__item-name" @click="closeDrawer">
              {{ item.product.name }}
            </NuxtLink>
            <span class="drawer__item-price">{{ formatPrice(item.product.price) }}</span>
            <div class="drawer__item-actions">
              <div class="drawer__qty">
                <button class="drawer__qty-btn" @click="updateQuantity(item.product.id, item.quantity - 1)" aria-label="Decrease quantity">−</button>
                <span class="drawer__qty-value">{{ item.quantity }}</span>
                <button class="drawer__qty-btn" @click="updateQuantity(item.product.id, item.quantity + 1)" aria-label="Increase quantity">+</button>
              </div>
              <button class="drawer__remove" @click="removeFromCart(item.product.id)" aria-label="Remove item">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="items.length > 0" class="drawer__footer">
        <div class="drawer__subtotal">
          <span>Subtotal</span>
          <span class="font-bold">{{ formatPrice(subtotal) }}</span>
        </div>
        <p class="drawer__shipping-note">Shipping calculated at checkout</p>
        <button class="btn btn--primary btn--full btn--lg" @click="goToCheckout">Checkout</button>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const { items, itemCount, subtotal, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart } = useCart()
const { formatPrice } = useCurrency()

function goToCheckout() {
  if (items.value.length === 0) return
  
  // Close drawer and navigate to local Nuxt checkout page
  closeDrawer()
  navigateTo('/checkout')
}
</script>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background-color: var(--color-bg);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.drawer__title {
  font-size: var(--text-lg);
  font-weight: 700;
}

.drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  color: var(--color-text);
  transition: background-color var(--duration-fast) ease;
}

.drawer__close:hover {
  background-color: var(--color-bg-soft);
}

/* Empty */
.drawer__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  color: var(--color-text-muted);
}

/* Items */
.drawer__items {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-6);
}

.drawer__item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}

.drawer__item + .drawer__item {
  border-top: 1px solid var(--color-border);
}

.drawer__item-image {
  width: 80px;
  height: 96px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-bg-soft);
}

.drawer__item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawer__item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.drawer__item-name {
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: var(--leading-snug);
  margin-bottom: var(--space-1);
}

.drawer__item-name:hover {
  text-decoration: underline;
}

.drawer__item-price {
  font-size: var(--text-sm);
  color: var(--color-text-soft);
  margin-bottom: var(--space-3);
}

.drawer__item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.drawer__qty {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.drawer__qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: var(--text-base);
  color: var(--color-text);
  transition: background-color var(--duration-fast) ease;
}

.drawer__qty-btn:hover {
  background-color: var(--color-bg-soft);
}

.drawer__qty-value {
  width: 32px;
  text-align: center;
  font-size: var(--text-sm);
  font-weight: 600;
}

.drawer__remove {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-decoration: underline;
  transition: color var(--duration-fast) ease;
}

.drawer__remove:hover {
  color: var(--color-error);
}

/* Footer */
.drawer__footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.drawer__subtotal {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}

.drawer__shipping-note {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

/* Transitions */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--duration-normal) ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.drawer-enter-active {
  animation: slideInRight var(--duration-slow) var(--ease-out);
}

.drawer-leave-active {
  animation: slideOutRight var(--duration-normal) ease;
}
</style>
