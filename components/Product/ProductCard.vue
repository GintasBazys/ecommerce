<script setup lang="ts">
import type { Product } from "@medusajs/medusa"
const { product } = defineProps<{
    product: Product
}>()

const firstVariant = computed(() => {
    return product.variants[0] || null
})

const computedPrice = computed(() => {
    return firstVariant.value ? formatCurrency(firstVariant.value.prices[0].amount, firstVariant.value.prices[0].currency_code) : "N/A"
})
</script>

<template>
    <article class="product-card">
        <div class="w-full">
            <NuxtLink href="#">
                <NuxtImg
                    class="w-100 object-fit-cover max-h-236"
                    format="webp"
                    :src="product.thumbnail ?? ''"
                    alt="Product Image"
                    width="236"
                    height="236"
                    :placeholder="[236, 236, 75, 5]"
                />
            </NuxtLink>
        </div>
        <div class="pt-6">
            <NuxtLink :to="product.handle ? '/product/' + product.handle : '#'">
                <strong>
                    {{ product.title }}
                </strong>
            </NuxtLink>
            <p class="description">{{ product.description }}</p>

            <div class="price-wrapper">
                <div class="d-flex flex-column">
                    <div class="inner-price">
                        <p class="price fw-bold mb-0">{{ computedPrice }}</p>
                    </div>
                    <span class="text-small-2">Option: {{ firstVariant.title }}</span>
                </div>
                <button type="button" class="btn quick-add-btn" />
            </div>
        </div>
    </article>
</template>
