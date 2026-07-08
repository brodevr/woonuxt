<template>
  <header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="container header__inner">
      <!-- Logo -->
      <NuxtLink to="/" class="header__logo">
        <span class="header__logo-text">STORE</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="header__nav hide-mobile">
        <NuxtLink to="/" class="header__link">Home</NuxtLink>
        <NuxtLink to="/shop" class="header__link">Shop</NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="header__actions">
        <!-- Cart button -->
        <button class="header__cart-btn" @click="openDrawer" aria-label="Open cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" x2="21" y1="6" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="itemCount > 0" class="badge header__badge">{{ itemCount }}</span>
        </button>

        <!-- Mobile menu toggle -->
        <button class="header__menu-btn hide-desktop" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <Transition name="mobile-nav">
      <div v-if="mobileOpen" class="header__mobile-nav hide-desktop">
        <NuxtLink to="/" class="header__mobile-link" @click="mobileOpen = false">Home</NuxtLink>
        <NuxtLink to="/shop" class="header__mobile-link" @click="mobileOpen = false">Shop</NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { itemCount, openDrawer } = useCart()

const isScrolled = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: box-shadow var(--duration-normal) ease, background-color var(--duration-normal) ease;
}

.header--scrolled {
  box-shadow: 0 1px 0 var(--color-border);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header__logo {
  display: flex;
  align-items: center;
}

.header__logo-text {
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: var(--tracking-widest);
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.header__link {
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-soft);
  transition: color var(--duration-fast) ease;
  position: relative;
}

.header__link:hover,
.header__link.router-link-active {
  color: var(--color-text);
}

.header__link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 1.5px;
  background-color: var(--color-text);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header__cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  color: var(--color-text);
  transition: background-color var(--duration-fast) ease;
}

.header__cart-btn:hover {
  background-color: var(--color-bg-soft);
}

.header__badge {
  position: absolute;
  top: 4px;
  right: 2px;
}

.header__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--color-text);
}

/* Mobile nav */
.header__mobile-nav {
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.header__mobile-link {
  font-size: var(--text-lg);
  font-weight: 600;
  padding: var(--space-3) 0;
}

/* Mobile nav transition */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity var(--duration-fast) ease, transform var(--duration-fast) ease;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
