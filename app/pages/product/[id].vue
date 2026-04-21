<script setup lang="ts">
import type { Review, ReviewApiResponse } from "@/types/interfaces"
import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { useDragScroll } from "~/composables/useDragScroll"
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
const mobileGalleryTrack = ref<HTMLElement | null>(null)
const relatedRailRef = ref<HTMLElement | null>(null)

const { onPointerDown, onClickCapture, onDragStart } = useDragScroll(relatedRailRef)

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
    activeImageIndex.value = index

    const selectedSlide = mobileGalleryTrack.value?.children.item(index)

    if (!(selectedSlide instanceof HTMLElement)) {
        return
    }

    selectedSlide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    })
}

function syncActiveImageFromScroll(): void {
    const track = mobileGalleryTrack.value

    if (!track) {
        return
    }

    const slideWidth = track.clientWidth

    if (!slideWidth) {
        return
    }

    const nextIndex = Math.round(track.scrollLeft / slideWidth)
    activeImageIndex.value = Math.min(Math.max(nextIndex, 0), Math.max(productImages.value.length - 1, 0))
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
    <section v-if="product" class="product-page">
        <div class="px-0 pb-10 pt-15 sm:pb-12 sm:pt-18 xl:pb-16 xl:pt-23">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(21rem,0.98fr)] xl:gap-8">
                    <div>
                        <div
                            class="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/92 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-4xl sm:p-4"
                        >
                            <div class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(205,164,94,0.18),transparent_60%)]"></div>
                            <div v-if="isOnSale" class="absolute left-5 top-5 z-10 inline-flex rounded-full bg-rose-500 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-white">
                                Sale
                            </div>

                            <div
                                ref="mobileGalleryTrack"
                                class="product-page__mobile-gallery-track -mx-3 flex snap-x snap-mandatory overflow-x-auto px-3 lg:hidden"
                                @scroll.passive="syncActiveImageFromScroll"
                            >
                                <div v-for="(image, index) in productImages" :key="image.id" class="min-w-full snap-center px-0.5">
                                    <div class="relative overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_top,rgba(0,128,255,0.14),transparent_34%),linear-gradient(180deg,#eef5ff_0%,#dfeafc_100%)]">
                                        <NuxtImage
                                            :src="image.src"
                                            :alt="`${product.title} image ${index + 1}`"
                                            width="1200"
                                            height="1411"
                                            sizes="100vw"
                                            loading="eager"
                                            class="block aspect-[0.88] w-full object-cover object-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="hidden lg:block lg:space-y-4">
                                <div class="relative overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top,rgba(0,128,255,0.14),transparent_34%),linear-gradient(180deg,#eef5ff_0%,#dfeafc_100%)]">
                                    <NuxtImage
                                        :src="activeImage?.src || '/images/placeholder.png'"
                                        :alt="activeImage?.src ? `${product.title} image` : product.title"
                                        width="1200"
                                        height="1411"
                                        sizes="(max-width: 1279px) 100vw, 48vw"
                                        loading="eager"
                                        class="block aspect-[0.92] w-full object-cover object-center"
                                    />
                                </div>

                                <div v-if="productImages.length > 1" class="grid grid-cols-4 gap-3">
                                    <button
                                        v-for="(image, index) in productImages"
                                        :key="image.id"
                                        type="button"
                                        class="overflow-hidden rounded-2xl border bg-slate-50/95 p-1.5 text-left transition motion-reduce:transition-none"
                                        :class="index === activeImageIndex ? 'border-amber-300 shadow-[0_10px_24px_rgba(8,27,90,0.08)]' : 'border-slate-200/80 hover:border-amber-200'"
                                        :aria-pressed="index === activeImageIndex"
                                        :aria-label="`Show image ${index + 1}`"
                                        @click="selectImage(index)"
                                    >
                                        <NuxtImage
                                            :src="image.src"
                                            :alt="`${product.title} thumbnail ${index + 1}`"
                                            width="300"
                                            height="300"
                                            loading="lazy"
                                            format="png"
                                            class="block aspect-square w-full rounded-[0.8rem] object-cover object-center"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div v-if="productImages.length > 1" class="mt-4 flex items-center justify-center gap-2 lg:hidden">
                                <button
                                    v-for="(image, index) in productImages"
                                    :key="`${image.id}-dot-${index}`"
                                    type="button"
                                    class="h-2.5 rounded-full transition motion-reduce:transition-none"
                                    :class="index === activeImageIndex ? 'w-7 bg-slate-950' : 'w-2.5 bg-slate-300'"
                                    :aria-label="`Go to image ${index + 1}`"
                                    :aria-pressed="index === activeImageIndex"
                                    @click="selectImage(index)"
                                ></button>
                            </div>
                        </div>
                    </div>

                    <div class="grid gap-4 xl:gap-5">
                        <div class="rounded-[1.75rem] border border-white/80 bg-white/94 p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] backdrop-blur sm:rounded-4xl sm:p-7 xl:p-8">
                            <div class="flex flex-col gap-4 sm:gap-5">
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                                        <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                                            Product detail
                                        </span>
                                    </div>
                                    <div
                                        v-if="displayedReviewAverage"
                                        class="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900"
                                        aria-label="Product rating"
                                    >
                                        <span class="flex items-center gap-1 text-[0.95rem] text-amber-500" aria-hidden="true">
                                            <span v-for="star in 5" :key="star">{{ star <= Math.round(displayedReviewAverage) ? '★' : '☆' }}</span>
                                        </span>
                                        <span>{{ displayedReviewAverage }} / 5</span>
                                    </div>
                                </div>

                                <div>
                                    <h1 class="max-w-[12ch] text-[2.2rem] font-bold leading-[0.96] tracking-[-0.06rem] text-slate-950 sm:text-[3.1rem] xl:text-[4.25rem]">
                                        {{ product.title }}
                                    </h1>
                                    <p v-if="product.subtitle" class="mt-3 text-sm font-semibold uppercase tracking-widest text-slate-700">
                                        {{ product.subtitle }}
                                    </p>
                                    <p class="mt-4 max-w-2xl text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                                        {{
                                            product.description ||
                                                'A refined product pick designed to feel premium, practical, and easy to wear every day.'
                                        }}
                                    </p>
                                </div>

                                <div v-if="productTags.length" class="flex flex-wrap gap-2">
                                    <span
                                        v-for="tag in productTags"
                                        :key="tag.id"
                                        class="inline-flex min-h-9 items-center rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700"
                                    >
                                        {{ tag.value }}
                                    </span>
                                </div>

                                <div v-if="selectedVariant" class="border-t border-slate-200/80 pt-5">
                                    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                                        <span class="text-[2rem] font-bold leading-none text-slate-950 sm:text-[2.5rem]">{{ displayPrice }}</span>
                                        <del v-if="isOnSale && originalPrice" class="text-base font-semibold text-rose-500">{{ originalPrice }}</del>
                                    </div>
                                    <p class="mt-3 text-sm leading-6 text-slate-500">{{ taxLabel }}</p>
                                    <p
                                        class="mt-2 text-sm font-semibold"
                                        :class="inStock ? 'text-emerald-700' : 'text-rose-600'"
                                    >
                                        {{ inStock ? 'Ready to ship' : 'Currently unavailable' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="rounded-[1.75rem] border border-white/80 bg-white/94 p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] backdrop-blur sm:rounded-4xl sm:p-7 xl:p-8">
                            <div v-if="product.variants.length" class="grid gap-4">
                                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span class="text-sm font-medium text-slate-500">Select option</span>
                                    <span class="text-sm font-semibold text-slate-900">{{ selectedVariant?.title || 'Choose a variant' }}</span>
                                </div>
                                <div class="flex flex-wrap gap-2.5">
                                    <button
                                        v-for="variant in product.variants"
                                        :key="variant.id"
                                        type="button"
                                        class="inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                                        :class="variant.id === selectedVariantId ? 'border-amber-300 bg-amber-50 text-slate-950 shadow-[0_10px_24px_rgba(8,27,90,0.08)]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-200 hover:text-slate-950'"
                                        :aria-pressed="variant.id === selectedVariantId"
                                        @click="selectedVariantId = variant.id"
                                    >
                                        {{ variant.title }}
                                    </button>
                                </div>
                            </div>

                            <div class="mt-5 grid gap-3 sm:grid-cols-3">
                                <div
                                    v-for="fact in productFacts"
                                    :key="fact.label"
                                    class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50/90 p-4"
                                >
                                    <span class="block text-[0.82rem] uppercase tracking-[0.12em] text-slate-500">{{ fact.label }}</span>
                                    <strong class="mt-2 block text-sm leading-6 text-slate-950">{{ fact.value }}</strong>
                                </div>
                            </div>

                            <div v-if="selectedVariant && inStock" class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div class="grid gap-2">
                                    <span class="text-sm font-medium text-slate-500">Quantity</span>
                                    <div class="inline-flex min-h-12 items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                                        <button
                                            type="button"
                                            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                                            :disabled="quantity <= 1"
                                            aria-label="Decrease quantity"
                                            @click="decrement"
                                        >
                                            <span aria-hidden="true" class="text-lg leading-none">−</span>
                                        </button>
                                        <span class="min-w-10 text-center text-base font-semibold text-slate-950">{{ quantity }}</span>
                                        <button
                                            type="button"
                                            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                                            :disabled="quantity >= maxStock"
                                            aria-label="Increase quantity"
                                            @click="increment"
                                        >
                                            <span aria-hidden="true" class="text-lg leading-none">+</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#cda45e] px-6 text-base font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[16rem] motion-reduce:transition-none"
                                    :disabled="!selectedVariant || quantity < 1 || quantity > maxStock || adding"
                                    @click="addToCart"
                                >
                                    {{ adding ? 'Adding...' : 'Add to cart' }}
                                </button>
                            </div>

                            <div v-else class="mt-5 rounded-[1.1rem] border border-slate-200/80 bg-slate-50/90 p-4 text-sm leading-7 text-slate-600">
                                This variant is currently unavailable. Try another option or browse related products below.
                            </div>

                            <div class="mt-5 grid gap-3 border-t border-slate-200/80 pt-5 sm:grid-cols-3">
                                <div class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-medium text-slate-700">
                                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-100">
                                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                            <path d="M3 7h11v8H3z" />
                                            <path d="M14 10h3l4 4v1h-7z" />
                                            <circle cx="7.5" cy="17.5" r="1.5" />
                                            <circle cx="17.5" cy="17.5" r="1.5" />
                                        </svg>
                                    </span>
                                    <span>Fast regional delivery</span>
                                </div>
                                <div class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-medium text-slate-700">
                                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-100">
                                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                            <path d="M4 4v6h6" />
                                            <path d="M20 20v-6h-6" />
                                            <path d="M20 9A8 8 0 0 0 6.3 5.3L4 7" />
                                            <path d="M4 15a8 8 0 0 0 13.7 3.7L20 17" />
                                        </svg>
                                    </span>
                                    <span>Easy returns and exchanges</span>
                                </div>
                                <div class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-medium text-slate-700">
                                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-100">
                                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                            <path d="M12 3l7 3v5c0 4.4-2.9 8.4-7 9-4.1-.6-7-4.6-7-9V6z" />
                                            <path d="m9.5 12 1.7 1.7 3.3-3.4" />
                                        </svg>
                                    </span>
                                    <span>Secure checkout experience</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8">
                    <div class="rounded-[1.75rem] border border-white/80 bg-white/94 p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] backdrop-blur sm:rounded-4xl sm:p-7 xl:p-8">
                        <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                            Product details
                        </span>
                        <h2 class="mt-4 max-w-[14ch] text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05rem] text-slate-950 sm:text-[2.3rem]">
                            More context before you commit.
                        </h2>

                        <div class="mt-6 grid gap-3 xl:grid-cols-3">
                            <details class="group rounded-[1.3rem] border border-slate-200/80 bg-slate-50/70 p-4" open>
                                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                                    Description
                                    <span class="text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                                </summary>
                                <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                                    {{
                                        product.description ||
                                            'A carefully selected product with balanced styling, everyday function, and a polished finish.'
                                    }}
                                </p>
                            </details>

                            <details class="group rounded-[1.3rem] border border-slate-200/80 bg-slate-50/70 p-4">
                                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                                    Buying notes
                                    <span class="text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                                </summary>
                                <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                                    <li>Choose your preferred option before adjusting quantity.</li>
                                    <li>Pricing updates instantly based on the selected variant.</li>
                                    <li>Shipping updates at checkout, and tax display follows the selected region.</li>
                                </ul>
                            </details>

                            <details class="group rounded-[1.3rem] border border-slate-200/80 bg-slate-50/70 p-4">
                                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                                    Why customers like it
                                    <span class="text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                                </summary>
                                <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                                    Designed to feel premium without becoming fussy, this product balances presentation, utility, and easy
                                    everyday use.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
                <div class="product-page__reviews-card">
                    <div class="product-page__reviews-header">
                        <div>
                            <span class="product-page__section-eyebrow">Customer feedback</span>
                            <h2 class="product-page__section-title">What shoppers are saying.</h2>
                            <p class="product-page__section-text mt-3 max-w-xl">
                                Read recent feedback from verified shoppers before making a decision.
                            </p>
                        </div>
                        <button
                            v-if="customer"
                            type="button"
                            class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                            @click="showReviewForm = true"
                        >
                            Write a review
                        </button>
                    </div>
                    <ProductReviews :reviews="reviews" :average-rating="displayedReviewAverage" :review-count="displayedReviewCount" />
                </div>
                <section
                    v-if="relatedProducts.length"
                    class="product-page__related overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top_right,rgba(202,138,4,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_24%),linear-gradient(180deg,#f7f8fb_0%,#ffffff_100%)] px-5 py-6 sm:rounded-4xl sm:px-7 sm:py-8 xl:px-8"
                >
                    <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div class="max-w-184">
                            <span class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900">
                                Related products
                            </span>
                            <h2 class="mt-4 max-w-[13ch] text-[clamp(2rem,6vw,3.25rem)] font-bold leading-[0.97] tracking-[-0.05rem] text-slate-950">
                                More from the same
                                <span class="font-medium italic text-[#8a6a2f]">shopping lane</span>
                            </h2>
                            <p class="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-700">
                                Picked from the same category so the next suggestion still feels aligned with what you are viewing now.
                            </p>
                        </div>

                        <NuxtLink
                            to="/special-offers"
                            class="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.05)] transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 lg:self-auto"
                        >
                            Explore more picks
                        </NuxtLink>
                    </div>

                    <div class="relative mt-9">
                        <div class="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-linear-to-r from-[#fbfbfc] to-transparent lg:block"></div>
                        <div class="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-linear-to-l from-[#ffffff] to-transparent lg:block"></div>

                        <div
                            ref="relatedRailRef"
                            class="catalog-rail flex gap-4 overflow-x-auto pb-4 pl-0 pr-6 pt-1 sm:gap-5 sm:pr-8"
                            aria-label="Related products"
                            tabindex="0"
                            @pointerdown="onPointerDown"
                            @click.capture="onClickCapture"
                            @dragstart="onDragStart"
                        >
                            <div
                                v-for="relatedProduct in relatedProducts"
                                :key="relatedProduct.id"
                                class="rail-item shrink-0 basis-[82%] sm:basis-[47%] lg:basis-[31%] xl:basis-[24%] 2xl:basis-[20%]"
                            >
                                <ProductCard :product="relatedProduct" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="customer && showReviewForm"
                class="fixed inset-0 z-90 flex items-end bg-slate-950/55 p-4 backdrop-blur-[2px] sm:items-center sm:justify-center"
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

<style scoped lang="scss">
.product-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 42%, #f7faff 100%);
}

.product-page__mobile-gallery-track {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
}

.product-page__mobile-gallery-track::-webkit-scrollbar {
    display: none;
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

.catalog-rail {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable both-edges;
    scrollbar-width: thin;
    scrollbar-color: rgba(120, 53, 15, 0.72) rgba(241, 245, 249, 0.92);
    cursor: grab;
    user-select: none;
    scroll-behavior: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: none;
}

.rail-item {
    min-width: 0;
    scroll-snap-align: none;
    scroll-snap-stop: normal;
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

@media (hover: none) and (pointer: coarse) {
    .catalog-rail {
        cursor: auto;
        overscroll-behavior-x: auto;
        user-select: auto;
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
    .product-page__mobile-gallery-track {
        scroll-behavior: auto;
    }

    .catalog-rail {
        scroll-behavior: auto;
    }

    .product-page__thumb-button {
        transition: none;
    }
}
</style>
