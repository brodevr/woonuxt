<template>
  <div class="shop-page">
    <div class="container">
      <!-- Page header -->
      <div class="shop-page__header animate-fade-in-up">
        <h1 class="shop-page__title">Shop</h1>
        <p class="shop-page__count">{{ filteredProducts.length }} products</p>
      </div>

      <div class="shop-page__layout">
        <!-- Filters sidebar -->
        <aside class="shop-page__filters hide-mobile">
          <!-- Categories -->
          <div class="filter-group">
            <h3 class="filter-group__title">Category</h3>
            <div class="filter-group__options">
              <label
                class="filter-option"
                :class="{ 'filter-option--active': !activeCategory }"
              >
                <input type="radio" name="category" :checked="!activeCategory" @change="activeCategory = ''" />
                <span>All</span>
                <span class="filter-option__count">{{ allProducts.length }}</span>
              </label>
              <label
                v-for="cat in categories"
                :key="cat.slug"
                class="filter-option"
                :class="{ 'filter-option--active': activeCategory === cat.slug }"
              >
                <input type="radio" name="category" :checked="activeCategory === cat.slug" @change="activeCategory = cat.slug" />
                <span>{{ cat.name }}</span>
                <span class="filter-option__count">{{ cat.count }}</span>
              </label>
            </div>
          </div>

          <!-- Price range -->
          <div class="filter-group">
            <h3 class="filter-group__title">Price Range</h3>
            <div class="filter-group__options">
              <label
                v-for="range in priceRanges"
                :key="range.label"
                class="filter-option"
                :class="{ 'filter-option--active': activePriceRange === range.label }"
              >
                <input type="radio" name="price" :checked="activePriceRange === range.label" @change="activePriceRange = range.label" />
                <span>{{ range.label }}</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Mobile filter bar -->
        <div class="shop-page__mobile-bar hide-desktop">
          <select v-model="activeCategory" class="input" style="flex: 1;">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
          </select>
          <select v-model="sortBy" class="input" style="flex: 1;">
            <option value="default">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <!-- Products -->
        <div class="shop-page__products">
          <!-- Sort bar (desktop) -->
          <div class="shop-page__sort hide-mobile">
            <span class="text-sm text-muted">Sort by</span>
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="sort-btn"
              :class="{ 'sort-btn--active': sortBy === opt.value }"
              @click="sortBy = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- Grid -->
          <div class="product-grid stagger">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              class="animate-fade-in-up"
            />
          </div>

          <!-- Empty state -->
          <div v-if="filteredProducts.length === 0" class="shop-page__empty">
            <p>No products found matching your filters.</p>
            <button class="btn btn--outline" @click="resetFilters">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWooNuxt } from '~/composables/useWooNuxt'

useHead({
  title: 'Shop — Store',
  meta: [
    { name: 'description', content: 'Browse our full collection of furniture, lighting, decor and textiles.' },
  ],
})

const route = useRoute()
const { getProducts, getCategories } = useWooNuxt()

const { data: _products } = await useAsyncData('all-products', () => getProducts())
const { data: _categories } = await useAsyncData('categories', () => getCategories())

const allProducts = computed(() => _products.value || [])
const categories = computed(() => _categories.value || [])


const activeCategory = ref((route.query.category as string) || '')
const activePriceRange = ref('All')
const sortBy = ref('default')

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 – $300', min: 100, max: 300 },
  { label: '$300 – $500', min: 300, max: 500 },
  { label: '$500+', min: 500, max: Infinity },
]

const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Price ↑', value: 'price-asc' },
  { label: 'Price ↓', value: 'price-desc' },
  { label: 'Name', value: 'name' },
]

const filteredProducts = computed(() => {
  let products = [...allProducts.value]

  // Category filter
  if (activeCategory.value) {
    products = products.filter(p => p.categorySlug === activeCategory.value)
  }

  // Price filter
  const range = priceRanges.find(r => r.label === activePriceRange.value)
  if (range && range.label !== 'All') {
    products = products.filter(p => {
      const price = parseFloat(p.price)
      return price >= range.min && price < range.max
    })
  }

  // Sort
  if (sortBy.value === 'price-asc') {
    products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  } else if (sortBy.value === 'price-desc') {
    products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
  } else if (sortBy.value === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name))
  }

  return products
})

function resetFilters() {
  activeCategory.value = ''
  activePriceRange.value = 'All'
  sortBy.value = 'default'
}
</script>

<style scoped>
.shop-page {
  padding-top: calc(var(--header-height) + var(--space-12));
  padding-bottom: var(--space-16);
}

.shop-page__header {
  margin-bottom: var(--space-10);
}

.shop-page__title {
  font-size: var(--text-5xl);
  font-weight: 800;
}

.shop-page__count {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.shop-page__layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-10);
}

.shop-page__products {
  min-width: 0;
}

/* Filters */
.filter-group {
  margin-bottom: var(--space-8);
}

.filter-group__title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.filter-group__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-soft);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
}

.filter-option input {
  display: none;
}

.filter-option:hover,
.filter-option--active {
  background-color: var(--color-bg-soft);
  color: var(--color-text);
}

.filter-option--active {
  font-weight: 600;
}

.filter-option__count {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Sort bar */
.shop-page__sort {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.sort-btn {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) ease;
}

.sort-btn:hover {
  color: var(--color-text);
}

.sort-btn--active {
  color: var(--color-text);
  background-color: var(--color-bg-soft);
  font-weight: 600;
}

/* Mobile */
.shop-page__mobile-bar {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.shop-page__empty {
  text-align: center;
  padding: var(--space-16) 0;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

@media (max-width: 767px) {
  .shop-page__layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
