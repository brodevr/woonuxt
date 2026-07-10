<template>
  <div v-if="product" class="product-page-kylie">
    <div class="kylie-p-layout">
      <!-- Image Half -->
      <div class="kylie-p-image-wrap animate-fade-in">
        <NuxtImg :src="activeImage" :alt="product.name" class="kylie-p-img" sizes="100vw lg:55vw" />
        <span v-if="product.salePrice" class="kylie-p-sale">SALE</span>
      </div>

      <!-- Info Half -->
      <div class="kylie-p-info animate-fade-in-up">
        <div class="kylie-p-header">
          <NuxtLink :to="`/shop?category=${product.categorySlug}`" class="kylie-p-cat">
            {{ product.category }}
          </NuxtLink>
          <h1 class="kylie-p-name">{{ product.name }}</h1>
          <div class="kylie-p-price">
            <Price v-if="product.salePrice" class="price-old" :amount="product.regularPrice!" />
            <Price class="price-current" :amount="product.price" />
          </div>
        </div>

        <div class="kylie-p-divider"></div>

        <p class="kylie-p-desc">{{ product.description }}</p>

        <!-- Dummy Color Selector (Variation Support) -->
        <div class="kylie-p-variants">
          <span class="variant-label">SHADE: <strong>{{ selectedColor.name }}</strong></span>
          <div class="variant-swatches">
            <button
              v-for="color in colors"
              :key="color.name"
              class="swatch"
              :class="{ 'is-active': selectedColor.name === color.name }"
              :style="{ backgroundColor: color.hex }"
              @click="selectedColor = color"
              :aria-label="`Select shade ${color.name}`"
            ></button>
          </div>
        </div>

        <!-- Add to Cart -->
        <div class="kylie-p-actions">
          <div class="qty-selector">
            <button @click="quantity > 1 && quantity--" aria-label="Decrease">−</button>
            <span>{{ quantity }}</span>
            <button @click="quantity++" aria-label="Increase">+</button>
          </div>
          <button class="btn-kylie btn-kylie--solid btn-add" @click="handleAdd">
            ADD TO BAG
          </button>
        </div>

        <!-- Details Accordions (Static layout for Kylie vibe) -->
        <div class="kylie-p-details">
          <div class="detail-block">
            <h3>DETAILS</h3>
            <p>Our long-lasting formula provides an ultra-pigmented finish. Clean, Vegan, and Cruelty-Free.</p>
          </div>
          <div class="detail-block">
            <h3>SHIPPING & RETURNS</h3>
            <p>Free standard shipping on all orders over $200. 30-day return policy.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section class="kylie-related" v-if="relatedProducts.length">
      <h2 class="kylie-title-sm text-center" style="margin-bottom: 40px;">COMPLETE THE LOOK</h2>
      <div class="kylie-grid">
        <ProductCard
          v-for="p in relatedProducts"
          :key="p.id"
          :product="p"
        />
      </div>
    </section>
  </div>
  
  <!-- 404 -->
  <div v-else class="product-page-kylie not-found">
    <h2>Product not found</h2>
    <NuxtLink to="/shop" class="btn-kylie btn-kylie--solid">BACK TO SHOP</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useWooNuxt } from '~/composables/useWooNuxt'

const route = useRoute()
const { addToCart } = useCart()
const { getProduct, getProducts } = useWooNuxt()

// Reactive slug: Vue Router reuses this component across /product/[slug]
// navigations, so we key + watch on the param to refetch instead of reading
// it once at setup (which left related-product links showing stale data).
const slug = computed(() => route.params.slug as string)
const { data: product } = await useAsyncData(
  () => `product-${slug.value}`,
  () => getProduct(slug.value),
  { watch: [slug] },
)

// Structured per-product SEO. Reactive getters so tags follow the product.
// (Full Yoast head via the plugin's `fullYoastHead` field can layer on top
// once a live backend + head-string parser are wired — Phase 5/SEO work.)
useSeoMeta({
  title: () => (product.value ? `${product.value.name} — Cosmetics` : 'Product not found'),
  description: () =>
    product.value?.shortDescription || product.value?.description || '',
  ogType: 'website',
  ogTitle: () => product.value?.name || '',
  ogDescription: () => product.value?.shortDescription || '',
  ogImage: () => product.value?.image || '',
  twitterCard: 'summary_large_image',
  twitterTitle: () => product.value?.name || '',
  twitterImage: () => product.value?.image || '',
})

const activeImage = ref(product.value?.gallery[0] || product.value?.image || '')
const quantity = ref(1)

// Mock Colors for Variations
const colors = [
  { name: 'Koko K', hex: '#dca4a1' },
  { name: 'Candy K', hex: '#d29699' },
  { name: 'Posie K', hex: '#b35d70' },
  { name: 'Mary Jo K', hex: '#c01e35' },
]
const selectedColor = ref(colors[0])

// Reset view state when the product changes (component is reused across routes).
watch(product, (p) => {
  activeImage.value = p?.gallery[0] || p?.image || ''
  quantity.value = 1
  selectedColor.value = colors[0]
})

const { data: _allProducts } = await useAsyncData('related', () => getProducts())
const relatedProducts = computed(() => {
  if (!product.value || !_allProducts.value) return []
  return _allProducts.value
    .filter(p => p.categorySlug === product.value!.categorySlug && p.id !== product.value!.id)
    .slice(0, 4)
})

function handleAdd() {
  if (product.value) {
    // In a real setup, we would append the variation ID or meta data
    addToCart(product.value, quantity.value)
  }
}
</script>

<style scoped>
.product-page-kylie {
  background-color: #fff;
  min-height: 100vh;
}

.kylie-p-layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .kylie-p-layout {
    flex-direction: row;
    min-height: calc(100vh - 80px); /* header offset */
  }
}

/* Left: Image */
.kylie-p-image-wrap {
  width: 100%;
  position: relative;
  background-color: var(--color-bg-muted);
}

@media (min-width: 1024px) {
  .kylie-p-image-wrap {
    width: 55%;
    position: sticky;
    top: 80px;
    height: calc(100vh - 80px);
  }
}

.kylie-p-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.kylie-p-sale {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #000;
  color: #fff;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

/* Right: Info */
.kylie-p-info {
  width: 100%;
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .kylie-p-info {
    width: 45%;
    padding: 80px 60px;
    margin: 0;
  }
}

.kylie-p-cat {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
  text-decoration: none;
  display: block;
  margin-bottom: 12px;
}

.kylie-p-name {
  font-size: 32px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.kylie-p-price {
  font-size: 18px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.price-current {
  font-weight: 600;
}
.price-old {
  color: #999;
  text-decoration: line-through;
}

.kylie-p-divider {
  height: 1px;
  background-color: #eee;
  margin: 32px 0;
}

.kylie-p-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 32px;
}

/* Variants */
.kylie-p-variants {
  margin-bottom: 32px;
}
.variant-label {
  display: block;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.variant-label strong {
  font-weight: 600;
}

.variant-swatches {
  display: flex;
  gap: 12px;
}

.swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  padding: 0;
  position: relative;
  transition: all 0.2s;
}

.swatch.is-active::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 1px solid #000;
  border-radius: 50%;
}

/* Actions */
.kylie-p-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.qty-selector {
  display: flex;
  align-items: center;
  border: 1px solid #000;
  width: 120px;
}
.qty-selector button {
  width: 40px;
  height: 48px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.qty-selector span {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.btn-add {
  flex: 1;
  height: 50px;
}

/* Details */
.kylie-p-details {
  border-top: 1px solid #eee;
}
.detail-block {
  padding: 24px 0;
  border-bottom: 1px solid #eee;
}
.detail-block h3 {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.detail-block p {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* Related */
.kylie-related {
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.kylie-title-sm {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.1em;
}

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

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
.not-found h2 {
  font-size: 24px;
  font-weight: 300;
}

/* Button Global for Kylie */
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
.btn-kylie--solid {
  background-color: #000;
  color: #fff;
  border: 1px solid #000;
}
.btn-kylie--solid:hover {
  background-color: transparent;
  color: #000;
}
</style>
