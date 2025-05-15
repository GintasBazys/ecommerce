<script setup lang="ts">
import { formatPrice } from "@/utils/formatPrice"
import type { ReviewApiResponse } from "@/types/interfaces"

const route = useRoute()
const { regionStoreId } = storeToRefs(useRegionStore())
const cartStore = useCartStore()
const { openCartDrawer } = storeToRefs(cartStore)

const handle = route.fullPath.split("/").pop()

const { data } = await useFetch(`/api/products/products`, {
    params: { handle, ...(regionStoreId.value ? { region_id: regionStoreId.value } : {}) }
})
const product = computed(() => data.value?.products?.[0])
if (!product.value) {
    await navigateTo({ path: "/" })
}

useHead({
    title: `${product.value.title} | Ecommerce`
})

const selectedVariantId = ref<string | null>(null)
const selectedVariant = computed(() => product.value?.variants.find((v: { id: string | null }) => v.id === selectedVariantId.value) || null)

const isOnSale = computed<number | boolean>(() => {
    return (
        selectedVariant.value?.calculated_price.calculated_price.price_list_type === "sale" &&
        selectedVariant.value?.calculated_price.original_amount
    )
})
const originalPrice = computed(() =>
    isOnSale.value
        ? formatPrice(selectedVariant.value!.calculated_price.original_amount!, selectedVariant.value!.calculated_price.currency_code)
        : null
)
const salePrice = computed(() =>
    selectedVariant.value
        ? formatPrice(selectedVariant.value.calculated_price.calculated_amount, selectedVariant.value.calculated_price.currency_code)
        : null
)

const quantity = ref(1)
const maxStock = computed(() => selectedVariant.value?.inventory_quantity || 0)

watch(selectedVariant, () => {
    quantity.value = 1
})

const decrement = () => {
    if (quantity.value > 1) quantity.value--
}
const increment = () => {
    if (quantity.value < maxStock.value) quantity.value++
}

const adding = ref(false)
const addToCart = async () => {
    if (!selectedVariant.value) return
    adding.value = true
    try {
        await cartStore.updateLineItem(selectedVariant.value, quantity.value)
    } finally {
        adding.value = false
        openCartDrawer.value = true
    }
}

const { customer } = storeToRefs(useCustomerStore())
const showReviewForm = ref(false)

const handleReviewSubmit = async (review: {
    title: string
    content: string
    rating: number
    firstName: string
    lastName: string
    productId: string
}) => {
    try {
        await $fetch<ReviewApiResponse>("/api/reviews/add-review", {
            method: "POST",
            body: {
                title: review.title,
                content: review.content,
                rating: review.rating,
                first_name: review.firstName,
                last_name: review.lastName,
                product_id: review.productId
            }
        })
    } catch (e) {
        console.error("Review submit error", e)
    }
}

const reviewsData = ref<ReviewApiResponse | null>(null)
const reviews = computed(() => reviewsData.value?.reviews || [])

watch(
    () => product.value?.id,
    async (id) => {
        if (id) {
            const res = await useFetch("/api/reviews/list-reviews", {
                params: { product_id: id, limit: 10, offset: 0 }
            })
            reviewsData.value = res.data.value
        }
    },
    { immediate: true }
)
</script>

<template>
    <VContainer v-if="product" class="py-10">
        <VRow class="align-start mt-md-10" dense>
            <VCol cols="12" md="6">
                <VCard class="rounded-lg" elevation="2">
                    <ClientOnly>
                        <swiper-container :slides-per-view="1" :pagination="{ clickable: true }" class="rounded-lg">
                            <swiper-slide v-for="(image, index) in product.images" :key="index">
                                <VImg :src="image.url" :alt="`Image ${index + 1}`" height="400" cover class="rounded-lg" />
                            </swiper-slide> </swiper-container
                    ></ClientOnly>
                </VCard>
            </VCol>

            <VCol cols="12" md="6">
                <div class="d-flex flex-column ga-4 ml-0 ml-md-4 mt-4 mt-md-0">
                    <div>
                        <h1 class="text-h4 font-weight-bold mb-1">{{ product.title }}</h1>
                        <div v-if="product.subtitle" class="text-subtitle-1 text-grey mb-3">
                            {{ product.subtitle }}
                        </div>

                        <div v-if="product.tags.length" class="mb-4">
                            <VChip v-for="tag in product.tags" :key="tag.id" class="ma-1" color="primary" variant="tonal" size="small">{{
                                tag.value
                            }}</VChip>
                        </div>
                        <p class="text-body-1">{{ product.description }}</p>
                    </div>

                    <div v-if="product.variants.length">
                        <h4 class="text-subtitle-2 font-weight-medium mb-2">Select Variant</h4>
                        <VBtnToggle v-model="selectedVariantId" mandatory divided>
                            <VBtn v-for="v in product.variants" :key="v.id" :value="v.id" variant="outlined" size="small">{{
                                v.title
                            }}</VBtn>
                        </VBtnToggle>
                    </div>

                    <div v-if="selectedVariant">
                        <p class="text-body-1">
                            <strong>Price:&nbsp;</strong>
                            <span v-if="isOnSale">
                                <del class="text-body-2 text-error pr-2">{{ originalPrice }}</del>
                                <span class="text-h6 font-weight-bold">{{ salePrice }}</span>
                            </span>
                            <span v-else>{{ salePrice }}</span>
                        </p>
                        <p class="text-body-1">
                            <strong>Availability:&nbsp;</strong>
                            <span :class="selectedVariant.inventory_quantity > 0 ? 'text-success' : 'text-error'">
                                {{ selectedVariant.inventory_quantity > 0 ? "In Stock" : "Out of Stock" }}
                            </span>
                        </p>
                    </div>

                    <div v-if="selectedVariant && selectedVariant.inventory_quantity > 0" class="d-flex align-center ga-2">
                        <VBtn icon :disabled="quantity <= 1" @click="decrement">
                            <VIcon>mdi-minus</VIcon>
                        </VBtn>
                        <span class="text-h6">{{ quantity }}</span>
                        <VBtn icon :disabled="quantity >= maxStock" @click="increment">
                            <VIcon>mdi-plus</VIcon>
                        </VBtn>
                    </div>

                    <VBtn
                        class="mt-4"
                        color="primary"
                        :disabled="!selectedVariant || quantity < 1 || quantity > maxStock"
                        :loading="adding"
                        @click="addToCart"
                    >
                        Add to Cart
                    </VBtn>
                </div>
            </VCol>
        </VRow>
        <ProductReviews :reviews="reviews" />
        <template v-if="customer">
            <div class="mt-8 text-center">
                <VBtn color="secondary" @click="showReviewForm = true"> Write a Review </VBtn>
            </div>
            <VDialog v-model="showReviewForm" max-width="600">
                <ProductReview
                    :title="''"
                    :content="''"
                    :rating="0"
                    :first-name="customer?.first_name || ''"
                    :last-name="customer?.last_name || ''"
                    :product-id="product.id"
                    @close="showReviewForm = false"
                    @submit="handleReviewSubmit"
                />
            </VDialog>
        </template>
    </VContainer>
</template>
