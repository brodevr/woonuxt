<template>
  <div class="search-page">
    <div class="container">
      <div class="search-page__header animate-fade-in-up">
        <h1 class="search-page__title">
          <template v-if="q">Results for “{{ q }}”</template>
          <template v-else>Search</template>
        </h1>
        <p class="search-page__count">{{ result?.total ?? 0 }} products</p>
      </div>

      <div class="search-page__layout">
        <!-- Facets -->
        <aside class="search-page__facets hide-mobile">
          <div class="filter-group">
            <h3 class="filter-group__title">Category</h3>
            <div class="filter-group__options">
              <NuxtLink
                class="filter-option"
                :class="{ 'filter-option--active': !category }"
                :to="linkTo({ category: undefined })"
              >
                <span>All</span>
                <span class="filter-option__count">{{ result?.total ?? 0 }}</span>
              </NuxtLink>
              <NuxtLink
                v-for="facet in result?.facets.categories || []"
                :key="facet.value"
                class="filter-option"
                :class="{ 'filter-option--active': category === facet.value }"
                :to="linkTo({ category: facet.value })"
              >
                <span>{{ facet.label }}</span>
                <span class="filter-option__count">{{ facet.count }}</span>
              </NuxtLink>
            </div>
          </div>

          <div class="filter-group">
            <h3 class="filter-group__title">Sort</h3>
            <div class="filter-group__options">
              <NuxtLink
                v-for="opt in sortOptions"
                :key="opt.value"
                class="filter-option"
                :class="{ 'filter-option--active': sort === opt.value }"
                :to="linkTo({ sort: opt.value })"
              >
                <span>{{ opt.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div class="search-page__results">
          <div v-if="result && result.hits.length" class="product-grid stagger">
            <ProductCard
              v-for="product in result.hits"
              :key="product.id"
              :product="product"
              class="animate-fade-in-up"
            />
          </div>

          <div v-else class="search-page__empty">
            <p v-if="q">No products match “{{ q }}”.</p>
            <p v-else>Type a search above to find products.</p>
            <NuxtLink to="/shop" class="btn btn--outline">Browse all products</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchSort } from '~/modules/search/types'

const route = useRoute()
const { search } = useSearch()

useHead({ title: 'Search — Store' })

const q = computed(() => (route.query.q as string) || '')
const category = computed(() => (route.query.category as string) || '')
const sort = computed<SearchSort>(() => ((route.query.sort as SearchSort) || 'relevance'))

const sortOptions: { label: string; value: SearchSort }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
]

// Build a /search link that preserves current params and overrides some.
function linkTo(overrides: { category?: string; sort?: SearchSort }) {
  const query: Record<string, string> = {}
  if (q.value) query.q = q.value
  const nextCategory = 'category' in overrides ? overrides.category : category.value
  const nextSort = overrides.sort ?? sort.value
  if (nextCategory) query.category = nextCategory
  if (nextSort && nextSort !== 'relevance') query.sort = nextSort
  return { path: '/search', query }
}

const { data: result } = await useAsyncData(
  () => `search-${q.value}-${category.value}-${sort.value}`,
  () =>
    search({
      query: q.value,
      filters: { category: category.value || undefined },
      sort: sort.value,
      page: 1,
    }),
  { watch: [q, category, sort] },
)
</script>

<style scoped>
.search-page {
  padding-top: calc(var(--header-height) + var(--space-12));
  padding-bottom: var(--space-16);
}

.search-page__header {
  margin-bottom: var(--space-10);
}

.search-page__title {
  font-size: var(--text-4xl);
  font-weight: 800;
}

.search-page__count {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.search-page__layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-10);
}

.search-page__results {
  min-width: 0;
}

.filter-group {
  margin-bottom: var(--space-8);
}

.filter-group__title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
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
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
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

.search-page__empty {
  text-align: center;
  padding: var(--space-16) 0;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

@media (max-width: 767px) {
  .search-page__layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
