<script setup lang="ts">
import debounce from "lodash-es/debounce"

import type { SearchResponse } from "@/types/interfaces"
import type { ProductDTO } from "@medusajs/types"

import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { ALL_PRODUCTS_URL_HANDLE, PRODUCT_URL_HANDLE } from "~/utils/consts"

const props = defineProps<{
    open: boolean
    regionId: string
    selectedCountryCode: string
}>()

const emit = defineEmits<{
    close: []
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref("")
const searchLoading = ref(false)
const searchResults = ref<ProductDTO[]>([])
const searchHasSearched = ref(false)
const normalizedSearchQuery = computed(() => searchQuery.value.trim())

const runSearch = debounce(async (value: string) => {
    if (value.length < 3) {
        searchResults.value = []
        searchHasSearched.value = false
        searchLoading.value = false
        return
    }

    searchLoading.value = true

    try {
        const response = await $fetch<SearchResponse>("/api/search", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            query: {
                ...(props.regionId ? { region_id: props.regionId } : {}),
                ...(props.selectedCountryCode ? { country_code: props.selectedCountryCode } : {})
            },
            body: {
                q: value
            }
        })

        searchResults.value = response.products.slice(0, 8)
    } catch {
        searchResults.value = []
    } finally {
        searchHasSearched.value = true
        searchLoading.value = false
    }
}, 300)

watch(searchQuery, (value) => {
    if (!props.open) {
        return
    }

    runSearch(value.trim())
})

watch(
    () => props.open,
    async (opened) => {
        if (!opened) {
            searchQuery.value = ""
            searchLoading.value = false
            searchHasSearched.value = false
            searchResults.value = []
            runSearch.cancel()
            return
        }

        await nextTick()
        searchInputRef.value?.focus()
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    runSearch.cancel()
})

function closeSearchDialog(): void {
    emit("close")
}

function getProductPath(handle?: string | null): string {
    return handle ? `${PRODUCT_URL_HANDLE}/${handle}` : ALL_PRODUCTS_URL_HANDLE
}

function getProductMeta(product: ProductDTO): string {
    if (product.collection?.title) {
        return product.collection.title
    }

    if (product.type?.value) {
        return product.type.value
    }

    if (product.subtitle) {
        return product.subtitle
    }

    return "View product details"
}
</script>

<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-70 bg-slate-950/70 p-4 backdrop-blur-sm md:p-6" @click.self="closeSearchDialog">
            <section
                class="mx-auto mt-14 max-h-screen w-full max-w-3xl overflow-hidden rounded-4xl border border-white/60 bg-linear-to-b from-white to-slate-50 shadow-2xl"
            >
                <div class="border-b border-slate-200/80 px-4 py-4 md:px-6">
                    <div class="mb-4 h-px w-full bg-linear-to-r from-slate-400/0 via-amber-500/45 to-slate-400/0"></div>
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p
                                class="text-label-2xs tracking-label inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 font-semibold text-amber-900 uppercase"
                            >
                                Search
                            </p>
                            <h2 class="mt-3 text-lg font-semibold tracking-tight text-slate-950">Search products</h2>
                        </div>
                        <button
                            type="button"
                            class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                            @click="closeSearchDialog"
                        >
                            <span class="sr-only">Close search</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                <path
                                    d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="border-b border-slate-200/80 px-4 py-4 md:px-6">
                    <label>
                        <span class="sr-only">Search by product name</span>
                        <input
                            ref="searchInputRef"
                            v-model="searchQuery"
                            class="ui-input shadow-card rounded-2xl border-slate-300 bg-linear-to-b from-white to-slate-50 text-slate-900"
                            placeholder="Search by product name (min 3 chars)..."
                        />
                    </label>
                    <p class="mt-2 text-sm text-slate-600">
                        <span v-if="normalizedSearchQuery.length < 3">Type at least 3 characters</span>
                        <span v-else-if="searchLoading">Searching...</span>
                        <span v-else-if="searchHasSearched">
                            {{ searchResults.length }} result{{ searchResults.length === 1 ? "" : "s" }}
                        </span>
                    </p>
                </div>

                <div class="max-h-96 overflow-y-auto px-4 py-3 md:px-6 md:py-4">
                    <div v-if="searchLoading" class="flex items-center justify-center py-12" role="status" aria-live="polite">
                        <span class="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-700"></span>
                    </div>

                    <div
                        v-else-if="searchHasSearched && !searchResults.length"
                        class="shadow-card rounded-3xl border border-white/80 bg-white/80 px-4 py-8 text-center text-sm text-slate-600"
                    >
                        No products found.
                    </div>

                    <NuxtLink
                        v-for="product in searchResults"
                        :key="product.id"
                        class="shadow-card flex items-center gap-3 rounded-2xl border border-transparent bg-white/72 px-3 py-3 transition hover:border-amber-200 hover:bg-white"
                        :to="getProductPath(product.handle)"
                        @click="closeSearchDialog"
                    >
                        <NuxtImage
                            :src="product.thumbnail || product.images?.[0]?.url || '/images/about/about-premium.jpg'"
                            :alt="product.title || 'Product image'"
                            width="80"
                            height="80"
                            class="h-20 w-20 rounded-xl bg-slate-100 object-cover"
                        />
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-semibold text-slate-950">{{ product.title }}</p>
                            <p class="truncate text-xs font-medium tracking-wide text-slate-600">{{ getProductMeta(product) }}</p>
                        </div>
                        <span class="text-xs font-semibold tracking-widest text-amber-900">Open</span>
                    </NuxtLink>
                </div>
            </section>
        </div>
    </transition>
</template>
