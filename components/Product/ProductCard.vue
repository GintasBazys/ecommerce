<script setup lang="ts">
import type { Product } from "@medusajs/medusa"
import { ref, computed } from "vue"
import { formatCurrency } from "@/utils/formatCurrency"

const { product } = defineProps<{
    product: Product
}>()

interface SimpleProductVariant {
    id: string
    title: string
    calculated_price: {
        calculated_amount: number
        currency_code: string
    }
    inventory_quantity: number
}
//@ts-expect-error recently released medusa 2.0 with breaking changes
const selectedVariant = ref<SimpleProductVariant | null>(product.variants ? product.variants[0] : null)

const computedPrice = computed(() => {
    if (
        selectedVariant.value &&
        selectedVariant.value.calculated_price &&
        selectedVariant.value.calculated_price.calculated_amount !== undefined
    ) {
        const { calculated_amount, currency_code } = selectedVariant.value.calculated_price
        return formatCurrency(calculated_amount, currency_code)
    }
    return "N/A"
})

const cartStore = useCartStore()
const isLoading = ref(false)

const addToCart = async () => {
    if (!cartStore.cart || !selectedVariant.value) {
        return
    }
    if (selectedVariant.value.inventory_quantity <= 0) {
        return
    }

    isLoading.value = true
    try {
        const existingItem = cartStore.cart.items?.find((item) => item.variant_id === selectedVariant.value?.id)
        const quantityToUpdate = existingItem?.quantity ? existingItem.quantity + 1 : 1
        await cartStore.updateLineItem(cartStore.cart.id, selectedVariant.value.id, quantityToUpdate)
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
            <NuxtLink :to="product.handle ? `${PRODUCT_URL_HANDLE}/` + product.handle : '#'">
                <NuxtImg
                    class="w-100 object-fit-cover"
                    format="webp"
                    :src="product.images[0].url || '/images/placeholder.png'"
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
                    <span class="text-small-2">Option: {{ selectedVariant?.title || "No options available" }}</span>
                </div>
                <button
                    type="button"
                    class="btn quick-add-btn"
                    :disabled="isLoading || (selectedVariant?.inventory_quantity ?? 0) <= 0"
                    @click="addToCart"
                >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
                    <span v-if="!isLoading" class="cart-btn-icon"></span>
                </button>
            </div>
        </div>
    </article>
</template>
