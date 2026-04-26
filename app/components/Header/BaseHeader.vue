<script setup lang="ts">
import debounce from "lodash-es/debounce"

import type { SearchResponse } from "@/types/interfaces"
import type { ProductDTO } from "@medusajs/types"

import BaseSelect from "~/components/Shared/BaseSelect.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE, PRODUCT_URL_HANDLE } from "~/utils/consts"

const bannerHidden = ref<boolean>(false)
const drawer = ref<boolean>(false)
const searchDialog = ref<boolean>(false)
const searchQuery = ref<string>("")
const searchLoading = ref<boolean>(false)
const searchResults = ref<ProductDTO[]>([])
const searchHasSearched = ref<boolean>(false)
const selectionLoading = ref<boolean>(false)
const normalizedSearchQuery = computed<string>(() => searchQuery.value.trim())
const isClientHydrated = ref<boolean>(false)

const route = useRoute()

const regionStore = useRegionStore()
const { customer } = storeToRefs(useCustomerStore())
const { itemCount } = storeToRefs(useCartStore())
const { categories } = storeToRefs(useProductStore())
const { regionStoreId, availableCountries, selectedCountryCode } = storeToRefs(regionStore)

const topOffset = computed<number>(() => (bannerHidden.value ? 0 : 32))
const headerHeight = 64
const headerOffset = computed<number>(() => (bannerHidden.value ? headerHeight : headerHeight + 32))
const regionId = computed<string>(() => regionStoreId.value ?? "")

const locationItems = computed(() =>
    availableCountries.value.map((country) => ({
        title: country.display_name || country.iso_2.toUpperCase(),
        value: country.iso_2
    }))
)

const locationValue = computed<string>({
    get: () => selectedCountryCode.value ?? "",
    set: (value) => {
        void updateLocation(value)
    }
})

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
                ...(regionId.value ? { region_id: regionId.value } : {}),
                ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {})
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

watch(searchDialog, (opened) => {
    if (!opened) {
        searchQuery.value = ""
        searchLoading.value = false
        searchHasSearched.value = false
        searchResults.value = []
        runSearch.cancel()
    }
})

watch(searchQuery, (value) => {
    if (!searchDialog.value) {
        return
    }

    runSearch(value.trim())
})

watch(
    () => route.fullPath,
    () => {
        drawer.value = false
        searchDialog.value = false
    }
)

watch(
    headerOffset,
    (value) => {
        if (!import.meta.client) {
            return
        }

        document.documentElement.style.setProperty("--site-header-offset", `${value}px`)
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (!import.meta.client) {
        return
    }

    document.documentElement.style.removeProperty("--site-header-offset")
})

onMounted(() => {
    isClientHydrated.value = true
})

function openSearchDialog(): void {
    searchDialog.value = true
}

function closeSearchDialog(): void {
    searchDialog.value = false
}

async function updateLocation(value: string): Promise<void> {
    if (!value || value === selectedCountryCode.value) {
        return
    }

    selectionLoading.value = true

    try {
        regionStore.setCountry(value)
        drawer.value = false
        searchDialog.value = false

        if (import.meta.client) {
            window.location.assign(route.fullPath)
            return
        }

        reloadNuxtApp({ path: route.fullPath })
    } finally {
        selectionLoading.value = false
    }
}

function closeDrawer(): void {
    drawer.value = false
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
    <header class="relative z-50">
        <div
            v-if="!bannerHidden"
            class="fixed inset-x-0 top-0 z-50 h-8 border-b border-white/10 bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 text-white"
        >
            <div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
                <p class="text-label-xs tracking-label-tight truncate font-semibold text-slate-100 uppercase">
                    Free shipping on orders over 35 EUR
                </p>
                <button
                    type="button"
                    class="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-white/15 bg-white/8 text-slate-100 transition hover:bg-white/14 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-hidden"
                    @click="bannerHidden = true"
                >
                    <span class="sr-only">Dismiss shipping notice</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                        <path
                            d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div
            class="shadow-panel fixed inset-x-0 z-40 border-b border-white/70 bg-linear-to-b from-white/95 to-slate-50/90 backdrop-blur-xl"
            :style="{ top: `${topOffset}px` }"
        >
            <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
                <NuxtLink to="/" class="inline-flex shrink-0 items-center">
                    <img
                        src="/images/logo.svg"
                        alt="Medusa Commerce"
                        width="640"
                        height="144"
                        fetchpriority="high"
                        class="block h-8 w-auto sm:h-9"
                    />
                </NuxtLink>

                <nav class="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" :to="ALL_PRODUCTS_URL_HANDLE">
                        All products
                    </NuxtLink>
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" to="/special-offers">
                        Special offers
                    </NuxtLink>
                    <NuxtLink
                        v-for="cat in categories"
                        :key="cat.id"
                        class="text-base font-semibold text-slate-700 transition hover:text-amber-900"
                        :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                    >
                        {{ cat.name }}
                    </NuxtLink>
                </nav>

                <div class="flex items-center gap-2">
                    <label class="hidden items-center gap-2 lg:flex">
                        <span class="hidden items-center gap-1 text-xs font-semibold tracking-wide text-slate-500 uppercase xl:flex">
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                class="h-4 w-4"
                                stroke="currentColor"
                                stroke-width="1.6"
                                aria-hidden="true"
                            >
                                <path
                                    d="M10 18c3.866-3.588 5.8-6.422 5.8-8.5A5.8 5.8 0 1 0 4.2 9.5C4.2 11.578 6.134 14.412 10 18Z"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <circle cx="10" cy="9" r="2" />
                            </svg>
                            Ship to
                        </span>
                        <span class="sr-only">Choose shipping country</span>
                        <BaseSelect
                            v-if="isClientHydrated"
                            v-model="locationValue"
                            class="max-w-44 xl:max-w-48"
                            :options="locationItems"
                            option-label-key="title"
                            :disabled="selectionLoading"
                        />
                        <span v-else class="ui-input shadow-card inline-flex max-w-44 items-center pr-8 text-sm xl:max-w-48">
                            Country
                        </span>
                    </label>

                    <button
                        type="button"
                        class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        @click="openSearchDialog"
                    >
                        <span class="sr-only">Search products</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                        </svg>
                    </button>

                    <NuxtLink to="/cart" class="relative inline-flex">
                        <span
                            class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        >
                            <span class="sr-only">Open cart</span>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                class="h-5 w-5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                aria-hidden="true"
                            >
                                <path
                                    d="M3 4h2l1.2 9.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 2-1.5L20 7H7"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <circle cx="10" cy="19" r="1.4" />
                                <circle cx="17" cy="19" r="1.4" />
                            </svg>
                        </span>
                        <span
                            v-if="isClientHydrated && itemCount"
                            class="bg-accent-500 text-label-xs absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 font-semibold text-slate-950 ring-2 ring-white"
                        >
                            {{ itemCount < 99 ? itemCount : "99+" }}
                        </span>
                    </NuxtLink>

                    <NuxtLink
                        v-if="isClientHydrated && customer?.id"
                        class="shadow-card hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
                        to="/account"
                    >
                        Profile
                    </NuxtLink>
                    <NuxtLink
                        v-else
                        class="shadow-card hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
                        to="/signin"
                    >
                        Sign in
                    </NuxtLink>

                    <button
                        type="button"
                        class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden xl:hidden"
                        @click="drawer = true"
                    >
                        <span class="sr-only">Open menu</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="drawer" class="fixed inset-0 z-60 bg-slate-950/55 backdrop-blur-sm" @click="closeDrawer"></div>
        </transition>

        <aside
            class="fixed right-0 bottom-0 z-65 w-72 overflow-hidden border-l border-white/60 bg-linear-to-b from-slate-50 to-slate-100 shadow-2xl transition-transform duration-300 ease-out sm:w-80"
            :class="drawer ? 'translate-x-0' : 'translate-x-full'"
            :style="{ top: `${topOffset + headerHeight}px` }"
            aria-label="Mobile navigation"
        >
            <div class="flex h-full min-h-0 flex-col">
                <div class="shrink-0 px-4 pt-4 pb-4">
                    <div class="mb-4 h-px w-full bg-linear-to-r from-slate-400/0 via-amber-500/45 to-slate-400/0"></div>

                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p
                                class="text-label-2xs tracking-label inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 font-semibold text-amber-900 uppercase"
                            >
                                Navigation
                            </p>
                            <h2 class="mt-3 text-lg font-semibold tracking-tight text-slate-950">Menu</h2>
                        </div>

                        <button
                            type="button"
                            class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                            @click="closeDrawer"
                        >
                            <span class="sr-only">Close menu</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                <path
                                    d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6">
                    <label class="shadow-panel mt-1 block rounded-3xl border border-white/80 bg-linear-to-b from-white to-slate-50 p-4">
                        <span class="text-label-xs tracking-label mb-2 block font-semibold text-slate-500 uppercase">Country</span>

                        <BaseSelect
                            v-if="isClientHydrated"
                            v-model="locationValue"
                            class="rounded-xl"
                            :options="locationItems"
                            option-label-key="title"
                            :disabled="selectionLoading"
                        />

                        <span v-else class="ui-input shadow-card inline-flex w-full items-center rounded-xl"> Country </span>
                    </label>

                    <nav class="mt-5 grid gap-2" aria-label="Mobile links">
                        <NuxtLink
                            class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                            :to="ALL_PRODUCTS_URL_HANDLE"
                            @click="closeDrawer"
                        >
                            All products
                        </NuxtLink>

                        <NuxtLink
                            class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                            to="/special-offers"
                            @click="closeDrawer"
                        >
                            Special offers
                        </NuxtLink>

                        <NuxtLink
                            v-for="cat in categories"
                            :key="cat.id"
                            class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                            :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                            @click="closeDrawer"
                        >
                            {{ cat.name }}
                        </NuxtLink>

                        <NuxtLink
                            v-if="isClientHydrated && customer?.id"
                            class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                            to="/account"
                            @click="closeDrawer"
                        >
                            Profile
                        </NuxtLink>

                        <NuxtLink
                            v-else
                            class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                            to="/signin"
                            @click="closeDrawer"
                        >
                            Sign in
                        </NuxtLink>
                    </nav>
                </div>
            </div>
        </aside>

        <transition name="fade">
            <div v-if="searchDialog" class="fixed inset-0 z-70 bg-slate-950/70 p-4 backdrop-blur-sm md:p-6" @click.self="closeSearchDialog">
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
    </header>
</template>
