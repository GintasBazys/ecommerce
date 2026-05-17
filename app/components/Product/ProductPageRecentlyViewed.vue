<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

defineProps<{
    products: ProductDTO[]
    pending?: boolean
    error?: boolean
}>()

const emit = defineEmits<{
    retry: []
}>()
</script>

<template>
    <ProductPageProductRail
        v-if="pending || error || products.length"
        :products="products"
        :pending="pending"
        :error="error"
        eyebrow="Recently viewed"
        title="Pick up where "
        highlighted-title="you left off"
        description="Return to products you viewed earlier and compare details before you add your final choice to cart."
        rail-label="Recently viewed products"
        error-message="Recently viewed products could not be loaded."
        @retry="emit('retry')"
    />
</template>
