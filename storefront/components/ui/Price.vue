<template>
  <span>{{ formatted }}</span>
</template>

<script setup lang="ts">
/**
 * Price - shared UI primitive for rendering a formatted money amount.
 *
 * Single source of truth for price display: wraps useCurrency().formatPrice so
 * every surface renders money identically. The template is a single <span>
 * root, so any class passed by the caller is forwarded to it (Vue attribute
 * fallthrough) - adopting this in place of `{{ formatPrice(x) }}` produces
 * identical markup.
 */
import { computed } from 'vue'

const props = defineProps<{
  amount: string | number
}>()

const { formatPrice } = useCurrency()

const formatted = computed(() => formatPrice(props.amount))
</script>
