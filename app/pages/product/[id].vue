<script setup lang="ts">
import type { Review, ReviewApiResponse } from "@/types/interfaces"
import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { SchemaNode } from "~/composables/useStructuredData"

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

interface GalleryImage {
    id: string
    src: string
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
        query: {
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

const productImages = computed<GalleryImage[]>(() => {
    const fallbackImage = product.value?.thumbnail || "/images/placeholder.png"
    const gallery = (product.value?.images ?? [])
        .map((image, index) => {
            const src = typeof image.url === "string" && image.url.trim() ? image.url : ""

            if (!src) {
                return null
            }

            return {
                id: image.id || `${product.value?.id || "product"}-image-${index}`,
                src
            }
        })
        .filter((image): image is GalleryImage => Boolean(image))

    if (!gallery.length) {
        return [{ id: `${product.value?.id || "product"}-fallback`, src: fallbackImage }]
    }

    if (product.value?.thumbnail && !gallery.some((image) => image.src === product.value?.thumbnail)) {
        gallery.unshift({ id: `${product.value.id}-thumbnail`, src: product.value.thumbnail })
    }

    return gallery
})

const productTags = computed(() => product.value?.tags ?? [])
const productMetadata = computed<Record<string, unknown>>(() => {
    const metadata = product.value?.metadata

    return metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {}
})

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
const metadataAverageRating = computed<number | null>(() => {
    const rating = Number(productMetadata.value.averageRating)

    return rating > 0 ? Number(rating.toFixed(1)) : null
})
const metadataReviewCount = computed<number | null>(() => {
    const value = Number(
        productMetadata.value.reviewCount || productMetadata.value.reviewsCount || productMetadata.value.review_count || 0
    )

    return value > 0 ? value : null
})
const displayedReviewAverage = computed<number | null>(() => (reviewAverage.value > 0 ? reviewAverage.value : metadataAverageRating.value))
const displayedReviewCount = computed<number>(() => reviews.value.length || metadataReviewCount.value || 0)

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

const schemaImages = computed<string[]>(() => productImages.value.map((image) => absoluteUrl(image.src)))

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
            : displayedReviewAverage.value && displayedReviewCount.value
              ? {
                    "@type": "AggregateRating",
                    ratingValue: displayedReviewAverage.value,
                    reviewCount: displayedReviewCount.value,
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
    activeImageIndex.value = Math.min(Math.max(index, 0), Math.max(productImages.value.length - 1, 0))
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
            query: { product_id: review.productId, limit: 10, offset: 0 }
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
                    query: { product_id: id, limit: 10, offset: 0 }
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
    <section v-if="product" class="bg-slate-50">
        <div class="px-0 pb-10 pt-15 sm:pb-12 sm:pt-18 xl:pb-16 xl:pt-23">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(21rem,0.98fr)] xl:gap-8">
                    <ProductPageGallery
                        :product-title="product.title"
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
                            :product-title="product.title"
                            :product-subtitle="product.subtitle"
                            :product-description="
                                product.description || 'A refined product pick designed to feel premium, practical, and easy to wear every day.'
                            "
                            :product-tags="productTags"
                            :selected-variant="selectedVariant"
                            :display-price="displayPrice"
                            :original-price="originalPrice"
                            :is-on-sale="isOnSale"
                            :tax-label="taxLabel"
                            :in-stock="inStock"
                        />

                        <ProductPagePurchase
                            :variants="product.variants"
                            :selected-variant-id="selectedVariantId"
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
                    </div>
                </div>

                <div class="mt-8">
                    <ProductPageDetails
                        :product-description="
                            product.description || 'A carefully selected product with balanced styling, everyday function, and a polished finish.'
                        "
                    />
                </div>

                <ProductPageReviews
                    :customer="customer"
                    :reviews="reviews"
                    :average-rating="displayedReviewAverage"
                    :review-count="displayedReviewCount"
                    @open-review="showReviewForm = true"
                />

                <ProductPageRelated :related-products="relatedProducts" />
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="customer && showReviewForm"
                class="fixed inset-0 z-90 flex items-end bg-slate-950/55 p-4 sm:items-center sm:justify-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-review-dialog-title"
                @click.self="showReviewForm = false"
            >
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
            </div>
        </Teleport>
    </section>
</template>
