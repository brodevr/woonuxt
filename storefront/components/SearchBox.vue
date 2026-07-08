<template>
  <form class="search-box" role="search" @submit.prevent="onSubmit">
    <svg class="search-box__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
    <input
      v-model="term"
      type="search"
      class="search-box__input"
      placeholder="Search products"
      aria-label="Search products"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ initial?: string }>()
const term = ref(props.initial ?? '')

function onSubmit() {
  const q = term.value.trim()
  navigateTo({ path: '/search', query: q ? { q } : {} })
}
</script>

<style scoped>
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
  max-width: 260px;
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
</style>
