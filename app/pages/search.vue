<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"
import type { SearchResponse } from "~/types/interfaces"

import BaseButton from "~/components/Shared/BaseButton.vue"
import { ALL_PRODUCTS_URL_HANDLE } from "~/utils/consts"

definePageMeta({ layout: "default" })

const route = useRoute()
const router = useRouter()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())

const searchInput = ref<string>(String(route.query.q || ""))
const queryText = computed<string>(() => String(route.query.q || "").trim())
const sortOption = computed<string>(() => String(route.query.sort || "relevance"))
const inStockOnly = computed<boolean>(() => String(route.query.in_stock_only || "false") === "true")
const resultLimit = computed<number>(() => {
    const limit = Number(route.query.limit || 24)
    return Number.isInteger(limit) && limit > 0 ? Math.min(limit, 96) : 24
})
const canSearch = computed<boolean>(() => queryText.value.length >= 3 && Boolean(regionStoreId.value && selectedCountryCode.value))
const searchKey = computed<string>(() => [
    "search-results",
    queryText.value,
    regionStoreId.value || "none",
    selectedCountryCode.value || "none",
    sortOption.value,
    inStockOnly.value ? "in-stock" : "all",
    resultLimit.value
].join("-"))

const { data, pending, error, refresh } = await useAsyncData<SearchResponse>(
    searchKey,
    async () => {
        if (!canSearch.value) {
            return { products: [], count: 0 }
        }

        return $fetch<SearchResponse>("/api/search", {
            method: "POST",
            query: {
                region_id: regionStoreId.value,
                country_code: selectedCountryCode.value,
                sort: sortOption.value,
                in_stock_only: inStockOnly.value,
                limit: resultLimit.value
            },
            body: {
                q: queryText.value
            }
        })
    },
    {
        dedupe: "cancel",
        watch: [queryText, regionStoreId, selectedCountryCode, sortOption, inStockOnly, resultLimit]
    }
)

const products = computed<ProductDTO[]>(() => data.value?.products ?? [])
const resultCount = computed<number>(() => Number(data.value?.count ?? products.value.length))
const canLoadMore = computed<boolean>(() => products.value.length < resultCount.value)

useHead(() => ({
    title: queryText.value ? `Search results for ${queryText.value} | Medusa Commerce` : "Search products | Medusa Commerce",
    meta: [
        {
            name: "description",
            content: queryText.value ? `Search the catalog for ${queryText.value}.` : "Search the product catalog."
        },
        { name: "robots", content: "noindex,follow" }
    ]
}))

async function submitSearch(): Promise<void> {
    const nextQuery = searchInput.value.trim()

    if (nextQuery.length < 3) {
        return
    }

    await router.push({ path: "/search", query: { q: nextQuery, sort: sortOption.value, in_stock_only: inStockOnly.value ? "true" : undefined } })
}

async function updateSearchRefinement(nextQuery: Record<string, string | undefined>): Promise<void> {
    await router.push({
        path: "/search",
        query: {
            q: queryText.value,
            sort: nextQuery.sort ?? sortOption.value,
            in_stock_only: nextQuery.in_stock_only ?? (inStockOnly.value ? "true" : undefined),
            limit: nextQuery.limit
        }
    })
}

async function loadMoreResults(): Promise<void> {
    await updateSearchRefinement({ limit: String(Math.min(resultLimit.value + 24, 96)) })
}
</script>

<template>
    <main class="bg-linear-to-b from-brand-50 via-white to-brand-50 pt-28 pb-16 sm:pt-32 lg:pb-20">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <section class="rounded-panel border border-white/80 bg-white/90 p-5 shadow-panel sm:p-7">
                <span class="ui-badge-brand">Search</span>
                <h1 class="mt-4 max-w-3xl text-4xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                    Find products faster.
                </h1>
                <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Search by product name, details, handle, or variant SKU.
                </p>

                <form class="mt-6 flex flex-col gap-3 sm:flex-row" @submit.prevent="submitSearch">
                    <label class="min-w-0 flex-1">
                        <span class="sr-only">Search products</span>
                        <input
                            v-model="searchInput"
                            name="q"
                            type="search"
                            autocomplete="off"
                            placeholder="Search by product name..."
                            class="ui-input shadow-card rounded-2xl border-slate-300 bg-white text-slate-900"
                        />
                    </label>
                    <BaseButton type="submit" variant="accent" class="min-h-12 px-6" :disabled="searchInput.trim().length < 3">
                        Search
                    </BaseButton>
                </form>
            </section>

            <section class="mt-6" aria-live="polite">
                <div v-if="!queryText" class="rounded-3xl border border-white/80 bg-white/90 px-6 py-8 text-center shadow-panel">
                    <h2 class="text-2xl font-semibold text-slate-950">Start with a search term.</h2>
                    <p class="mt-3 text-sm leading-6 text-slate-600">Enter at least 3 characters to search products.</p>
                </div>

                <div v-else-if="queryText.length < 3" class="rounded-3xl border border-white/80 bg-white/90 px-6 py-8 text-center shadow-panel">
                    <h2 class="text-2xl font-semibold text-slate-950">Search term is too short.</h2>
                    <p class="mt-3 text-sm leading-6 text-slate-600">Use at least 3 characters for product search.</p>
                </div>

                <div v-else class="mb-4 flex flex-col gap-3 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
                    <label class="grid gap-1 text-sm font-semibold text-slate-700 sm:min-w-56">
                        <span>Sort results</span>
                        <select
                            :value="sortOption"
                            class="ui-input min-h-11 rounded-2xl bg-white"
                            @change="updateSearchRefinement({ sort: ($event.target as HTMLSelectElement).value, limit: undefined })"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: low to high</option>
                            <option value="price_desc">Price: high to low</option>
                        </select>
                    </label>
                    <label class="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-200"
                            :checked="inStockOnly"
                            @change="updateSearchRefinement({ in_stock_only: ($event.target as HTMLInputElement).checked ? 'true' : undefined, limit: undefined })"
                        />
                        In-stock products only
                    </label>
                </div>

                <div v-if="canSearch && pending" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    <div v-for="n in 6" :key="n" class="rounded-card-sm border border-slate-200 bg-white p-3 shadow-card">
                        <div class="aspect-square w-full animate-pulse rounded-2xl bg-slate-200"></div>
                        <div class="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
                        <div class="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200"></div>
                    </div>
                </div>

                <div v-else-if="canSearch && error" class="grid justify-items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-panel" role="alert">
                    <h2 class="text-2xl font-semibold text-slate-950">Search could not be loaded.</h2>
                    <p class="text-sm leading-6 text-rose-700">Please try again.</p>
                    <BaseButton type="button" variant="accent" @click="refresh">Try again</BaseButton>
                </div>

                <div v-else-if="canSearch && products.length" class="grid gap-4">
                    <p class="text-sm font-semibold text-slate-700">
                        Showing {{ products.length }} of {{ resultCount }} result{{ resultCount === 1 ? "" : "s" }} for "{{ queryText }}"
                    </p>
                    <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                        <ProductCard v-for="product in products" :key="product.id" :product="product" compact />
                    </div>
                    <div v-if="canLoadMore" class="mt-2 flex justify-center">
                        <BaseButton type="button" variant="secondary" class="px-6" @click="loadMoreResults">Load more products</BaseButton>
                    </div>
                </div>

                <div v-else-if="canSearch" class="grid justify-items-center gap-4 rounded-3xl border border-white/80 bg-white/90 px-6 py-8 text-center shadow-panel">
                    <h2 class="text-2xl font-semibold text-slate-950">No products found.</h2>
                    <p class="max-w-xl text-sm leading-6 text-slate-600">Try a different product name, category, or SKU.</p>
                    <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="ui-btn-accent min-h-12 px-6">Browse products</NuxtLink>
                </div>
            </section>
        </div>
    </main>
</template>
