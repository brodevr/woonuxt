<template>
  <div ref="root" class="search-box-wrap" @keydown.esc="close">
    <form class="search-box" role="search" @submit.prevent="onSubmit">
      <svg class="search-box__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        v-model="query"
        type="search"
        class="search-box__input"
        placeholder="Search products"
        aria-label="Search products"
        autocomplete="off"
        @focus="onFocus"
      />
    </form>

    <!-- Instant results -->
    <div v-if="open" class="suggest">
      <div v-if="loading && !results.length" class="suggest__state">Searching…</div>

      <template v-else-if="results.length">
        <ul class="suggest__list">
          <li v-for="s in results" :key="s.id">
            <NuxtLink :to="`/product/${s.slug}`" class="suggest__item" @click="onPick">
              <span class="suggest__thumb">
                <img v-if="s.image" :src="s.image" :alt="s.name" loading="lazy" />
              </span>
              <span class="suggest__name">{{ s.name }}</span>
              <span class="suggest__price" v-html="s.price" />
            </NuxtLink>
          </li>
        </ul>
        <button type="button" class="suggest__all" @click="onSubmit">
          See all results for “{{ query.trim() }}”
        </button>
      </template>

      <div v-else class="suggest__state">No products found for “{{ query.trim() }}”</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{ initial?: string }>()

const { query, results, loading, open, close } = useAutocomplete()
if (props.initial) query.value = props.initial

const root = ref<HTMLElement | null>(null)

function onSubmit() {
  const q = query.value.trim()
  close()
  navigateTo({ path: '/search', query: q ? { q } : {} })
}

function onFocus() {
  if (results.value.length) open.value = true
}

function onPick() {
  close()
}

// Close the dropdown when clicking outside the search box.
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    close()
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.search-box-wrap {
  position: relative;
  width: 100%;
  max-width: 260px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-bg);
  transition: border-color var(--duration-fast) ease;
  width: 100%;
}

.search-box:focus-within {
  border-color: var(--color-text);
}

.search-box__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-box__input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.search-box__input::placeholder {
  color: var(--color-text-muted);
}

/* Dropdown */
.suggest {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  min-width: 300px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 120;
  overflow: hidden;
}

.suggest__state {
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.suggest__list {
  max-height: 340px;
  overflow-y: auto;
}

.suggest__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  transition: background-color var(--duration-fast) ease;
}

.suggest__item:hover {
  background-color: var(--color-bg-soft);
}

.suggest__thumb {
  width: 40px;
  height: 48px;
  flex-shrink: 0;
  background-color: var(--color-bg-muted);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.suggest__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.suggest__name {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.suggest__price {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.suggest__all {
  display: block;
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-soft);
  text-align: center;
}

.suggest__all:hover {
  background-color: var(--color-bg-muted);
}
</style>
