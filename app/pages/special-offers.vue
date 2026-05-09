<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"
import type { LocationQueryRaw } from "vue-router"
import type { BreadcrumbItem } from "~/types/breadcrumbs"
import type { ProductListResponse } from "~/types/product"

import CategoryPagination from "~/components/Category/CategoryPagination.vue"
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const route = useRoute()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ label: "Home", to: "/" }, { label: "Special Offers" }])

const limit = 12
const browsingNotes = ["Sale products appear first", "Pricing updates automatically", "Two-up mobile browsing for faster scanning"]
const currentPage = computed<number>(() => parsePage(route.query.page))
const offset = computed<number>(() => (currentPage.value - 1) * limit)
const productParams = computed(() => ({
    ...(regionStoreId.value ? { region_id: regionStoreId.value } : {}),
    ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {}),
    limit,
    offset: offset.value,
    view: "card"
}))

const { data, pending, error } = await useFetch<ProductListResponse>("/api/products/on-sale", {
    params: productParams,
    watch: [regionStoreId, selectedCountryCode, currentPage]
})

const offerProducts = computed<ProductDTO[]>(() => data.value?.products ?? [])
const totalOfferProducts = computed<number>(() => data.value?.count ?? offerProducts.value.length)
const totalPages = computed<number>(() => Math.max(1, Math.ceil(totalOfferProducts.value / limit)))
const paginationLabel = computed<string>(() => `Page ${currentPage.value} of ${totalPages.value}`)
const paginationItems = computed<(number | string)[]>(() => {
    if (totalPages.value <= 7) {
        return Array.from({ length: totalPages.value }, (_, index) => index + 1)
    }

    const pages = new Set<number>([1, totalPages.value, currentPage.value])

    if (currentPage.value > 1) {
        pages.add(currentPage.value - 1)
    }

    if (currentPage.value < totalPages.value) {
        pages.add(currentPage.value + 1)
    }

    const sortedPages = [...pages].sort((left, right) => left - right)
    const items: (number | string)[] = []

    for (const page of sortedPages) {
        const previousPage = items.at(-1)

        if (typeof previousPage === "number" && page - previousPage > 1) {
            items.push(`ellipsis-${previousPage}-${page}`)
        }

        items.push(page)
    }

    return items
})

function parsePage(page: unknown): number {
    const parsedPage = Number(Array.isArray(page) ? page[0] : page)

    return Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
}

function buildPageLink(page: number): { query: LocationQueryRaw } {
    const query: LocationQueryRaw = {}

    if (page > 1) {
        query.page = String(page)
    }

    return { query }
}

useHead({
    title: "Special Offers | Medusa Commerce"
})

useSeoMeta({
    description: "Browse current discounted products in a premium mobile-first special offers layout with live sale pricing."
})
</script>

<template>
    <section class="bg-linear-to-b from-blue-50 via-white to-slate-50">
        <div class="px-0 pt-15 pb-8 sm:pt-18 xl:pt-23">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div class="rounded-panel relative overflow-hidden border border-white/80 bg-slate-950 shadow-2xl sm:rounded-4xl">
                    <NuxtImage
                        src="/images/hero-premium.jpg"
                        alt="Premium special offers editorial visual"
                        width="1600"
                        height="720"
                        sizes="100vw xl:1280px"
                        format="webp"
                        quality="72"
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        class="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div class="absolute inset-0 bg-slate-950/55"></div>
                    <div class="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-slate-950/20"></div>

                    <div class="relative z-10 flex min-h-80 flex-col justify-between gap-8 p-4 sm:min-h-96 sm:p-6 lg:min-h-112">
                        <div class="text-label-sm inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/92 px-4 py-2 font-semibold tracking-widest text-slate-950 shadow-lg">
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Sale campaign view
                        </div>
                        <div class="max-w-3xl rounded-3xl border border-white/15 bg-slate-950/72 p-5 text-white shadow-xl backdrop-blur-sm sm:p-7">
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 font-bold text-amber-100 uppercase"
                            >
                                Special offers
                            </span>
                            <h1 class="mt-4 max-w-xs text-4xl leading-none font-bold tracking-tight text-white sm:max-w-sm sm:text-5xl lg:text-6xl">
                                Current sale products in one place.
                            </h1>
                            <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base sm:leading-7">
                                Explore discounted products in the catalog without jumping through categories. The page keeps the same
                                polished feel as the newer storefront experience while making mobile browsing denser and faster.
                            </p>
                            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <NuxtLink to="/contact" class="ui-btn-accent min-h-12 px-6"> Ask about an offer </NuxtLink>
                                <NuxtLink
                                    to="/category/all-products"
                                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-hidden"
                                >
                                    Browse full catalog
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
            <div class="grid gap-4 sm:grid-cols-3">
                <article class="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-lg">
                    <p class="text-xs font-bold tracking-widest text-slate-500 uppercase">Sale products</p>
                    <p class="mt-2 text-2xl leading-none font-semibold text-slate-950">{{ totalOfferProducts }}</p>
                </article>
                <article class="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-lg">
                    <p class="text-xs font-bold tracking-widest text-slate-500 uppercase">Sorted by</p>
                    <p class="mt-2 text-base leading-6 font-semibold text-slate-950">Sale products first</p>
                </article>
                <article class="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-lg">
                    <p class="text-xs font-bold tracking-widest text-slate-500 uppercase">Mobile UX</p>
                    <p class="mt-2 text-base leading-6 font-semibold text-slate-950">Two products per row where space allows</p>
                </article>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <div
                v-if="pending"
                class="grid place-items-center rounded-3xl border border-slate-200 bg-white/90 px-6 py-16 text-center shadow-lg"
            >
                <div class="border-brand-200 border-t-brand-700 h-10 w-10 animate-spin rounded-full border-2"></div>
                <p class="mt-4 text-sm leading-6 text-slate-600">Loading sale products...</p>
            </div>

            <div
                v-else-if="error"
                class="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-red-700 shadow-md"
            >
                Could not load special offers right now.
            </div>

            <div v-else-if="offerProducts.length" class="grid gap-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div class="max-w-136">
                        <span
                            class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                        >
                            On sale now
                        </span>
                        <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Discounted products currently available.
                        </h2>
                    </div>
                    <ul class="grid gap-2 text-sm text-slate-600 sm:text-right">
                        <li v-for="note in browsingNotes" :key="note">{{ note }}</li>
                    </ul>
                </div>

                <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    <ProductCard v-for="product in offerProducts" :key="product.id" :product="product" compact />
                </div>

                <CategoryPagination
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    :pagination-items="paginationItems"
                    :pagination-label="paginationLabel"
                    :build-page-link="buildPageLink"
                />
            </div>

            <div
                v-else
                class="grid justify-items-start gap-4 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-xl sm:p-8"
            >
                <div
                    class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-900"
                >
                    <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" stroke="currentColor" stroke-width="1.8">
                        <path d="M7 7h10l3 3-8 8-6-6 1-5Z" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-3xl leading-tight font-bold tracking-tight text-slate-950">
                        No sale products live right now
                    </h2>
                    <p class="mt-3 max-w-136 text-sm leading-7 text-slate-600 sm:text-base">
                        Sale products will appear here automatically once discounts are available.
                    </p>
                </div>
                <NuxtLink to="/" class="ui-btn-primary px-6">Browse the full shop</NuxtLink>
            </div>
        </div>
    </section>
</template>
