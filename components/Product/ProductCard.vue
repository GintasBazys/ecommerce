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
        original_amount: number
        currency_code: string
        calculated_price: {
            price_list_type: string
        }
    }
    inventory_quantity: number
}

//@ts-expect-error recently released medusa 2.0 with breaking changes
const selectedVariant = ref<SimpleProductVariant | null>(product.variants ? product.variants[0] : null)

const computedPrice = computed<number | string>(() => {
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

const isOnSale = computed<number | boolean>(() => {
    return (
        selectedVariant.value?.calculated_price.calculated_price.price_list_type === "sale" &&
        selectedVariant.value?.calculated_price.original_amount
    )
})

const originalPrice = computed<string | null>(() => {
    if (selectedVariant.value?.calculated_price.original_amount) {
        const { original_amount, currency_code } = selectedVariant.value.calculated_price
        return formatCurrency(original_amount, currency_code)
    }
    return null
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
    <VCard class="pa-4" elevation="2" rounded>
        <div class="d-flex justify-center align-center position-relative">
            <NuxtLink style="width: 100%" :to="product.handle ? `${PRODUCT_URL_HANDLE}/` + product.handle : '#'">
                <VImg
                    :src="product.thumbnail || product.images[0]?.url || '/images/placeholder.png'"
                    alt="Product Image"
                    height="236"
                    cover
                    class="mb-4 w-100"
                />
            </NuxtLink>

            <VChip v-if="isOnSale" color="red" text-color="white" class="position-absolute top-0 right-0 ma-2" label size="small">
                Sale
            </VChip>
        </div>

        <div>
            <NuxtLink :to="product.handle ? `${PRODUCT_URL_HANDLE}/` + product.handle : '#'">
                <div class="text-h6 font-weight-bold mb-2">{{ product.title }}</div>
            </NuxtLink>

            <p class="text-truncate text-body-2 mb-2">{{ product.description }}</p>

            <div class="d-flex justify-space-between align-start mt-4">
                <div>
                    <div class="text-subtitle-1 font-weight-bold">
                        {{ computedPrice }}
                        <template v-if="isOnSale">
                            <del class="text-error ms-2">{{ originalPrice }}</del>
                        </template>
                    </div>
                    <div class="text-caption mt-1">Option: {{ selectedVariant?.title || "No options available" }}</div>
                </div>

                <VBtn
                    icon
                    color="black"
                    :loading="loading"
                    :disabled="!selectedVariant?.inventory_quantity"
                    class="elevation-0"
                    @click="debouncedAddToCart"
                >
                    <template #loader>
                        <VProgressCircular indeterminate color="white" size="20" />
                    </template>
                    <VIcon>mdi-cart</VIcon>
                </VBtn>
            </div>
        </div>
    </VCard>
</template>

<style lang="scss" scoped>
.product-card {
    background: #fff;
    border-radius: 0.1875rem;
    box-shadow: 0 0.1875rem 0.5rem 0.0625rem rgba(34, 34, 34, 0.1);
    display: flex;
    flex-direction: column;
    height: calc(100% - 0.0625rem);
    padding: 1.5rem 1.25rem;
    position: relative;
    z-index: 1;

    a {
        width: 100%;
        text-decoration: none;
        color: #000000;
        display: inline-block;
        margin: 8px 0;
    }
    strong {
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: 0.0112rem;
        line-height: 1.5625rem;
    }
    .description {
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        display: block;
        display: -webkit-box;
        margin-bottom: 0.375rem;
        overflow: hidden;
        text-overflow: ellipsis;
        min-height: 3rem;
    }
    img {
        min-height: 236px;
    }
}
.showcaseSwiper {
    margin: -1rem;
    padding: 1rem !important;
    .swiper-slide {
        height: auto !important;
    }
}
.price-wrapper {
    align-items: flex-start;
    column-gap: 0.25rem;
    display: flex;
    justify-content: space-between;
    margin-top: 0.75rem;
}
.price {
    font-size: 1.25rem;
    line-height: 1.5625rem;
}
.text-small-2 {
    color: #767676;
    font-size: 0.75rem;
    line-height: normal;
    padding-top: 0.375rem;
}
.quick-add-btn {
    padding: 0;
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #222;
    opacity: 1;
    &:hover {
        background-color: #222;
    }
    &:disabled {
        background-color: #222;
        opacity: 1;
    }
}
.cart-btn-icon {
    content: url("data:image/svg+xml;charset=utf-8,%3Csvg width='40' height='40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='19.063' fill='%23222' stroke='%23222' stroke-width='1.875'/%3E%3Cpath d='M30.546 14.89H8.945l3.41 11.368h14.78l3.41-11.369Zm0 0 .852-2.843M22.594 20.578h-4.548M21.878 30.11a1.705 1.705 0 0 0 3.411 0M15.058 30.11a1.705 1.705 0 0 0 3.41 0' stroke='%23fff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    display: block;
    position: relative;
    pointer-events: none;
    background-color: #222;
    border-radius: 50%;
}
.max-h-236 {
    max-height: 236px;
}
.showcase-section {
    &::before {
        background: #010101;
        bottom: 0;
        content: "";
        display: block;
        height: 15.3125rem;
        position: absolute;
        width: 100%;
    }
}
.badge-sale {
    position: absolute;
    top: 0;
    right: 0;
    background-color: red;
    color: white;
    padding: 5px 10px;
    font-size: 0.75rem;
    font-weight: bold;
    border-radius: 5px;
    z-index: 10;
}
</style>
