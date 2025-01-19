<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"
import { ref, computed } from "vue"
import { formatCurrency } from "@/utils/formatCurrency"
import { debounce } from "lodash"

const { product } = defineProps<{
    product: ProductDTO
}>()

const cartStore = useCartStore()
const loading = ref<boolean>(false)

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

const addToCart = async () => {
    loading.value = true
    if (!selectedVariant.value) {
        return
    }
    await cartStore.updateLineItem(selectedVariant.value)
    loading.value = false
    window.scrollTo(0, 0)
}

const debouncedAddToCart = debounce(addToCart, 300)
</script>

<template>
    <article class="product-card">
        <div class="w-full">
            <NuxtLink :to="product.handle ? `${PRODUCT_URL_HANDLE}/` + product.handle : '#'">
                <NuxtImg
                    class="w-100 object-fit-cover"
                    format="webp"
                    :src="product.thumbnail || product.images[0]?.url || '/images/placeholder.png'"
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
                    :disabled="!Boolean(selectedVariant?.inventory_quantity) || loading"
                    @click="debouncedAddToCart"
                >
                    <div v-if="loading" class="spinner-border spiner-border-sm text-white" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span v-else class="cart-btn-icon"></span>
                </button>
            </div>
        </div>
    </article>
</template>
