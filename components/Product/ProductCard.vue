<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"
import type { SimpleProductVariant } from "@/types/interfaces"
import { formatPrice } from "@/utils/formatPrice"
import { debounce } from "lodash"

const { product } = defineProps<{
    product: ProductDTO
}>()

const cartStore = useCartStore()
const { openCartDrawer } = storeToRefs(cartStore)
const loading = ref<boolean>(false)

const selectedVariant = ref<SimpleProductVariant | null>(product.variants ? product.variants[0] : null)

const computedPrice = computed<number | string>(() => {
    if (
        selectedVariant.value &&
        selectedVariant.value.calculated_price &&
        selectedVariant.value.calculated_price.calculated_amount !== undefined
    ) {
        const { calculated_amount, currency_code } = selectedVariant.value.calculated_price
        return formatPrice(calculated_amount, currency_code)
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
        return formatPrice(original_amount, currency_code)
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
    openCartDrawer.value = true
}

const debouncedAddToCart = debounce(addToCart, 300)

const averageRating = computed<number | null>(() => {
    const rating = Number(product?.metadata?.averageRating)
    return rating > 0 ? rating : null
})
</script>

<template>
    <div class="py-4 px-2 px-md-4">
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

                <p class="truncate text-body-2 mb-2">{{ product.description }}</p>

                <div class="d-flex align-center mt-2">
                    <VIcon v-for="i in 5" :key="i" size="18" class="mr-1">
                        {{ i <= Math.round(averageRating ?? 0) ? "mdi-star" : "mdi-star-outline" }}
                    </VIcon>
                </div>

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
    </div>
</template>

<style lang="scss" scoped>
.truncate {
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: block;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: -o-ellipsis-lastline;
    text-overflow: ellipsis;
    min-height: 2.5rem;
}
</style>
