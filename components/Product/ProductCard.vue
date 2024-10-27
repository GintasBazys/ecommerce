<script setup lang="ts">
import type { Product } from "@medusajs/medusa"
import { ref, computed } from "vue"
import { formatCurrency } from "@/utils/formatCurrency"

const { product } = defineProps<{
    product: Product
}>()

const firstVariant = computed(() => {
    return product?.variants ? product.variants[0] : null
})

const computedPrice = computed(() => {
    if (firstVariant.value && firstVariant.value.prices.length > 0) {
        return formatCurrency(firstVariant.value.prices[0].amount, firstVariant.value.prices[0].currency_code)
    }
    return "N/A"
})

const cartStore = useCartStore()
const isLoading = ref(false)

const addToCart = async () => {
    if (!cartStore.cart || !firstVariant.value) {
        console.error("Cart or variant not available.")
        return
    }

    isLoading.value = true
    try {
        const existingItem = cartStore.cart.items?.find((item) => item.variant_id === firstVariant?.value?.id)

        const quantityToUpdate = existingItem?.quantity ? existingItem.quantity + 1 : 1

        await cartStore.updateLineItem(cartStore.cart.id, firstVariant.value.id, quantityToUpdate)
    } catch (error) {
        console.error("Error updating cart:", error)
    } finally {
        isLoading.value = false
        window.scrollTo(0, 0)
    }
}
</script>

<template>
    <article class="product-card">
        <div class="w-full">
            <NuxtLink href="#">
                <NuxtImg
                    class="w-100 object-fit-cover max-h-236"
                    format="webp"
                    :src="product.thumbnail || '/images/placeholder.png'"
                    alt="Product Image"
                    width="236"
                    height="236"
                    :placeholder="[236, 236, 75, 5]"
                />
            </NuxtLink>
        </div>
        <div class="pt-6">
            <NuxtLink :to="product.handle ? `${PRODUCT_URL_HANDLE}/` + product.handle : '#'">
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
                    <span class="text-small-2">Option: {{ firstVariant?.title || "No options available" }}</span>
                </div>
                <button type="button" class="btn quick-add-btn" :disabled="isLoading" @click="addToCart">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
                    <span v-if="!isLoading" class="cart-btn-icon"></span>
                </button>
            </div>
        </div>
    </article>
</template>
