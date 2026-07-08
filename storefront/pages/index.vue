<template>
  <div class="kylie-layout">
    <!-- Edge to Edge Hero -->
    <section class="hero-kylie">
      <div class="hero-kylie__image-container">
        <NuxtImg
          src="https://images.unsplash.com/photo-1617220556200-f94dff9c20a6?w=1200&h=1600&fit=crop"
          alt="Campaign Hero"
          class="hero-kylie__image"
          loading="eager"
          preload
          sizes="100vw"
        />
        <div class="hero-kylie__overlay"></div>
      </div>
      <div class="hero-kylie__content animate-fade-in-up">
        <h1 class="hero-kylie__title">THE<br/>NEW NUDES</h1>
        <NuxtLink to="/shop" class="btn-kylie btn-kylie--white">SHOP NOW</NuxtLink>
      </div>
    </section>

    <!-- Categories Mobile Scroller -->
    <section class="section-kylie bg-pale">
      <div class="kylie-header">
        <h2 class="kylie-title-sm">SHOP BY CATEGORY</h2>
      </div>
      <div class="kylie-scroller">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/shop?category=${cat.slug}`"
          class="kylie-cat-card"
        >
          <div class="kylie-cat-image-wrap">
            <NuxtImg :src="cat.image" :alt="cat.name" loading="lazy" sizes="200px md:280px" />
          </div>
          <span class="kylie-cat-name">{{ cat.name }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section-kylie">
      <div class="kylie-header">
        <h2 class="kylie-title-sm">BEST SELLERS</h2>
      </div>
      <div class="kylie-grid">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          class="animate-fade-in-up"
        />
      </div>
      <div class="kylie-center-action">
        <NuxtLink to="/shop" class="btn-kylie btn-kylie--outline">VIEW ALL</NuxtLink>
      </div>
    </section>

    <!-- Banner -->
    <section class="banner-kylie bg-pale">
      <div class="banner-kylie__content">
        <h2 class="banner-kylie__title">CLEAN & VEGAN</h2>
        <p class="banner-kylie__text">Formulated without parabens, sulfates, or phthalates. Always cruelty-free.</p>
        <NuxtLink to="/shop" class="btn-kylie btn-kylie--solid">DISCOVER MORE</NuxtLink>
      </div>
    </section>

    <!-- New Arrivals -->
    <section class="section-kylie">
      <div class="kylie-header">
        <h2 class="kylie-title-sm">JUST DROPPED</h2>
      </div>
      <div class="kylie-grid">
        <ProductCard
          v-for="product in newArrivals"
          :key="product.id"
          :product="product"
          class="animate-fade-in-up"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useWooNuxt } from '~/composables/useWooNuxt'

useHead({
  title: 'Store — Cosmetics',
  meta: [
    { name: 'description', content: 'Clean, vegan, and cruelty-free cosmetics.' },
  ],
})

const { getProducts, getCategories } = useWooNuxt()

const { data: categories } = await useAsyncData('categories', () => getCategories())
const { data: allProducts } = await useAsyncData('all-products', () => getProducts())

const featuredProducts = computed(() => allProducts.value?.filter(p => p.featured) || [])
const newArrivals = computed(() => allProducts.value?.filter(p => !p.featured).slice(0, 4) || [])
</script>

<style scoped>
.kylie-layout {
  width: 100%;
  overflow-x: hidden;
}

/* Kylie Hero */
.hero-kylie {
  position: relative;
  width: 100vw;
  height: 85vh;
  min-height: 600px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10vh;
}

.hero-kylie__image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.hero-kylie__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}

.hero-kylie__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%);
}

.hero-kylie__content {
  text-align: center;
  color: #fff;
  z-index: 1;
}

.hero-kylie__title {
  font-size: 52px;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: 0.05em;
  margin-bottom: 32px;
}

/* Typography & Sections */
.bg-pale {
  background-color: var(--color-bg-muted);
}

.section-kylie {
  padding: 60px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.kylie-header {
  text-align: center;
  margin-bottom: 40px;
}

.kylie-title-sm {
  font-size: 20px;
  font-weight: 300;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Buttons */
.btn-kylie {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 40px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-kylie--white {
  background-color: #fff;
  color: #000;
  border: 1px solid #fff;
}
.btn-kylie--white:hover {
  background-color: transparent;
  color: #fff;
}

.btn-kylie--outline {
  background-color: transparent;
  color: #000;
  border: 1px solid #000;
}
.btn-kylie--outline:hover {
  background-color: #000;
  color: #fff;
}

.btn-kylie--solid {
  background-color: #000;
  color: #fff;
  border: 1px solid #000;
}
.btn-kylie--solid:hover {
  background-color: transparent;
  color: #000;
}

/* Scroller */
.kylie-scroller {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 20px;
  scrollbar-width: none; /* Firefox */
}
.kylie-scroller::-webkit-scrollbar {
  display: none;
}

.kylie-cat-card {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #000;
}

.kylie-cat-image-wrap {
  width: 100%;
  aspect-ratio: 4 / 5;
  background-color: #eee;
  margin-bottom: 16px;
}
.kylie-cat-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kylie-cat-name {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Grids */
.kylie-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .kylie-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.kylie-center-action {
  margin-top: 40px;
  text-align: center;
}

/* Banner Inline */
.banner-kylie {
  padding: 80px 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.banner-kylie__content {
  max-width: 600px;
}

.banner-kylie__title {
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.banner-kylie__text {
  font-size: 15px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 32px;
}

/* Mobile Adjustments */
@media (max-width: 767px) {
  .hero-kylie__title {
    font-size: 40px;
  }
  .section-kylie {
    padding: 40px 10px;
  }
  .kylie-cat-card {
    flex: 0 0 200px;
  }
}
</style>
