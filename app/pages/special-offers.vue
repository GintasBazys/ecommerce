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
    title: "Special Offers | Ecommerce"
})

useSeoMeta({
    description: "Browse current discounted products in a premium mobile-first special offers layout with live sale pricing."
})
</script>

<template>
    <section
        class="bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_36%,#f6f9ff_100%)]"
    >
        <div class="px-0 pb-8 pt-[3.75rem] sm:pt-[4.5rem] xl:pt-[5.75rem]">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div class="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-slate-950 shadow-[0_18px_44px_rgba(8,27,90,0.12)] sm:rounded-[2rem]">
                    <NuxtImage
                        src="/images/hero-premium.jpg"
                        alt="Premium special offers editorial visual"
                        width="1600"
                        height="720"
                        sizes="100vw xl:1280px"
                        format="webp"
                        quality="72"
                        loading="lazy"
                        decoding="async"
                        class="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.52)_38%,rgba(2,6,23,0.18)_68%,rgba(2,6,23,0.18)_100%)]"></div>
                    <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.14)_0%,rgba(15,23,42,0.1)_40%,rgba(15,23,42,0.5)_100%)]"></div>

                    <div class="relative z-10 flex min-h-[20rem] flex-col justify-between gap-8 p-4 sm:min-h-[24rem] sm:p-6 lg:min-h-[28rem]">
                        <div
                            class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/92 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.14)]"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Sale campaign view
                        </div>
                        <div
                            class="max-w-3xl rounded-[1.5rem] border border-white/15 bg-slate-950/72 p-5 text-white shadow-[0_12px_30px_rgba(2,6,23,0.22)] backdrop-blur-[6px] sm:p-7"
                        >
                            <span class="inline-flex min-h-9 items-center rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-100">
                                Special offers
                            </span>
                            <h1 class="mt-4 max-w-[13ch] text-[2rem] font-bold leading-none tracking-[-0.05rem] text-white sm:text-[2.6rem] sm:leading-[0.96] lg:text-[3.2rem]">
                                Current sale products in one place.
                            </h1>
                            <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base sm:leading-7">
                                Explore every discounted product in the catalog without jumping through categories. The page keeps the same
                                polished feel as the newer storefront experience while making mobile browsing denser and faster.
                            </p>
                            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <NuxtLink
                                    to="/contact"
                                    class="inline-flex min-h-12 items-center justify-center rounded-full bg-[#cda45e] px-6 text-sm font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"
                                >
                                    Ask about an offer
                                </NuxtLink>
                                <NuxtLink
                                    to="/products"
                                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/40"
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
                <article
                    class="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_12px_28px_rgba(8,27,90,0.06)]"
                >
                    <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Sale products</p>
                    <p class="mt-2 text-2xl font-semibold leading-none text-slate-950">{{ saleProducts.length }}</p>
                </article>
                <article
                    class="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_12px_28px_rgba(8,27,90,0.06)]"
                >
                    <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Sorted by</p>
                    <p class="mt-2 text-base font-semibold leading-6 text-slate-950">Newest offers first</p>
                </article>
                <article
                    class="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_12px_28px_rgba(8,27,90,0.06)]"
                >
                    <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Mobile UX</p>
                    <p class="mt-2 text-base font-semibold leading-6 text-slate-950">Two products per row where space allows</p>
                </article>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <div
                v-if="pending"
                class="grid place-items-center rounded-[1.8rem] border border-slate-200 bg-white/90 px-6 py-16 text-center shadow-[0_12px_28px_rgba(8,27,90,0.05)]"
            >
                <div class="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"></div>
                <p class="mt-4 text-sm leading-6 text-slate-600">Loading sale products...</p>
            </div>

            <div
                v-else-if="error"
                class="rounded-[1.8rem] border border-red-200 bg-red-50 px-6 py-8 text-red-700 shadow-[0_12px_28px_rgba(8,27,90,0.04)]"
            >
                Could not load special offers right now.
            </div>

            <div v-else-if="saleProducts.length" class="grid gap-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div class="max-w-[34rem]">
                        <span
                            class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700"
                        >
                            On sale now
                        </span>
                        <h2 class="mt-4 text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05rem] text-slate-950 sm:text-[2.35rem]">
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
                class="grid justify-items-start gap-4 rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-6 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-8"
            >
                <div
                    class="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-amber-200/70 bg-amber-50 text-amber-900"
                >
                    <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" stroke="currentColor" stroke-width="1.8">
                        <path d="M7 7h10l3 3-8 8-6-6 1-5Z" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-[1.7rem] font-bold leading-[1.05] tracking-[-0.04rem] text-slate-950">
                        No sale products live right now
                    </h2>
                    <p class="mt-3 max-w-[34rem] text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                        The next offer drop will appear here automatically once discounted products are available.
                    </p>
                </div>
                <NuxtLink to="/" class="ui-btn-primary px-6">Browse the full shop</NuxtLink>
            </div>
        </div>
    </section>
</template>
