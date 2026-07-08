<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <span class="footer__logo">STORE</span>
          <p class="footer__tagline">Curated goods for considered living.</p>
        </div>

        <div class="footer__links">
          <div class="footer__col">
            <h4 class="footer__heading">Shop</h4>
            <NuxtLink to="/shop" class="footer__link">All Products</NuxtLink>
            <NuxtLink to="/shop?category=furniture" class="footer__link">Furniture</NuxtLink>
            <NuxtLink to="/shop?category=lighting" class="footer__link">Lighting</NuxtLink>
            <NuxtLink to="/shop?category=decor" class="footer__link">Decor</NuxtLink>
          </div>
          <div class="footer__col">
            <h4 class="footer__heading">Info</h4>
            <a href="#" class="footer__link">About</a>
            <a href="#" class="footer__link">Shipping</a>
            <a href="#" class="footer__link">Returns</a>
            <a href="#" class="footer__link">Contact</a>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="footer__bottom">
        <p class="footer__copy">&copy; {{ new Date().getFullYear() }} Store. All rights reserved.</p>
        <div class="footer__social">
          <a href="#" aria-label="Instagram" class="footer__social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a href="#" aria-label="Twitter" class="footer__social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-bg-soft);
  padding: var(--space-16) 0 var(--space-8);
  margin-top: var(--space-20);
}

.footer__top {
  display: flex;
  justify-content: space-between;
  gap: var(--space-12);
  padding-bottom: var(--space-10);
  flex-wrap: wrap;
}

.footer__brand {
  max-width: 280px;
}

.footer__logo {
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: var(--tracking-widest);
}

.footer__tagline {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.footer__links {
  display: flex;
  gap: var(--space-16);
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer__heading {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.footer__link {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  transition: color var(--duration-fast) ease;
}

.footer__link:hover {
  color: var(--color-text);
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.footer__copy {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.footer__social {
  display: flex;
  gap: var(--space-4);
}

.footer__social-link {
  color: var(--color-text-muted);
  transition: color var(--duration-fast) ease;
}

.footer__social-link:hover {
  color: var(--color-text);
}

@media (max-width: 767px) {
  .footer__top {
    flex-direction: column;
    gap: var(--space-8);
  }

  .footer__links {
    gap: var(--space-10);
  }
}
</style>
