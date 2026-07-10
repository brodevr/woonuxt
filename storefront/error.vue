<template>
  <div class="error-page">
    <div class="error-page__content">
      <p class="error-page__code">{{ error.statusCode }}</p>
      <h1 class="error-page__title">{{ title }}</h1>
      <p class="error-page__message">{{ message }}</p>
      <div class="error-page__actions">
        <NuxtLink to="/" class="btn btn--primary btn--lg" @click="handleClear">Back home</NuxtLink>
        <NuxtLink to="/shop" class="btn btn--outline btn--lg" @click="handleClear">Browse shop</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Page not found' : 'Something went wrong'))
const message = computed(() =>
  isNotFound.value
    ? "The page you're looking for doesn't exist or has moved."
    : 'An unexpected error occurred. Please try again in a moment.',
)

useHead({ title: () => `${props.error.statusCode} — Store` })

function handleClear() {
  // Clear the error state so navigation proceeds to the target route.
  clearError({ redirect: undefined })
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background-color: var(--color-bg);
}

.error-page__content {
  text-align: center;
  max-width: 480px;
}

.error-page__code {
  font-size: var(--text-6xl);
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-tight);
}

.error-page__title {
  font-size: var(--text-3xl);
  font-weight: 800;
  margin-top: var(--space-4);
}

.error-page__message {
  color: var(--color-text-soft);
  margin-top: var(--space-4);
  line-height: var(--leading-relaxed);
}

.error-page__actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-8);
  flex-wrap: wrap;
}
</style>
