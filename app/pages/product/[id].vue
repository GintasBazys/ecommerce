<script setup lang="ts">
import type { ProductVariantDTO } from "@medusajs/types"
import type { BreadcrumbItem } from "~/types/breadcrumbs"
import type { ProductFact } from "~/types/product"

import BaseButton from "~/components/Shared/BaseButton.vue"
import BaseModal from "~/components/Shared/BaseModal.vue"
import { usePostHog } from "~/composables/analytics/usePostHog"
import { useProductGallery } from "~/composables/product/useProductGallery"
import { useProductPageData } from "~/composables/product/useProductPageData"
import { useProductPageSchema } from "~/composables/product/useProductPageSchema"
import { useProductPrice } from "~/composables/product/useProductPrice"
import { useProductReviews } from "~/composables/product/useProductReviews"
import { useSiteIdentity } from "~/composables/shared/useStructuredData"

const route = useRoute()
const event = useRequestEvent()
const { siteName, organizationId, absoluteUrl } = useSiteIdentity()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const { openCartDrawer } = storeToRefs(useCartStore())
const { customer } = storeToRefs(useCustomerStore())
const posthog = usePostHog()

const handle = computed<string>(() => String(route.params.id || ""))
const routePath = computed<string>(() => route.path)

const {
    product,
    productPending,
    productError,
    productNotFound,
    refreshProduct,
    productTitle,
    productSubtitle,
    productDescription,
    productVariants,
    productTags,
    productMetadata,
    primaryCategory,
    productPath,
    productUrl,
    relatedProducts,
    relatedPending,
    relatedError,
    refreshRelatedProducts
} = useProductPageData({
    handle,
    routePath,
    regionStoreId,
    selectedCountryCode,
    absoluteUrl
})

const selectedVariantId = ref<string | null>(null)
const quantity = ref<number>(1)
const adding = ref<boolean>(false)
const addToCartError = ref<string | null>(null)
const showReviewForm = ref<boolean>(false)
const isStickyPurchaseVisible = ref<boolean>(true)
const primaryProductInfoRef = useTemplateRef<HTMLElement>("primaryProductInfoRef")
const productReviewTitleId = "product-review-dialog-title"
let primaryInfoObserver: IntersectionObserver | null = null

watch(
    () => product.value?.id,
    () => {
        selectedVariantId.value = null
    }
)

const selectedVariant = computed<ProductVariantDTO | null>(
    () => productVariants.value.find((variant) => variant.id === selectedVariantId.value) ?? productVariants.value[0] ?? null
)

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ label: "Home", to: "/" }, { label: productTitle.value }])
const { activeImageIndex, productImages, activeImage, selectImage, resetGallery } = useProductGallery(product)

watch(() => product.value?.id, resetGallery)

const isOnSale = computed<boolean>(
    () =>
        selectedVariant.value?.calculated_price?.calculated_price?.price_list_type === "sale" &&
        Boolean(selectedVariant.value?.calculated_price?.original_amount)
)

const { displayPrice, originalPrice, taxLabel } = useProductPrice(selectedVariant)

if (productNotFound.value && event) {
    setResponseStatus(event, 404)
}

const maxStock = computed<number>(() => selectedVariant.value?.inventory_quantity ?? 99)
const inStock = computed<boolean>(() => typeof selectedVariant.value?.inventory_quantity !== "number" || selectedVariant.value.inventory_quantity > 0)
const { reviews, reviewAverage, displayedReviewAverage, displayedReviewCount, submitReview, submitError } = useProductReviews({
    product,
    productMetadata,
    posthog,
    onSubmitted: () => {
        showReviewForm.value = false
    }
})

useProductPageSchema({
    product,
    productTitle,
    productDescription,
    productPath,
    productUrl,
    productImages,
    selectedVariant,
    primaryCategory,
    reviews,
    reviewAverage,
    displayedReviewAverage,
    displayedReviewCount,
    inStock,
    siteName,
    organizationId,
    absoluteUrl
})

const productFacts = computed<ProductFact[]>(() => [
    {
        label: "Availability",
        value: inStock.value ? "In stock" : "Out of stock"
    },
    {
        label: "Selected option",
        value: selectedVariant.value?.title || "Choose a variant"
    },
    {
        label: "Category",
        value: primaryCategory.value?.name || "Product"
    }
])

watch(selectedVariant, () => {
    quantity.value = 1
})

function decrement(): void {
    if (quantity.value > 1) {
        quantity.value -= 1
    }
}

function increment(): void {
    if (quantity.value < maxStock.value) {
        quantity.value += 1
    }
}

async function addToCart(): Promise<void> {
    if (!selectedVariant.value) {
        return
    }

    adding.value = true
    addToCartError.value = null

    try {
        await useCartStore().updateLineItem(selectedVariant.value, quantity.value)
        posthog?.capture("product_added_to_cart", {
            product_id: product.value?.id,
            product_name: product.value?.title,
            variant_id: selectedVariant.value.id,
            variant_name: selectedVariant.value.title,
            quantity: quantity.value,
            price: selectedVariant.value.calculated_price?.calculated_amount
        })
        openCartDrawer.value = true
    } catch (error) {
        console.error("Product add to cart failed", error)
        addToCartError.value = "Could not add this product to your cart. Please try again."
    } finally {
        adding.value = false
    }
}

onMounted(() => {
    if (!primaryProductInfoRef.value || typeof IntersectionObserver === "undefined") {
        return
    }

    primaryInfoObserver = new IntersectionObserver(
        ([entry]) => {
            isStickyPurchaseVisible.value = Boolean(entry?.isIntersecting)
        },
        { threshold: 0 }
    )

    primaryInfoObserver.observe(primaryProductInfoRef.value)
})

onUnmounted(() => {
    primaryInfoObserver?.disconnect()
    primaryInfoObserver = null
})

</script>

<template>
    <div>
        <ProductPageStatus v-if="productPending" status="loading" />

        <ProductPageStatus v-else-if="productError" status="error" @retry="refreshProduct" />

        <ProductPageStatus v-else-if="productNotFound" status="not-found" />

        <section v-else-if="product" class="bg-slate-50">
            <div class="px-0 pt-15 pb-28 sm:pt-18 sm:pb-12 xl:pt-23 xl:pb-16">
                <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                    <div ref="primaryProductInfoRef" class="grid gap-5 xl:grid-cols-2 xl:gap-8">
                        <ProductPageGallery
                            :product-title="productTitle"
                            :product-images="productImages"
                            :active-image="activeImage"
                            :active-image-index="activeImageIndex"
                            :is-on-sale="isOnSale"
                            @select-image="selectImage"
                        />

                        <div class="grid gap-4 xl:gap-5">
                            <ProductPageIntro
                                :breadcrumb-items="breadcrumbItems"
                                :displayed-review-average="displayedReviewAverage"
                                :product-title="productTitle"
                                :product-subtitle="productSubtitle"
                                :product-description="productDescription"
                                :product-tags="productTags"
                                :selected-variant="selectedVariant"
                                :display-price="displayPrice"
                                :original-price="originalPrice"
                                :is-on-sale="isOnSale"
                                :tax-label="taxLabel"
                                :in-stock="inStock"
                            />

                            <ProductPagePurchase
                                :variants="productVariants"
                                :selected-variant-id="selectedVariant?.id ?? null"
                                :selected-variant-title="selectedVariant?.title || 'Choose a variant'"
                                :product-facts="productFacts"
                                :selected-variant="selectedVariant"
                                :in-stock="inStock"
                                :quantity="quantity"
                                :max-stock="maxStock"
                                :adding="adding"
                                @select-variant="selectedVariantId = $event"
                                @decrement="decrement"
                                @increment="increment"
                                @add-to-cart="addToCart"
                            />
                            <div
                                v-if="addToCartError"
                                class="rounded-card-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
                                role="alert"
                            >
                                {{ addToCartError }}
                            </div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <NuxtIsland name="ProductPageDetails" :props="{ productDescription }" />
                    </div>

                    <ProductPageReviews
                        :customer="customer"
                        :reviews="reviews"
                        :average-rating="displayedReviewAverage"
                        :review-count="displayedReviewCount"
                        @open-review="showReviewForm = true"
                    />

                    <ProductPageRelated
                        :related-products="relatedProducts"
                        :pending="relatedPending"
                        :error="Boolean(relatedError)"
                        @retry="refreshRelatedProducts"
                    />
                </div>
            </div>

            <div
                v-if="isStickyPurchaseVisible"
                class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 px-4 py-3 shadow-2xl backdrop-blur md:hidden pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
            >
                <div class="mx-auto flex max-w-7xl items-center gap-3">
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-slate-950">{{ displayPrice }}</p>
                        <p class="truncate text-xs leading-5 text-slate-600">{{ selectedVariant?.title || "Choose a variant" }}</p>
                    </div>
                    <BaseButton
                        type="button"
                        variant="accent" class="min-h-12 shrink-0 px-5 text-sm"
                        :disabled="!selectedVariant || !inStock || adding"
                        @click="addToCart"
                    >
                        {{ adding ? "Adding..." : inStock ? "Add to cart" : "Unavailable" }}
                    </BaseButton>
                </div>
            </div>

            <BaseModal
                v-if="customer"
                v-model="showReviewForm"
                :title-id="productReviewTitleId"
                close-label="Close review form"
                mobile-mode="sheet"
                size="md"
                content-class="px-5 pt-5 pb-5 sm:px-7 sm:pt-7 sm:pb-7"
            >
                <p v-if="submitError" class="mb-4 rounded-card-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700" role="alert">
                    {{ submitError }}
                </p>
                <ProductReview
                    :title="''"
                    :content="''"
                    :rating="0"
                    :first-name="customer?.first_name || ''"
                    :last-name="customer?.last_name || ''"
                    :product-id="product.id"
                    :title-id="productReviewTitleId"
                    @close="showReviewForm = false"
                    @submit="submitReview"
                />
            </BaseModal>
        </section>
    </div>
</template>
