<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

defineProps<{
    relatedProducts: ProductDTO[]
    pending?: boolean
    error?: boolean
}>()

const emit = defineEmits<{
    retry: []
}>()
</script>

<template>
    <ProductPageProductRail
        :products="relatedProducts"
        :pending="pending"
        :error="error"
        eyebrow="Related products"
        title="More from the same "
        highlighted-title="shopping lane"
        description="Picked from the same category so the next suggestion still feels aligned with what you are viewing now."
        rail-label="Related products"
        error-message="Related products could not be loaded."
        empty-message="No related products are available right now."
        cta-to="/special-offers"
        cta-label="Explore more picks"
        @retry="emit('retry')"
    />
</template>
