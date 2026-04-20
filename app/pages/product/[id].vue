<script setup lang="ts">
import type { Review, ReviewApiResponse } from "@/types/interfaces"
import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import { usePostHog } from "~/composables/usePostHog"
import { useProductPrice } from "~/composables/useProductPrice"
import { DEFAULT_CURENCY, PRODUCT_URL_HANDLE } from "~/utils/consts"

interface ProductListResponse {
    products?: ProductDTO[]
}

interface ProductCategory {
    id: string
    name?: string | null
}

const route = useRoute()
const { siteName, organizationId, absoluteUrl } = useSiteIdentity()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const { openCartDrawer } = storeToRefs(useCartStore())
const { customer } = storeToRefs(useCustomerStore())
const posthog = usePostHog()

const handle = computed<string>(() => String(route.params.id || ""))

const { data } = await useFetch<ProductListResponse>("/api/products/products", {
    params: {
        handle: handle.value,
        ...(regionStoreId.value ? { region_id: regionStoreId.value } : {}),
        ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {})
    }
})

const product = computed<ProductDTO | null>(() => data.value?.products?.[0] ?? null)

if (!product.value) {
    await navigateTo({ path: "/" })
}

const primaryCategory = computed<ProductCategory | null>(() => {
    const category = product.value?.categories?.[0]

    if (!category?.id) {
        return null
    }

    return {
        id: category.id,
        name: "name" in category && typeof category.name === "string" ? category.name : null
    }
})

const { data: relatedData } = await useAsyncData<ProductListResponse>(`related-product-${handle.value}`, async () => {
    if (!primaryCategory.value?.id) {
        return { products: [] }
    }

    return $fetch("/api/products/products", {
        params: {
            category_id: primaryCategory.value.id,
            ...(regionStoreId.value ? { region_id: regionStoreId.value } : {}),
            ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {}),
            limit: 8
        }
    })
})

const relatedProducts = computed<ProductDTO[]>(() => {
    const currentProductId = product.value?.id

    return (relatedData.value?.products ?? []).filter((item) => item.id !== currentProductId).slice(0, 4)
})

useHead({
    title: `${product.value?.title || "Product"} | Ecommerce`
})

const selectedVariantId = ref<string | null>(product.value?.variants?.[0]?.id ?? null)
const activeImageIndex = ref<number>(0)
const quantity = ref<number>(1)
const adding = ref<boolean>(false)
const showReviewForm = ref<boolean>(false)
const panel = ref<number[]>([0])

watch(
    () => product.value?.id,
    () => {
        selectedVariantId.value = product.value?.variants?.[0]?.id ?? null
        activeImageIndex.value = 0
    },
    { immediate: true }
)

const selectedVariant = computed<ProductVariantDTO | null>(
    () => product.value?.variants.find((variant) => variant.id === selectedVariantId.value) ?? null
)

const productPath = computed<string>(() => {
    if (product.value?.handle) {
        return `${PRODUCT_URL_HANDLE}/${product.value.handle}`
    }

    return route.path
})

const productUrl = computed<string>(() => absoluteUrl(productPath.value))
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: product.value?.title || "Product" }])

const productImages = computed(() => product.value?.images ?? [])

const activeImage = computed(() => {
    if (!productImages.value.length) {
        return null
    }

    return productImages.value[activeImageIndex.value] ?? productImages.value[0] ?? null
})

const isOnSale = computed<boolean>(
    () =>
        selectedVariant.value?.calculated_price?.calculated_price?.price_list_type === "sale" &&
        Boolean(selectedVariant.value?.calculated_price?.original_amount)
)

const { displayPrice, originalPrice, taxLabel } = useProductPrice(selectedVariant)

const maxStock = computed<number>(() => selectedVariant.value?.inventory_quantity || 0)
const inStock = computed<boolean>(() => maxStock.value > 0)
const reviewAverage = computed<number>(() => {
    if (!reviews.value.length) {
        return 0
    }

    const total = reviews.value.reduce((sum, review) => sum + Number(review.rating || 0), 0)
    return Number((total / reviews.value.length).toFixed(1))
})

const schemaReviews = computed<SchemaNode[]>(() =>
    reviews.value.map((review) => ({
        "@type": "Review",
        author: {
            "@type": "Person",
            name: `${review.first_name} ${review.last_name}`.trim()
        },
        datePublished: normalizeSchemaDate(review.created_at),
        reviewBody: review.content,
        name: review.title,
        reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1
        }
    }))
)

const schemaImages = computed<string[]>(() => {
    const images = product.value?.images?.map((image) => image.url).filter((url): url is string => Boolean(url)) ?? []

    if (product.value?.thumbnail && !images.includes(product.value.thumbnail)) {
        images.unshift(product.value.thumbnail)
    }

    return images.map((image) => absoluteUrl(image))
})

const schemaPrice = computed<number | null>(() => selectedVariant.value?.calculated_price?.calculated_amount ?? null)
const schemaCurrency = computed<string>(() => selectedVariant.value?.calculated_price?.currency_code?.toUpperCase() || DEFAULT_CURENCY)

const productSchema = computed<SchemaNode | null>(() => {
    if (!product.value || schemaPrice.value == null) {
        return null
    }

    return {
        "@type": "Product",
        "@id": `${productUrl.value}#product`,
        name: product.value.title,
        description: product.value.description || product.value.subtitle || undefined,
        url: productUrl.value,
        image: schemaImages.value.length ? schemaImages.value : undefined,
        sku: selectedVariant.value?.sku || selectedVariant.value?.id,
        category: primaryCategory.value?.name || undefined,
        brand: {
            "@type": "Brand",
            name: siteName.value
        },
        aggregateRating: reviews.value.length
            ? {
                  "@type": "AggregateRating",
                  ratingValue: reviewAverage.value,
                  reviewCount: reviews.value.length,
                  bestRating: 5,
                  worstRating: 1
              }
            : undefined,
        review: schemaReviews.value.length ? schemaReviews.value : undefined,
        offers: {
            "@type": "Offer",
            url: productUrl.value,
            priceCurrency: schemaCurrency.value,
            price: schemaPrice.value,
            availability: inStock.value ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
                "@id": organizationId.value
            }
        }
    }
})

const breadcrumbSchema = computed<SchemaNode | null>(() => {
    if (!product.value) {
        return null
    }

    return createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: product.value.title, path: productPath.value }
        ],
        absoluteUrl
    )
})

const productFacts = computed(() => [
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
        value: primaryCategory.value?.name || "Featured product"
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

function selectImage(index: number): void {
    activeImageIndex.value = index
}

async function addToCart(): Promise<void> {
    if (!selectedVariant.value) {
        return
    }

    adding.value = true

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
    } finally {
        adding.value = false
        openCartDrawer.value = true
    }
}

async function handleReviewSubmit(review: {
    title: string
    content: string
    rating: number
    firstName: string
    lastName: string
    productId: string
}): Promise<void> {
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

        reviewsData.value = await $fetch("/api/reviews/list-reviews", {
            params: { product_id: review.productId, limit: 10, offset: 0 }
        })
        posthog?.capture("product_review_submitted", {
            product_id: review.productId,
            rating: review.rating
        })
        showReviewForm.value = false
    } catch (error) {
        console.error("Review submit error", error)
    }
}

const reviewsData = ref<ReviewApiResponse | null>(null)
const reviews = computed<Review[]>(() => reviewsData.value?.reviews || [])

watch(
    () => product.value?.id,
    async (id) => {
        if (id) {
            try {
                reviewsData.value = await $fetch("/api/reviews/list-reviews", {
                    params: { product_id: id, limit: 10, offset: 0 }
                })
            } catch (error) {
                console.error("Review fetch error", error)
                reviewsData.value = { reviews: [] }
            }
        }
    },
    { immediate: true }
)

useStructuredData(() => [productSchema.value, breadcrumbSchema.value], "product-structured-data")
</script>

<template>
    <section v-if="product" class="product-page">
        <div class="product-page__hero">
            <VContainer class="product-page__container">
                <div class="product-page__hero-grid">
                    <div class="product-page__gallery-shell">
                        <div class="product-page__gallery-card">
                            <div v-if="isOnSale" class="product-page__sale-badge">Sale</div>
                            <div class="product-page__main-image-wrap">
                                <VImg
                                    :src="activeImage?.url || product.thumbnail || '/images/placeholder.png'"
                                    :alt="activeImage?.url ? `${product.title} image` : product.title"
                                    class="product-page__main-image"
                                    cover
                                />
                            </div>
                            <div v-if="productImages.length > 1" class="product-page__thumb-grid">
                                <button
                                    v-for="(image, index) in productImages"
                                    :key="image.id || image.url || index"
                                    type="button"
                                    class="product-page__thumb-button"
                                    :class="{ 'product-page__thumb-button--active': index === activeImageIndex }"
                                    @click="selectImage(index)"
                                >
                                    <VImg
                                        :src="image.url"
                                        :alt="`${product.title} thumbnail ${index + 1}`"
                                        class="product-page__thumb-image"
                                        cover
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="product-page__content">
                        <div class="product-page__intro-card">
                            <div class="product-page__intro-top">
                                <div>
                                    <AppBreadcrumbs :items="breadcrumbItems" class="product-page__breadcrumbs" />
                                    <span class="product-page__eyebrow">Product detail</span>
                                </div>
                                <div v-if="reviews.length" class="product-page__rating-summary">
                                    <VIcon v-for="star in 5" :key="star" size="16" class="product-page__rating-star">
                                        {{ star <= Math.round(reviewAverage) ? "mdi-star" : "mdi-star-outline" }}
                                    </VIcon>
                                    <span>{{ reviewAverage }} / 5</span>
                                </div>
                            </div>
                            <h1 class="product-page__title">{{ product.title }}</h1>
                            <p v-if="product.subtitle" class="product-page__subtitle">{{ product.subtitle }}</p>
                            <p class="product-page__description">
                                {{
                                    product.description ||
                                        "A refined product pick designed to feel premium, practical, and easy to wear every day."
                                }}
                            </p>
                            <div v-if="product.tags.length" class="product-page__tag-row">
                                <VChip v-for="tag in product.tags" :key="tag.id" class="product-page__tag" size="small" label>
                                    {{ tag.value }}
                                </VChip>
                            </div>
                            <div v-if="selectedVariant" class="product-page__price-block">
                                <div class="product-page__price-row">
                                    <span class="product-page__price">{{ displayPrice }}</span>
                                    <del v-if="isOnSale && originalPrice" class="product-page__original-price">{{ originalPrice }}</del>
                                </div>
                                <p class="product-page__tax-meta">{{ taxLabel }}</p>
                                <p
                                    class="product-page__inventory"
                                    :class="inStock ? 'product-page__inventory--in' : 'product-page__inventory--out'"
                                >
                                    {{ inStock ? "Ready to ship" : "Currently unavailable" }}
                                </p>
                            </div>
                        </div>
                        <div class="product-page__purchase-card">
                            <div v-if="product.variants.length" class="product-page__variant-block">
                                <div class="product-page__label-row">
                                    <span class="product-page__label">Select option</span>
                                    <span class="product-page__label-value">{{ selectedVariant?.title || "Choose a variant" }}</span>
                                </div>
                                <VBtnToggle v-model="selectedVariantId" mandatory divided class="product-page__variant-toggle">
                                    <VBtn
                                        v-for="variant in product.variants"
                                        :key="variant.id"
                                        :value="variant.id"
                                        variant="text"
                                        rounded="pill"
                                        class="product-page__variant-btn text-none"
                                    >
                                        {{ variant.title }}
                                    </VBtn>
                                </VBtnToggle>
                            </div>
                            <div class="product-page__facts-grid">
                                <div v-for="fact in productFacts" :key="fact.label" class="product-page__fact-card">
                                    <span class="product-page__fact-label">{{ fact.label }}</span>
                                    <strong class="product-page__fact-value">{{ fact.value }}</strong>
                                </div>
                            </div>
                            <div v-if="selectedVariant && inStock" class="product-page__cta-row">
                                <div class="product-page__qty-block">
                                    <span class="product-page__label">Quantity</span>
                                    <div class="product-page__qty-control">
                                        <VBtn icon size="x-small" variant="text" :disabled="quantity <= 1" @click="decrement">
                                            <VIcon size="18">mdi-minus</VIcon>
                                        </VBtn>
                                        <span class="product-page__qty-value">{{ quantity }}</span>
                                        <VBtn icon size="x-small" variant="text" :disabled="quantity >= maxStock" @click="increment">
                                            <VIcon size="18">mdi-plus</VIcon>
                                        </VBtn>
                                    </div>
                                </div>
                                <VBtn
                                    color="primary"
                                    rounded="pill"
                                    class="product-page__cart-btn text-none"
                                    :disabled="!selectedVariant || quantity < 1 || quantity > maxStock"
                                    :loading="adding"
                                    @click="addToCart"
                                >
                                    Add to cart
                                </VBtn>
                            </div>
                            <div v-else class="product-page__out-of-stock-card">
                                This variant is currently unavailable. Try another option or browse related products below.
                            </div>
                            <div class="product-page__service-grid">
                                <div class="product-page__service-item">
                                    <VIcon size="18" color="primary">mdi-truck-fast-outline</VIcon>
                                    <span>Fast regional delivery</span>
                                </div>
                                <div class="product-page__service-item">
                                    <VIcon size="18" color="primary">mdi-refresh</VIcon>
                                    <span>Easy returns and exchanges</span>
                                </div>
                                <div class="product-page__service-item">
                                    <VIcon size="18" color="primary">mdi-shield-check-outline</VIcon>
                                    <span>Secure checkout experience</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="product-page__details-grid">
                    <div class="product-page__details-card">
                        <span class="product-page__section-eyebrow">Product details</span>
                        <h2 class="product-page__section-title">More context before you commit.</h2>
                        <VExpansionPanels v-model="panel" multiple variant="accordion" class="product-page__accordion">
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Description</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <p class="product-page__detail-text">
                                        {{
                                            product.description ||
                                                "A carefully selected product with balanced styling, everyday function, and a polished finish."
                                        }}
                                    </p>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Buying notes</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <ul class="product-page__detail-list">
                                        <li>Choose your preferred option before adjusting quantity.</li>
                                        <li>Pricing updates instantly based on the selected variant.</li>
                                        <li>Shipping updates at checkout, and tax display follows the selected region.</li>
                                    </ul>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Why customers like it</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <p class="product-page__detail-text">
                                        Designed to feel premium without becoming fussy, this product balances presentation, utility, and
                                        easy everyday use.
                                    </p>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </div>
                    <div class="product-page__reviews-card">
                        <div class="product-page__reviews-header">
                            <div>
                                <span class="product-page__section-eyebrow">Customer feedback</span>
                                <h2 class="product-page__section-title">What shoppers are saying.</h2>
                            </div>
                            <VBtn
                                v-if="customer"
                                color="primary"
                                variant="outlined"
                                rounded="pill"
                                class="text-none"
                                @click="showReviewForm = true"
                            >
                                Write a review
                            </VBtn>
                        </div>
                        <ProductReviews :reviews="reviews" />
                    </div>
                </div>
                <section v-if="relatedProducts.length" class="product-page__related">
                    <div class="product-page__related-intro">
                        <span class="product-page__section-eyebrow">Related products</span>
                        <h2 class="product-page__section-title">More from the same shopping lane.</h2>
                        <p class="product-page__section-text">
                            Picked from the same category so the next suggestion still feels aligned with what you are viewing now.
                        </p>
                    </div>
                    <VRow class="product-page__related-grid" align="stretch">
                        <VCol v-for="relatedProduct in relatedProducts" :key="relatedProduct.id" cols="12" sm="6" lg="3">
                            <ProductCard :product="relatedProduct" />
                        </VCol>
                    </VRow>
                </section>
                <VDialog v-if="customer" v-model="showReviewForm" max-width="600">
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
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.product-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 42%, #f7faff 100%);
}

.product-page__hero {
    padding: 6.5rem 0 6rem;
}

.product-page__container {
    position: relative;
    z-index: 1;
}

.product-page__hero-grid,
.product-page__details-grid {
    display: grid;
    gap: 2rem;
}

.product-page__hero-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
    align-items: start;
}

.product-page__content {
    display: grid;
    gap: 1rem;
}

.product-page__gallery-card,
.product-page__intro-card,
.product-page__purchase-card,
.product-page__details-card,
.product-page__reviews-card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.product-page__gallery-card {
    position: sticky;
    top: 1.5rem;
    padding: 1rem;
}

.product-page__sale-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2rem;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: #d9424e;
    color: #ffffff;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.product-page__main-image-wrap {
    overflow: hidden;
    margin-top: 0.9rem;
    border-radius: 1.25rem;
    aspect-ratio: 0.85;
    background: radial-gradient(circle at top, rgba(0, 128, 255, 0.14), transparent 34%), linear-gradient(180deg, #eef5ff 0%, #dfeafc 100%);
}

.product-page__main-image {
    width: 100%;
    height: 100%;
}

.product-page__thumb-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.9rem;
}

.product-page__thumb-button {
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.95);
    cursor: pointer;
    transition:
        transform 0.25s ease,
        border-color 0.25s ease;
}

.product-page__thumb-button:hover,
.product-page__thumb-button--active {
    transform: translateY(-2px);
    border-color: rgba(1, 12, 128, 0.18);
}

.product-page__thumb-image {
    aspect-ratio: 1;
    border-radius: 0.8rem;
}

.product-page__intro-card,
.product-page__purchase-card,
.product-page__details-card,
.product-page__reviews-card {
    padding: 1.9rem;
}

.product-page__intro-top,
.product-page__price-row,
.product-page__label-row,
.product-page__reviews-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.product-page__breadcrumbs {
    margin-bottom: 0.9rem;
}

.product-page__intro-top,
.product-page__reviews-header {
    align-items: center;
}

.product-page__eyebrow,
.product-page__section-eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.product-page__rating-summary {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #5a6480;
    font-size: 0.92rem;
}

.product-page__rating-star {
    color: #f7ae2b;
}

.product-page__title,
.product-page__section-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.product-page__title {
    margin: 1rem 0 0.75rem;
    font-size: 4.25rem;
    line-height: 0.95;
}

.product-page__subtitle,
.product-page__description,
.product-page__section-text,
.product-page__detail-text,
.product-page__out-of-stock-card {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.product-page__subtitle {
    margin-bottom: 0.75rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
}

.product-page__tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.25rem;
}

.product-page__tag {
    border: 1px solid rgba(8, 23, 63, 0.08);
    background: rgba(247, 250, 255, 0.95);
    color: #08173f;
}

.product-page__price-block {
    margin-top: 1.4rem;
}

.product-page__price-row {
    align-items: baseline;
    justify-content: flex-start;
    gap: 0.75rem;
}

.product-page__price {
    color: #08173f;
    font-size: 2.3rem;
    font-weight: 700;
    line-height: 1;
}

.product-page__original-price {
    color: #d9424e;
    font-size: 1rem;
}

.product-page__inventory {
    margin-top: 0.55rem;
    font-size: 0.92rem;
    font-weight: 700;
}

.product-page__tax-meta {
    margin-top: 0.6rem;
    color: #5a6480;
    font-size: 0.92rem;
    line-height: 1.5;
}

.product-page__inventory--in {
    color: #1e8b58;
}

.product-page__inventory--out {
    color: #d9424e;
}

.product-page__variant-block {
    display: grid;
    gap: 0.9rem;
}

.product-page__label-row {
    align-items: center;
}

.product-page__label,
.product-page__fact-label,
.product-page__label-value {
    color: #6a7590;
    font-size: 0.88rem;
}

.product-page__label-value {
    font-weight: 700;
}

.product-page__variant-toggle {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.product-page__variant-btn {
    min-height: 2.6rem;
    padding-inline: 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px !important;
    background: rgba(247, 250, 255, 0.95);
    color: #08173f;
    font-weight: 700;
}

.product-page__facts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.product-page__fact-card {
    display: grid;
    gap: 0.35rem;
    padding: 0.95rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.92);
}

.product-page__fact-value {
    color: #08173f;
    line-height: 1.4;
}

.product-page__cta-row {
    display: flex;
    align-items: end;
    gap: 1rem;
    margin-top: 1.35rem;
}

.product-page__qty-block {
    display: grid;
    gap: 0.55rem;
}

.product-page__qty-control {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
}

.product-page__qty-value {
    min-width: 2.2rem;
    color: #08173f;
    font-weight: 700;
    text-align: center;
}

.product-page__cart-btn {
    min-width: min(18rem, 100%);
    min-height: 3.1rem;
    font-weight: 700;
}

.product-page__out-of-stock-card {
    margin-top: 1.35rem;
    padding: 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.92);
}

.product-page__service-grid {
    display: grid;
    gap: 0.85rem;
    margin-top: 1.35rem;
}

.product-page__service-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: #33415f;
}

.product-page__details-grid {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    margin-top: 3rem;
}

.product-page__section-title {
    margin: 1rem 0 0.75rem;
    font-size: 2.2rem;
    line-height: 1.08;
}

.product-page__accordion {
    margin-top: 1.15rem;
}

.product-page__detail-list {
    margin: 0;
    padding-left: 1.15rem;
    color: #4b5874;
    line-height: 1.8;
}

.product-page__related {
    margin-top: 3.5rem;
}

.product-page__related-intro {
    max-width: 38rem;
    margin-bottom: 1.5rem;
}

.product-page__related-grid {
    margin-top: 0;
}

@media screen and (max-width: 1200px) {
    .product-page__hero-grid,
    .product-page__details-grid {
        grid-template-columns: 1fr;
    }

    .product-page__gallery-card {
        position: static;
    }
}

@media screen and (max-width: 800px) {
    .product-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .product-page__hero-grid,
    .product-page__details-grid {
        gap: 1.5rem;
    }

    .product-page__title {
        font-size: 2.8rem;
        line-height: 1;
    }

    .product-page__intro-card,
    .product-page__purchase-card,
    .product-page__details-card,
    .product-page__reviews-card {
        padding: 1.4rem;
    }

    .product-page__gallery-card,
    .product-page__intro-card,
    .product-page__purchase-card,
    .product-page__details-card,
    .product-page__reviews-card {
        border-radius: 1.2rem;
    }

    .product-page__price {
        font-size: 1.8rem;
    }

    .product-page__details-grid {
        margin-top: 2rem;
    }

    .product-page__section-title {
        font-size: 1.6rem;
    }

    .product-page__related {
        margin-top: 2.25rem;
    }

    .product-page__thumb-grid,
    .product-page__facts-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .product-page__cta-row,
    .product-page__reviews-header,
    .product-page__intro-top,
    .product-page__label-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .product-page__cart-btn {
        width: 100%;
    }
}

@media screen and (max-width: 560px) {
    .product-page__thumb-grid,
    .product-page__facts-grid {
        grid-template-columns: 1fr;
    }

    .product-page__variant-toggle {
        flex-direction: column;
        align-items: stretch;
    }

    .product-page__variant-btn {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .product-page__thumb-button {
        transition: none;
    }
}
</style>
