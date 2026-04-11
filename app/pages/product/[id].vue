<script setup lang="ts">
import type { Review, ReviewApiResponse } from "@/types/interfaces"
import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { SchemaNode } from "~/composables/useStructuredData"

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
            reviewsData.value = await $fetch("/api/reviews/list-reviews", {
                params: { product_id: id, limit: 10, offset: 0 }
            })
        }
    },
    { immediate: true }
)

useStructuredData(() => [productSchema.value, breadcrumbSchema.value], "product-structured-data")
</script>

<template>
    <section v-if="product" class="productPage">
        <div class="productPage__hero">
            <VContainer class="productPage__container">
                <div class="productPage__heroGrid">
                    <div class="productPage__galleryShell">
                        <div class="productPage__galleryCard">
                            <div v-if="isOnSale" class="productPage__saleBadge">Sale</div>
                            <div class="productPage__mainImageWrap">
                                <VImg
                                    :src="activeImage?.url || product.thumbnail || '/images/placeholder.png'"
                                    :alt="activeImage?.url ? `${product.title} image` : product.title"
                                    class="productPage__mainImage"
                                    cover
                                />
                            </div>
                            <div v-if="productImages.length > 1" class="productPage__thumbGrid">
                                <button
                                    v-for="(image, index) in productImages"
                                    :key="image.id || image.url || index"
                                    type="button"
                                    class="productPage__thumbButton"
                                    :class="{ 'productPage__thumbButton--active': index === activeImageIndex }"
                                    @click="selectImage(index)"
                                >
                                    <VImg
                                        :src="image.url"
                                        :alt="`${product.title} thumbnail ${index + 1}`"
                                        class="productPage__thumbImage"
                                        cover
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="productPage__content">
                        <div class="productPage__introCard">
                            <div class="productPage__introTop">
                                <div>
                                    <AppBreadcrumbs :items="breadcrumbItems" class="productPage__breadcrumbs" />
                                    <span class="productPage__eyebrow">Product detail</span>
                                </div>
                                <div v-if="reviews.length" class="productPage__ratingSummary">
                                    <VIcon v-for="star in 5" :key="star" size="16" class="productPage__ratingStar">
                                        {{ star <= Math.round(reviewAverage) ? "mdi-star" : "mdi-star-outline" }}
                                    </VIcon>
                                    <span>{{ reviewAverage }} / 5</span>
                                </div>
                            </div>
                            <h1 class="productPage__title">{{ product.title }}</h1>
                            <p v-if="product.subtitle" class="productPage__subtitle">{{ product.subtitle }}</p>
                            <p class="productPage__description">{{ product.description || "A refined product pick designed to feel premium, practical, and easy to wear every day." }}</p>
                            <div v-if="product.tags.length" class="productPage__tagRow">
                                <VChip v-for="tag in product.tags" :key="tag.id" class="productPage__tag" size="small" label>
                                    {{ tag.value }}
                                </VChip>
                            </div>
                            <div v-if="selectedVariant" class="productPage__priceBlock">
                                <div class="productPage__priceRow">
                                    <span class="productPage__price">{{ displayPrice }}</span>
                                    <del v-if="isOnSale && originalPrice" class="productPage__originalPrice">{{ originalPrice }}</del>
                                </div>
                                <p class="productPage__taxMeta">{{ taxLabel }}</p>
                                <p
                                    class="productPage__inventory"
                                    :class="inStock ? 'productPage__inventory--in' : 'productPage__inventory--out'"
                                >
                                    {{ inStock ? "Ready to ship" : "Currently unavailable" }}
                                </p>
                            </div>
                        </div>
                        <div class="productPage__purchaseCard">
                            <div v-if="product.variants.length" class="productPage__variantBlock">
                                <div class="productPage__labelRow">
                                    <span class="productPage__label">Select option</span>
                                    <span class="productPage__labelValue">{{ selectedVariant?.title || "Choose a variant" }}</span>
                                </div>
                                <VBtnToggle v-model="selectedVariantId" mandatory divided class="productPage__variantToggle">
                                    <VBtn
                                        v-for="variant in product.variants"
                                        :key="variant.id"
                                        :value="variant.id"
                                        variant="text"
                                        rounded="pill"
                                        class="productPage__variantBtn text-none"
                                    >
                                        {{ variant.title }}
                                    </VBtn>
                                </VBtnToggle>
                            </div>
                            <div class="productPage__factsGrid">
                                <div v-for="fact in productFacts" :key="fact.label" class="productPage__factCard">
                                    <span class="productPage__factLabel">{{ fact.label }}</span>
                                    <strong class="productPage__factValue">{{ fact.value }}</strong>
                                </div>
                            </div>
                            <div v-if="selectedVariant && inStock" class="productPage__ctaRow">
                                <div class="productPage__qtyBlock">
                                    <span class="productPage__label">Quantity</span>
                                    <div class="productPage__qtyControl">
                                        <VBtn icon size="x-small" variant="text" :disabled="quantity <= 1" @click="decrement">
                                            <VIcon size="18">mdi-minus</VIcon>
                                        </VBtn>
                                        <span class="productPage__qtyValue">{{ quantity }}</span>
                                        <VBtn icon size="x-small" variant="text" :disabled="quantity >= maxStock" @click="increment">
                                            <VIcon size="18">mdi-plus</VIcon>
                                        </VBtn>
                                    </div>
                                </div>
                                <VBtn
                                    color="primary"
                                    rounded="pill"
                                    class="productPage__cartBtn text-none"
                                    :disabled="!selectedVariant || quantity < 1 || quantity > maxStock"
                                    :loading="adding"
                                    @click="addToCart"
                                >
                                    Add to cart
                                </VBtn>
                            </div>
                            <div v-else class="productPage__outOfStockCard">
                                This variant is currently unavailable. Try another option or browse related products below.
                            </div>
                            <div class="productPage__serviceGrid">
                                <div class="productPage__serviceItem">
                                    <VIcon size="18" color="primary">mdi-truck-fast-outline</VIcon>
                                    <span>Fast regional delivery</span>
                                </div>
                                <div class="productPage__serviceItem">
                                    <VIcon size="18" color="primary">mdi-refresh</VIcon>
                                    <span>Easy returns and exchanges</span>
                                </div>
                                <div class="productPage__serviceItem">
                                    <VIcon size="18" color="primary">mdi-shield-check-outline</VIcon>
                                    <span>Secure checkout experience</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="productPage__detailsGrid">
                    <div class="productPage__detailsCard">
                        <span class="productPage__sectionEyebrow">Product details</span>
                        <h2 class="productPage__sectionTitle">More context before you commit.</h2>
                        <VExpansionPanels v-model="panel" multiple variant="accordion" class="productPage__accordion">
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Description</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <p class="productPage__detailText">{{ product.description || "A carefully selected product with balanced styling, everyday function, and a polished finish." }}</p>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Buying notes</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <ul class="productPage__detailList">
                                        <li>Choose your preferred option before adjusting quantity.</li>
                                        <li>Pricing updates instantly based on the selected variant.</li>
                                        <li>Shipping updates at checkout, and tax display follows the selected region.</li>
                                    </ul>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Why customers like it</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <p class="productPage__detailText">
                                        Designed to feel premium without becoming fussy, this product balances presentation, utility, and
                                        easy everyday use.
                                    </p>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </div>
                    <div class="productPage__reviewsCard">
                        <div class="productPage__reviewsHeader">
                            <div>
                                <span class="productPage__sectionEyebrow">Customer feedback</span>
                                <h2 class="productPage__sectionTitle">What shoppers are saying.</h2>
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
                <section v-if="relatedProducts.length" class="productPage__related">
                    <div class="productPage__relatedIntro">
                        <span class="productPage__sectionEyebrow">Related products</span>
                        <h2 class="productPage__sectionTitle">More from the same shopping lane.</h2>
                        <p class="productPage__sectionText">
                            Picked from the same category so the next suggestion still feels aligned with what you are viewing now.
                        </p>
                    </div>
                    <VRow class="productPage__relatedGrid" align="stretch">
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
.productPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 42%, #f7faff 100%);
}

.productPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.productPage__container {
    position: relative;
    z-index: 1;
}

.productPage__heroGrid,
.productPage__detailsGrid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.productPage__heroGrid {
    grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
    align-items: start;
}

.productPage__content {
    display: grid;
    gap: 1rem;
}

.productPage__galleryCard,
.productPage__introCard,
.productPage__purchaseCard,
.productPage__detailsCard,
.productPage__reviewsCard {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.productPage__galleryCard {
    position: sticky;
    top: 1.5rem;
    padding: 1rem;
}

.productPage__saleBadge {
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

.productPage__mainImageWrap {
    overflow: hidden;
    margin-top: 0.9rem;
    border-radius: 1.25rem;
    aspect-ratio: 0.85;
    background: radial-gradient(circle at top, rgba(0, 128, 255, 0.14), transparent 34%), linear-gradient(180deg, #eef5ff 0%, #dfeafc 100%);
}

.productPage__mainImage {
    width: 100%;
    height: 100%;
}

.productPage__thumbGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.9rem;
}

.productPage__thumbButton {
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.95);
    cursor: pointer;
    transition:
        transform 0.25s ease,
        border-color 0.25s ease;
}

.productPage__thumbButton:hover,
.productPage__thumbButton--active {
    transform: translateY(-2px);
    border-color: rgba(1, 12, 128, 0.18);
}

.productPage__thumbImage {
    aspect-ratio: 1;
    border-radius: 0.8rem;
}

.productPage__introCard,
.productPage__purchaseCard,
.productPage__detailsCard,
.productPage__reviewsCard {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.productPage__introTop,
.productPage__priceRow,
.productPage__labelRow,
.productPage__reviewsHeader {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.productPage__breadcrumbs {
    margin-bottom: 0.9rem;
}

.productPage__introTop,
.productPage__reviewsHeader {
    align-items: center;
}

.productPage__eyebrow,
.productPage__sectionEyebrow {
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

.productPage__ratingSummary {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #5a6480;
    font-size: 0.92rem;
}

.productPage__ratingStar {
    color: #f7ae2b;
}

.productPage__title,
.productPage__sectionTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.productPage__title {
    margin: 1rem 0 0.75rem;
    font-size: clamp(2.4rem, 4.4vw, 4.25rem);
    line-height: 0.95;
}

.productPage__subtitle,
.productPage__description,
.productPage__sectionText,
.productPage__detailText,
.productPage__outOfStockCard {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.productPage__subtitle {
    margin-bottom: 0.75rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
}

.productPage__tagRow {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.25rem;
}

.productPage__tag {
    border: 1px solid rgba(8, 23, 63, 0.08);
    background: rgba(247, 250, 255, 0.95);
    color: #08173f;
}

.productPage__priceBlock {
    margin-top: 1.4rem;
}

.productPage__priceRow {
    align-items: baseline;
    justify-content: flex-start;
    gap: 0.75rem;
}

.productPage__price {
    color: #08173f;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    font-weight: 700;
    line-height: 1;
}

.productPage__originalPrice {
    color: #d9424e;
    font-size: 1rem;
}

.productPage__inventory {
    margin-top: 0.55rem;
    font-size: 0.92rem;
    font-weight: 700;
}

.productPage__taxMeta {
    margin-top: 0.6rem;
    color: #5a6480;
    font-size: 0.92rem;
    line-height: 1.5;
}

.productPage__inventory--in {
    color: #1e8b58;
}

.productPage__inventory--out {
    color: #d9424e;
}

.productPage__variantBlock {
    display: grid;
    gap: 0.9rem;
}

.productPage__labelRow {
    align-items: center;
}

.productPage__label,
.productPage__factLabel,
.productPage__labelValue {
    color: #6a7590;
    font-size: 0.88rem;
}

.productPage__labelValue {
    font-weight: 700;
}

.productPage__variantToggle {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.productPage__variantBtn {
    min-height: 2.6rem;
    padding-inline: 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px !important;
    background: rgba(247, 250, 255, 0.95);
    color: #08173f;
    font-weight: 700;
}

.productPage__factsGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.productPage__factCard {
    display: grid;
    gap: 0.35rem;
    padding: 0.95rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.92);
}

.productPage__factValue {
    color: #08173f;
    line-height: 1.4;
}

.productPage__ctaRow {
    display: flex;
    align-items: end;
    gap: 1rem;
    margin-top: 1.35rem;
}

.productPage__qtyBlock {
    display: grid;
    gap: 0.55rem;
}

.productPage__qtyControl {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
}

.productPage__qtyValue {
    min-width: 2.2rem;
    color: #08173f;
    font-weight: 700;
    text-align: center;
}

.productPage__cartBtn {
    min-width: min(18rem, 100%);
    min-height: 3.1rem;
    font-weight: 700;
}

.productPage__outOfStockCard {
    margin-top: 1.35rem;
    padding: 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.92);
}

.productPage__serviceGrid {
    display: grid;
    gap: 0.85rem;
    margin-top: 1.35rem;
}

.productPage__serviceItem {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: #33415f;
}

.productPage__detailsGrid {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    margin-top: clamp(2rem, 4vw, 3rem);
}

.productPage__sectionTitle {
    margin: 1rem 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.productPage__accordion {
    margin-top: 1.15rem;
}

.productPage__detailList {
    margin: 0;
    padding-left: 1.15rem;
    color: #4b5874;
    line-height: 1.8;
}

.productPage__related {
    margin-top: clamp(2.25rem, 4vw, 3.5rem);
}

.productPage__relatedIntro {
    max-width: 38rem;
    margin-bottom: 1.5rem;
}

.productPage__relatedGrid {
    margin-top: 0;
}

@media screen and (max-width: 1200px) {
    .productPage__heroGrid,
    .productPage__detailsGrid {
        grid-template-columns: 1fr;
    }

    .productPage__galleryCard {
        position: static;
    }
}

@media screen and (max-width: 800px) {
    .productPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .productPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .productPage__galleryCard,
    .productPage__introCard,
    .productPage__purchaseCard,
    .productPage__detailsCard,
    .productPage__reviewsCard {
        border-radius: 1.2rem;
    }

    .productPage__thumbGrid,
    .productPage__factsGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .productPage__ctaRow,
    .productPage__reviewsHeader,
    .productPage__introTop,
    .productPage__labelRow {
        flex-direction: column;
        align-items: flex-start;
    }

    .productPage__cartBtn {
        width: 100%;
    }
}

@media screen and (max-width: 560px) {
    .productPage__thumbGrid,
    .productPage__factsGrid {
        grid-template-columns: 1fr;
    }

    .productPage__variantToggle {
        flex-direction: column;
        align-items: stretch;
    }

    .productPage__variantBtn {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .productPage__thumbButton {
        transition: none;
    }
}
</style>
