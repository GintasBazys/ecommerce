<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

interface ProductListResponse {
    products?: ProductDTO[]
}

const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Special Offers" }])

const saleHighlights = [
    "Curated discounts across the current catalog",
    "Same polished product experience as the rest of the shop",
    "Quick add-to-cart from the listing view"
]

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
                <div class="grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] xl:gap-10">
                    <div class="max-w-[40rem] xl:pb-6">
                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                        <span
                            class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                        >
                            Special offers
                        </span>
                        <h1
                            class="mt-4 text-[2.1rem] font-bold leading-[1] tracking-[-0.06rem] text-slate-950 sm:text-[2.9rem] sm:leading-[0.98] xl:max-w-[11ch] xl:text-[4.1rem] xl:leading-[0.96]"
                        >
                            All current sale products, gathered into one premium place to browse.
                        </h1>
                        <p class="mt-4 max-w-[38rem] text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
                            Explore every discounted product in the catalog without jumping through categories. The page keeps the same
                            polished feel as the newer storefront experience while making mobile browsing denser and faster.
                        </p>
                        <div class="mt-7 flex flex-wrap items-center gap-3">
                            <NuxtLink to="/contact" class="ui-btn-primary px-7">Ask about an offer</NuxtLink>
                            <NuxtLink to="/products" class="ui-btn-secondary px-6">Browse full catalog</NuxtLink>
                        </div>
                    </div>

                    <div
                        class="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-[2rem] sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.75rem]">
                            <NuxtImg
                                src="/images/hero-premium.jpg"
                                alt="Premium special offers editorial visual"
                                width="1200"
                                height="1411"
                                sizes="100vw lg:45vw"
                                format="webp"
                                quality="68"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-[1.08] w-full object-cover object-center"
                            />
                            <div
                                class="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.2),transparent_45%,rgba(255,255,255,0.08))]"
                            ></div>
                        </div>

                        <div
                            class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.1)] sm:left-5 sm:top-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Sale campaign view
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.9))] p-4 text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <span class="text-[0.73rem] font-bold uppercase tracking-[0.14em] text-amber-200">What to expect</span>
                            <ul class="mt-4 grid gap-3">
                                <li
                                    v-for="highlight in saleHighlights"
                                    :key="highlight"
                                    class="flex items-start gap-3 text-sm leading-6 text-slate-100"
                                >
                                    <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-300"></span>
                                    <span>{{ highlight }}</span>
                                </li>
                            </ul>
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
