<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

interface ProductListResponse {
    products?: ProductDTO[]
}

const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Special Offers" }])

const browsingNotes = ["Newer offers appear first", "Live sale pricing updates automatically", "Two-up mobile browsing for faster scanning"]

const { data, pending, error } = await useFetch<ProductListResponse>("/api/products/products", {
    params: {
        ...(regionStoreId.value ? { region_id: regionStoreId.value } : {}),
        ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {}),
        limit: 100,
        order: "-created_at"
    }
})

const saleProducts = computed<ProductDTO[]>(() =>
    (data.value?.products ?? []).filter((product) =>
        product.variants?.some(
            (variant) =>
                variant.calculated_price?.calculated_price?.price_list_type === "sale" && Boolean(variant.calculated_price?.original_amount)
        )
    )
)

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
                                Explore every discounted product in the catalog without jumping through categories. The page keeps the same
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
                    <p class="mt-2 text-2xl leading-none font-semibold text-slate-950">{{ saleProducts.length }}</p>
                </article>
                <article class="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-lg">
                    <p class="text-xs font-bold tracking-widest text-slate-500 uppercase">Sorted by</p>
                    <p class="mt-2 text-base leading-6 font-semibold text-slate-950">Newest offers first</p>
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

            <div v-else-if="saleProducts.length" class="grid gap-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div class="max-w-136">
                        <span
                            class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                        >
                            On sale now
                        </span>
                        <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Every discounted product currently available.
                        </h2>
                    </div>
                    <ul class="grid gap-2 text-sm text-slate-600 sm:text-right">
                        <li v-for="note in browsingNotes" :key="note">{{ note }}</li>
                    </ul>
                </div>

                <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    <ProductCard v-for="product in saleProducts" :key="product.id" :product="product" compact />
                </div>
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
                        The next offer drop will appear here automatically once discounted products are available.
                    </p>
                </div>
                <NuxtLink to="/" class="ui-btn-primary px-6">Browse the full shop</NuxtLink>
            </div>
        </div>
    </section>
</template>
