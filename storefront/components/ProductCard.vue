<template>
  <NuxtLink :to="`/product/${product.slug}`" class="product-card">
    <div class="product-card__image-wrap">
      <NuxtImg
        :src="product.image"
        :alt="product.name"
        class="product-card__image"
        loading="lazy"
        sizes="sm:50vw md:33vw lg:25vw"
      />
      <!-- Sale badge -->
      <span v-if="product.salePrice" class="product-card__sale-badge">Sale</span>
      <!-- Quick add -->
      <button
        class="product-card__quick-add"
        @click.prevent="handleQuickAdd"
        aria-label="Add to cart"
      >
        <span>Add to bag</span>
      </button>
    </div>
    <div class="product-card__info">
      <h3 class="product-card__name">{{ product.name }}</h3>
      <div class="product-card__price">
        <Price v-if="product.salePrice" class="product-card__price-old" :amount="product.regularPrice!" />
        <Price class="product-card__price-current" :amount="product.price" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Product } from '~/data/mock'

const props = defineProps<{
  product: Product
}>()

const { addToCart } = useCart()

function handleQuickAdd() {
  addToCart(props.product)
}
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

.product-card__image-wrap {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background-color: var(--color-bg-muted);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s var(--ease-out);
}

.product-card:hover .product-card__image {
  transform: scale(1.05);
}

.product-card__sale-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background-color: var(--color-error);
  color: #fff;
}

.product-card__quick-add {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background-color: rgba(255, 255, 255, 0.9);
  color: #000;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.product-card:hover .product-card__quick-add {
  opacity: 1;
  transform: translateY(0);
}

.product-card__quick-add:hover {
  background-color: #000;
  color: #fff;
}

.product-card__info {
  padding: var(--space-4) 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.product-card__name {
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1a1a1a;
}

.product-card__price {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.product-card__price-current {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.product-card__price-old {
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
}
</style>
